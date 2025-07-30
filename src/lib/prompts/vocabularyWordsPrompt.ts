export function vocabularyWordsPrompt(
  count: number,
  difficulty: string,
  category?: string,
  variationSeed?: string
): string {
  const categoryGuidance =
    category || "mix of useful everyday words from different categories";

  // Simple hash function for consistent variation
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Vocabulary words variety elements
  const thematicFoci = [
    "urban lifestyle",
    "rural traditions",
    "modern technology",
    "environmental awareness",
    "cultural celebrations",
    "professional development",
    "social relationships",
    "health and wellness",
    "educational pursuits",
    "artistic expressions",
    "sports and recreation",
    "culinary experiences",
    "travel adventures",
    "seasonal activities",
    "generational differences",
    "economic trends",
  ];

  const contextualSettings = [
    "formal academic context",
    "casual social interaction",
    "professional workplace",
    "family environment",
    "cultural institutions",
    "commercial establishments",
    "recreational facilities",
    "educational settings",
    "healthcare environments",
    "transportation systems",
    "entertainment venues",
    "community spaces",
    "digital platforms",
    "outdoor activities",
    "formal ceremonies",
    "informal gatherings",
  ];

  const usageEmphases = [
    "everyday communication",
    "professional discussions",
    "academic writing",
    "creative expression",
    "social media interaction",
    "formal presentations",
    "casual conversations",
    "technical descriptions",
    "cultural commentary",
    "personal reflection",
    "news reporting",
    "instructional content",
    "entertainment media",
    "business correspondence",
    "educational materials",
    "artistic works",
  ];

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const themeIndex = seedNum % thematicFoci.length;
  const settingIndex = (seedNum + 19) % contextualSettings.length;
  const usageIndex = (seedNum + 31) % usageEmphases.length;

  const selectedTheme = thematicFoci[themeIndex];
  const selectedSetting = contextualSettings[settingIndex];
  const selectedUsage = usageEmphases[usageIndex];

  return `
Generate ${count} high-frequency German vocabulary words for ${difficulty} level learners (English speakers).
Category focus: ${categoryGuidance}

VARIATION CONTEXT (to ensure unique content):
- Thematic focus: ${selectedTheme}
- Contextual setting: ${selectedSetting}
- Usage emphasis: ${selectedUsage}
- Variation seed: ${variationSeed || "auto-generated"}

IMPORTANT: Use the above context elements to create a UNIQUE vocabulary selection that feels fresh and different from previous generations. Focus on words related to ${selectedTheme} that would be used in ${selectedSetting} for ${selectedUsage}.

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

ANTI-REPETITION REQUIREMENTS:
- Select completely different German words from previous generations
- Use varied vocabulary from the specified thematic focus and contextual setting
- Create original example sentences that reflect the usage emphasis
- Avoid repeating common or predictable word choices
- Ensure each word set feels unique and contextually cohesive

Return ONLY a valid JSON array with this exact structure:
[
  {
    "german": "German word or expression related to ${selectedTheme}",
    "english": "Accurate English translation",
    "difficulty": "${difficulty}",
    "category": "word category reflecting the thematic focus",
    "exampleSentence": "Natural German sentence using the word in ${selectedSetting} for ${selectedUsage}"
  },
  {
    "german": "Another German word from the thematic context",
    "english": "English translation",
    "difficulty": "${difficulty}",
    "category": "word category relevant to the context",
    "exampleSentence": "Another natural German example sentence in the specified setting"
  }
]

Focus on high-frequency, practical vocabulary that will help learners communicate effectively in German. Ensure ORIGINALITY by incorporating the variation context naturally.`;
}
