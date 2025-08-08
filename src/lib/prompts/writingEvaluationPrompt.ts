export function createWritingEvaluationPrompt(
  userText: string,
  difficulty: string,
  originalPrompt?: string
): string {
  const wordCount = userText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return `You are a supportive German language teacher AI. Your goal is to help an English-speaking learner improve their German writing with kind, specific, and actionable feedback. Your response MUST be a single, valid JSON object.

Student's Text:
"""
${userText}
"""
${originalPrompt ? `\nOriginal Prompt:\n"""\n${originalPrompt}\n"""` : ""}

Evaluate the text based on the standards for a ${difficulty} learner. Provide a detailed analysis with balanced, learner-friendly feedback. Be explicit about patterns and how to improve them.

The evaluation MUST adhere to the following requirements (be thorough but encouraging):
1.  Calculate scores (0-100) for grammar, vocabulary, structure, and an overall assessment.
2.  Provide a fully corrected version of the student's text.
3.  Identify grammar, vocabulary, spelling, syntax, punctuation, verb-conjugation, noun-declension, word-order, article-usage, and preposition errors.
4.  For each error, include exact start/end character positions (indices in the original text), the original text, the correction, the error type, severity, and a clear, short explanation.
5.  Use severity levels: minor, moderate, major.
6.  Provide at least 3 concrete positive aspects tied to the text.
7.  Provide 3–5 actionable, specific improvement suggestions (e.g., mini-rules, quick examples, or short practice tips).

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
    "A specific example of what the student did well (e.g., 'Good use of time expressions to sequence events')."
  ],
  "improvementSuggestions": [
    "A specific, actionable area for improvement (e.g., 'Practice verb-second word order in main clauses: e.g., Heute gehe ich einkaufen.')."
  ],
  "difficulty": "${difficulty}",
  "wordCount": ${wordCount}
}
`;
}
