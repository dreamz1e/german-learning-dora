export function createWritingEvaluationPrompt(
  userText: string,
  difficulty: string,
  originalPrompt?: string
): string {
  const wordCount = userText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return `You are a German language teacher. Evaluate this German text written by a ${difficulty} level English-speaking learner.

Student's text: "${userText}"

Provide a detailed evaluation with scores (0-100), error analysis, and feedback. Return your response as valid JSON only.

Required JSON format:
{
  "overallScore": 75,
  "grammarScore": 70,
  "vocabularyScore": 80,
  "structureScore": 75,
  "correctedText": "The fully corrected version of the student's text",
  "errors": [
    {
      "start": 0,
      "end": 5,
      "originalText": "wrong word",
      "correctedText": "correct word",
      "errorType": "grammar",
      "severity": "moderate",
      "explanation": "Brief explanation of the error",
      "suggestion": "How to avoid this error"
    }
  ],
  "positiveAspects": ["What the student did well"],
  "improvementSuggestions": ["Areas to improve"],
  "difficulty": "${difficulty}",
  "wordCount": ${wordCount}
}

Instructions:
- Score based on ${difficulty} level expectations
- Find all grammar, vocabulary, spelling, and structure errors
- Provide exact character positions for each error
- Use error types: grammar, vocabulary, spelling, syntax, punctuation, verb-conjugation, noun-declension, word-order, article-usage, preposition
- Use severity levels: minor, moderate, major
- Give constructive feedback in positiveAspects and improvementSuggestions
- Return only the JSON object, no additional text`;
}
