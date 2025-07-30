/**
 * Utility functions for cleaning and parsing AI responses
 */

/**
 * Cleans raw AI response content to ensure proper JSON parsing
 * @param content - Raw content from AI response
 * @returns Cleaned JSON string
 */
export function cleanAIResponse(content: string): string {
  if (!content) {
    throw new Error("Empty response content");
  }

  // Remove markdown code blocks if present
  let cleaned = content.trim();

  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```\s*$/i, "");

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  // Remove any text before the first { or [
  const jsonStart = Math.min(
    cleaned.indexOf("{") === -1 ? Infinity : cleaned.indexOf("{"),
    cleaned.indexOf("[") === -1 ? Infinity : cleaned.indexOf("[")
  );

  if (jsonStart === Infinity) {
    throw new Error("No valid JSON structure found in response");
  }

  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }

  // Remove any text after the last } or ]
  let jsonEnd = -1;
  let braceCount = 0;
  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;

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

    if (inString) continue;

    if (char === "{") braceCount++;
    else if (char === "}") {
      braceCount--;
      if (braceCount === 0) jsonEnd = i;
    } else if (char === "[") bracketCount++;
    else if (char === "]") {
      bracketCount--;
      if (bracketCount === 0) jsonEnd = i;
    }
  }

  if (jsonEnd > -1) {
    cleaned = cleaned.substring(0, jsonEnd + 1);
  }

  return cleaned;
}

/**
 * Safely parses JSON with error handling and validation
 * @param jsonString - JSON string to parse
 * @returns Parsed JSON object
 */
export function safeJSONParse<T>(jsonString: string): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.error("Problematic JSON string:", jsonString);
    throw new Error(
      `Failed to parse JSON response: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Validates that required fields are present in the parsed object
 * @param obj - Parsed object to validate
 * @param requiredFields - Array of required field names
 */
export function validateRequiredFields(
  obj: any,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Complete pipeline for processing AI response
 * @param content - Raw AI response content
 * @param requiredFields - Optional array of required fields to validate
 * @returns Parsed and validated object
 */
export function processAIResponse<T>(
  content: string,
  requiredFields?: string[]
): T {
  const cleaned = cleanAIResponse(content);
  const parsed = safeJSONParse<T>(cleaned);

  if (requiredFields) {
    validateRequiredFields(parsed, requiredFields);
  }

  return parsed;
}
