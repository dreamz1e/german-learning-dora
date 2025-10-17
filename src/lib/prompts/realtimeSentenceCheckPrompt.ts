/**
 * Prompt for real-time sentence checking during guided writing
 * Checks grammar, spelling, and punctuation errors
 */

export const realtimeSentenceCheckPrompt = (
  sentence: string,
  difficulty: string,
  context?: string
) => `Check this German sentence for grammar, spelling, and punctuation errors.

Sentence: "${sentence}"
Level: ${difficulty}${context ? `\nContext: ${context}` : ""}

Guidelines:
- Be lenient for incomplete sentences (user is still writing)
- Adjust strictness to ${difficulty} level
- For comma errors before subordinating conjunctions (weil, dass, wenn, ob, als):
  Set "originalText" to " " (space), "start" to space position, "end" to start + 1

Response Schema (JSON only, no other text):
{
  "hasErrors": boolean,
  "errors": [{
    "start": integer,           // 0-indexed position
    "end": integer,             // end position
    "originalText": string,     // exact error (max 100 chars)
    "correctedText": string,    // correction (max 100 chars)
    "errorType": "grammar"|"spelling"|"punctuation",
    "severity": "minor"|"moderate"|"major",
    "shortExplanation": string, // max 100 chars
    "hint": string              // max 150 chars
  }],
  "overallFeedback": string    // encouraging, max 100 chars
}

Examples:

"Ich gehe zu schule." →
{"hasErrors":true,"errors":[{"start":12,"end":18,"originalText":"schule","correctedText":"Schule","errorType":"grammar","severity":"minor","shortExplanation":"Nouns are capitalized in German","hint":"All German nouns start with a capital letter"}],"overallFeedback":"Good start! Watch capitalization."}

"Ich gehe nach Hause weil ich müde bin." →
{"hasErrors":true,"errors":[{"start":19,"end":20,"originalText":" ","correctedText":", ","errorType":"punctuation","severity":"moderate","shortExplanation":"Missing comma before 'weil' (subordinating conjunction)","hint":"Use a comma before subordinating conjunctions like 'weil', 'dass', 'wenn'."}],"overallFeedback":"Good sentence structure! Add comma."}`;
