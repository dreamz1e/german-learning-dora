// Utility functions for processing AI responses

export function processAIResponse<T>(
  content: string,
  requiredFields?: string[]
): T {
  try {
    // First try to parse the content directly as it might already be valid JSON
    let parsed: T;

    try {
      parsed = JSON.parse(content) as T;
    } catch (directParseError) {
      console.log(
        "Direct JSON parsing failed, attempting to clean and repair..."
      );

      // If direct parsing fails, try cleaning the content
      const cleanedContent = cleanJsonResponse(content);
      console.log(
        "Cleaned content:",
        cleanedContent.substring(0, 500) +
          (cleanedContent.length > 500 ? "..." : "")
      );

      try {
        parsed = JSON.parse(cleanedContent) as T;
        console.log("Successfully parsed cleaned JSON");
      } catch (cleanedParseError) {
        console.error(
          "Failed to parse even after cleaning:",
          cleanedParseError
        );
        throw cleanedParseError;
      }
    }

    // Validate required fields if provided
    if (requiredFields && typeof parsed === "object" && parsed !== null) {
      validateRequiredFields(parsed as any, requiredFields);
    }

    return parsed;
  } catch (error) {
    console.error("Error processing AI response:", error);
    console.error("Raw content:", content);
    console.error("Content length:", content.length);
    console.error(
      "Content preview:",
      content.substring(0, 200) + (content.length > 200 ? "..." : "")
    );

    // Try to provide more specific error information
    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const context = content.substring(
          Math.max(0, position - 50),
          position + 50
        );
        console.error(`Syntax error near position ${position}: "${context}"`);
      }
    }

    throw new Error(
      `Failed to process AI response: ${
        error instanceof Error ? error.message : "Invalid JSON format"
      }`
    );
  }
}

function cleanJsonResponse(content: string): string {
  // Remove any markdown code blocks
  let cleaned = content.replace(/```json\s*\n?/g, "").replace(/```\s*$/g, "");

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  // Fix common JSON string issues by removing problematic characters
  // Remove unescaped newlines, tabs, and carriage returns from string values
  cleaned = cleaned
    .replace(/([^\\])\n/g, "$1\\n")
    .replace(/([^\\])\r/g, "$1\\r")
    .replace(/([^\\])\t/g, "$1\\t");

  // Find JSON start
  const jsonStart = Math.max(cleaned.indexOf("{"), cleaned.indexOf("["));
  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }

  // Advanced JSON repair: handle unterminated strings and incomplete structures
  cleaned = repairIncompleteJson(cleaned);

  return cleaned;
}

function repairIncompleteJson(json: string): string {
  let result = "";
  let braceCount = 0;
  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;
  let lastValidIndex = -1;
  let stringStartIndex = -1;

  for (let i = 0; i < json.length; i++) {
    const char = json[i];

    if (escapeNext) {
      escapeNext = false;
      result += char;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      result += char;
      continue;
    }

    if (char === '"' && !escapeNext) {
      if (!inString) {
        stringStartIndex = i;
        inString = true;
      } else {
        inString = false;
        stringStartIndex = -1;
      }
      result += char;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        braceCount++;
        result += char;
      } else if (char === "}") {
        braceCount--;
        result += char;
        if (braceCount === 0 && bracketCount === 0) {
          lastValidIndex = result.length - 1;
        }
      } else if (char === "[") {
        bracketCount++;
        result += char;
      } else if (char === "]") {
        bracketCount--;
        result += char;
        if (braceCount === 0 && bracketCount === 0) {
          lastValidIndex = result.length - 1;
        }
      } else {
        result += char;
      }
    } else {
      // We're inside a string
      if (char === "\n" || char === "\r") {
        // Unescaped newline/carriage return in string - this is likely where truncation occurred
        // Close the string and try to continue parsing
        result += '"';
        inString = false;
        stringStartIndex = -1;

        // Skip this character and any following whitespace
        while (i + 1 < json.length && /\s/.test(json[i + 1])) {
          i++;
        }

        // Check if we need to add a comma and continue with the next property
        if (
          i + 1 < json.length &&
          json[i + 1] !== "," &&
          json[i + 1] !== "}" &&
          json[i + 1] !== "]"
        ) {
          // Look ahead to see if there's a property name or closing brace coming
          let nextNonSpace = i + 1;
          while (nextNonSpace < json.length && /\s/.test(json[nextNonSpace])) {
            nextNonSpace++;
          }

          if (nextNonSpace < json.length && json[nextNonSpace] === '"') {
            result += ",";
          }
        }
      } else {
        result += char;
      }
    }
  }

  // If we ended while still in a string, close it
  if (inString) {
    result += '"';
  }

  // If we have a complete JSON object/array, use just that part
  if (lastValidIndex > 0) {
    result = result.substring(0, lastValidIndex + 1);
  } else {
    // Add missing closing braces/brackets
    while (braceCount > 0) {
      result += "}";
      braceCount--;
    }
    while (bracketCount > 0) {
      result += "]";
      bracketCount--;
    }
  }

  return result;
}

function validateRequiredFields(
  obj: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter((field) => {
    const value = obj[field];

    // Check for undefined, null, or empty string
    if (value === undefined || value === null) {
      return true;
    }

    // For strings, check if empty
    if (typeof value === "string" && value.trim() === "") {
      return true;
    }

    // For arrays, check if empty
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    return false;
  });

  if (missingFields.length > 0) {
    console.error("Object received:", obj);
    console.error("Required fields:", requiredFields);
    console.error("Missing fields:", missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
}

// Utility function to validate array responses
export function validateArrayResponse<T>(
  data: any,
  minLength: number = 1,
  maxLength: number = 10
): T[] {
  if (!Array.isArray(data)) {
    throw new Error("Expected array response from AI");
  }

  if (data.length < minLength) {
    throw new Error(
      `Array too short: expected at least ${minLength} items, got ${data.length}`
    );
  }

  if (data.length > maxLength) {
    throw new Error(
      `Array too long: expected at most ${maxLength} items, got ${data.length}`
    );
  }

  return data as T[];
}

// Utility function to sanitize strings from AI responses
export function sanitizeString(str: string, maxLength: number = 1000): string {
  if (typeof str !== "string") {
    return "";
  }

  // Remove any potentially harmful content
  let sanitized = str
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + "...";
  }

  return sanitized;
}
