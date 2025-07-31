export function createWritingEvaluationPrompt(
  userText: string,
  difficulty: string,
  originalPrompt?: string
): string {
  const wordCount = userText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return `You are an expert German language teacher AI. Your task is to evaluate a German text written by a ${difficulty} level English-speaking learner. Your response MUST be a single, valid JSON object.

Student's Text:
"""
${userText}
"""
${originalPrompt ? `\nOriginal Prompt:\n"""\n${originalPrompt}\n"""` : ""}

Evaluate the text based on the standards for a ${difficulty} learner. Provide a detailed analysis with scores, error breakdown, and constructive feedback.

The evaluation MUST adhere to the following strict requirements:
1.  **Calculate scores (0-100)** for grammar, vocabulary, structure, and an overall assessment.
2.  **Provide a fully corrected version** of the student's text.
3.  **Identify all grammar, vocabulary, spelling, and structural errors**.
4.  **For each error, provide the exact start/end character positions**, the original text, the correction, the error type, its severity, and a clear explanation.
5.  **Use specific error types**: grammar, vocabulary, spelling, syntax, punctuation, verb-conjugation, noun-declension, word-order, article-usage, preposition.
6.  **Use clear severity levels**: minor, moderate, major.
7.  **Provide concrete positive feedback** and actionable suggestions for improvement.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "overallScore": 75,
  "grammarScore": 70,
  "vocabularyScore": 80,
  "structureScore": 75,
  "correctedText": "The fully corrected version of the student's text.",
  "errors": [
    {
      "start": 0,
      "end": 5,
      "originalText": "the incorrect word/phrase",
      "correctedText": "the corrected word/phrase",
      "errorType": "grammar",
      "severity": "moderate",
      "explanation": "A brief, clear explanation of the error.",
      "suggestion": "A tip on how to avoid this error in the future."
    }
  ],
  "positiveAspects": [
    "A specific example of what the student did well (e.g., 'Good use of subordinate clauses')."
  ],
  "improvementSuggestions": [
    "A specific, actionable area for improvement (e.g., 'Focus on adjective endings in the dative case')."
  ],
  "difficulty": "${difficulty}",
  "wordCount": ${wordCount}
}
`;
}
