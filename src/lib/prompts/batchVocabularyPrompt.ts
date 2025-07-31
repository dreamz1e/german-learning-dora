export function batchVocabularyPrompt(
  difficulty: string,
  topic: string,
  variationSeed?: string
): string {
  // Simple hash for deterministic variation
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }

  const seedNum = variationSeed ? hashString(variationSeed) : Date.now();
  const contextVariants = [
    "workplace",
    "travel",
    "social",
    "academic",
    "family",
    "shopping",
    "health",
    "culture",
    "technology",
    "environment",
  ];
  const styleVariants = [
    "conversational",
    "formal",
    "practical",
    "descriptive",
    "instructional",
  ];

  const context = contextVariants[seedNum % contextVariants.length];
  const style = styleVariants[(seedNum + 7) % styleVariants.length];

  return `Generate 5 diverse German vocabulary exercises for ${difficulty} level about "${topic}".

Context: ${context} setting, ${style} style
Seed: ${variationSeed}

Each exercise must:
- Test different German words within the topic
- Include 4 options (1 correct ENGLISH TRANSLATION, 3 incorrect ENGLISH distractors)
- Have clear explanations
- Include German + English example sentences
- The correctAnswer field MUST be the English translation of the German word, NOT the German word itself

Return JSON:
{
  "batchId": "auto-generated",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "type": "vocabulary",
      "difficulty": "${difficulty}",
      "question": "What does '[German word]' mean in English?",
      "options": ["correct English translation", "incorrect English option 1", "incorrect English option 2", "incorrect English option 3"],
      "correctAnswer": "correct English translation",
      "explanation": "Brief explanation with context",
      "topic": "${topic}",
      "germanText": "German example sentence",
      "englishText": "English translation"
    }
    // ... 4 more exercises
  ]
}

Focus on practical, high-frequency vocabulary. Ensure variety and avoid repetition.

CRITICAL: The correctAnswer MUST always be an English translation of the German word being tested, never the German word itself!`;
}
