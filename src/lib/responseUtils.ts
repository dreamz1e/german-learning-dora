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
      // If direct parsing fails, try cleaning the content
      const cleanedContent = cleanJsonResponse(content);
      parsed = JSON.parse(cleanedContent) as T;
    }

    // Validate required fields if provided
    if (requiredFields && typeof parsed === "object" && parsed !== null) {
      validateRequiredFields(parsed as any, requiredFields);
    }

    return parsed;
  } catch (error) {
    console.error("Error processing AI response:", error);
    console.error("Raw content:", content);
    throw new Error("Failed to process AI response: Invalid JSON format");
  }
}

function cleanJsonResponse(content: string): string {
  // Remove any markdown code blocks
  let cleaned = content.replace(/```json\s*\n?/g, "").replace(/```\s*$/g, "");

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  // Fix common JSON string issues by removing problematic characters
  // Remove unescaped newlines, tabs, and carriage returns from string values
  cleaned = cleaned.replace(/([^\\])\n/g, '$1\\n')
                   .replace(/([^\\])\r/g, '$1\\r')
                   .replace(/([^\\])\t/g, '$1\\t');

  // Find JSON start
  const jsonStart = Math.max(cleaned.indexOf("{"), cleaned.indexOf("["));
  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }

  // Try to fix incomplete JSON by adding missing closing braces/brackets
  let braceCount = 0;
  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;
  let lastValidIndex = -1;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0 && bracketCount === 0) {
          lastValidIndex = i;
        }
      } else if (char === "[") {
        bracketCount++;
      } else if (char === "]") {
        bracketCount--;
        if (braceCount === 0 && bracketCount === 0) {
          lastValidIndex = i;
        }
      }
    }
  }

  // If we found a complete JSON object, use it
  if (lastValidIndex > 0) {
    cleaned = cleaned.substring(0, lastValidIndex + 1);
  } else if (braceCount > 0 || bracketCount > 0) {
    // Try to close incomplete JSON
    while (braceCount > 0) {
      cleaned += "}";
      braceCount--;
    }
    while (bracketCount > 0) {
      cleaned += "]";
      bracketCount--;
    }
  }

  // Fix unterminated strings at the end
  if (inString) {
    cleaned += '"';
  }

  return cleaned;
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

