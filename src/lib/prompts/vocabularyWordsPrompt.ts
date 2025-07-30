export const vocabularyWordsPrompt = (count: number, difficulty: string, category?: string) => `
Generate ${count} German vocabulary words for ${difficulty} level learners (English speakers).
${
  category
    ? `Category: ${category}`
    : "Mix of useful everyday words from different categories."
}

Requirements:
- Include German word, English translation, and category
- Add example sentences in German
- Make words practical and commonly used
- Ensure appropriate difficulty level

Focus on high-frequency, useful vocabulary.
`;