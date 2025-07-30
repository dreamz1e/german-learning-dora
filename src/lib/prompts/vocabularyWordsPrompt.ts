export function vocabularyWordsPrompt(
  count: number,
  difficulty: string,
  category?: string
): string {
  const categoryGuidance =
    category || "mix of useful everyday words from different categories";

  return `
Generate ${count} high-frequency German vocabulary words for ${difficulty} level learners (English speakers).
Category focus: ${categoryGuidance}

Requirements:
- Include practical, commonly used German words
- Add natural example sentences in German
- Ensure words are appropriate for the difficulty level
- Focus on words learners will actually encounter and use
- Include varied word types (nouns, verbs, adjectives, expressions)

Difficulty guidelines:
- A2_BASIC: Essential everyday vocabulary, basic concepts
- A2_INTERMEDIATE: More specific vocabulary, common expressions
- B1_BASIC: Professional/academic vocabulary, abstract concepts
- B1_INTERMEDIATE: Nuanced vocabulary, idiomatic expressions
- B1_ADVANCED: Sophisticated vocabulary, cultural expressions

Word categories to consider:
- Daily life: family, home, routine activities
- Food & drinks: meals, ingredients, restaurants
- Work & education: professions, school, office
- Travel & transportation: vehicles, directions, accommodation
- Health & body: medical terms, body parts, feelings
- Weather & nature: seasons, climate, environment
- Technology & media: internet, phones, entertainment
- Culture & society: traditions, celebrations, social issues

Return ONLY a valid JSON array with this exact structure:
[
  {
    "german": "German word or expression",
    "english": "Accurate English translation",
    "difficulty": "${difficulty}",
    "category": "word category",
    "exampleSentence": "Natural German sentence using the word in authentic context"
  },
  {
    "german": "Another German word",
    "english": "English translation",
    "difficulty": "${difficulty}",
    "category": "word category",
    "exampleSentence": "Another natural German example sentence"
  }
]

Focus on high-frequency, practical vocabulary that will help learners communicate effectively in German.`;
}
