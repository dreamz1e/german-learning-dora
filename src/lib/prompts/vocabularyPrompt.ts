export function vocabularyPrompt(difficulty: string, topic?: string): string {
  return `
Create a high-quality German vocabulary exercise for ${difficulty} level learners (English speakers).
${topic ? `Focus on the topic: ${topic}` : "Use practical, everyday vocabulary"}

Requirements:
- Present a German word with multiple choice English translations
- Include 1 correct answer and 3 plausible but incorrect options
- Provide a clear, educational explanation with example usage
- Include a German example sentence and its English translation
- Make distractors believable but clearly wrong to knowledgeable speakers

Guidelines for difficulty:
- A2_BASIC: Common nouns, basic verbs, everyday concepts
- A2_INTERMEDIATE: More complex verbs, adjectives, common idioms
- B1_BASIC: Abstract concepts, professional vocabulary, compound words
- B1_INTERMEDIATE: Nuanced meanings, formal/informal register differences
- B1_ADVANCED: Sophisticated vocabulary, cultural references, complex expressions

Return ONLY a valid JSON object with this exact structure:
{
  "type": "vocabulary",
  "difficulty": "${difficulty}",
  "question": "What does '[German word]' mean in English?",
  "options": ["correct answer", "plausible distractor 1", "plausible distractor 2", "plausible distractor 3"],
  "correctAnswer": "correct answer",
  "explanation": "Brief explanation of the word's meaning and usage context",
  "topic": "word category (e.g., 'food', 'transportation', 'emotions')",
  "germanText": "Natural German sentence using the word in context",
  "englishText": "English translation of the German sentence"
}

Make it educational, practical, and culturally relevant to German-speaking countries.`;
}
