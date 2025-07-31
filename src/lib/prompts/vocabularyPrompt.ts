export function vocabularyPrompt(
  difficulty: string,
  topic?: string,
  variationSeed?: string
): string {
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

  // Variety-generating elements to prevent repetition
  const contextScenarios = [
    "shopping and commerce",
    "restaurant dining",
    "travel experiences",
    "workplace interactions",
    "academic settings",
    "family gatherings",
    "social media usage",
    "healthcare visits",
    "public transportation",
    "cultural events",
    "sports activities",
    "technology discussions",
    "environmental topics",
    "entertainment venues",
    "home life",
    "hobby pursuits",
  ];

  const characterTypes = [
    "university students",
    "working professionals",
    "elderly residents",
    "international visitors",
    "local shopkeepers",
    "family members",
    "healthcare workers",
    "public officials",
    "service employees",
    "community volunteers",
    "creative artists",
    "sports enthusiasts",
  ];

  const contextSettings = [
    "formal business context",
    "casual everyday conversation",
    "academic discussion",
    "social gathering",
    "emergency situation",
    "celebratory occasion",
    "problem-solving scenario",
    "learning environment",
    "customer service interaction",
    "cultural exchange",
    "collaborative project",
    "leisure activity",
  ];

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const scenarioIndex = seedNum % contextScenarios.length;
  const characterIndex = (seedNum + 5) % characterTypes.length;
  const settingIndex = (seedNum + 11) % contextSettings.length;

  const selectedScenario = contextScenarios[scenarioIndex];
  const selectedCharacters = characterTypes[characterIndex];
  const selectedSetting = contextSettings[settingIndex];

  return `
Create a high-quality German vocabulary exercise for ${difficulty} level learners (English speakers).
${topic ? `Focus on the topic: ${topic}` : "Use practical, everyday vocabulary"}

VARIATION CONTEXT (to ensure unique content):
- Scenario focus: ${selectedScenario}
- Character context: ${selectedCharacters}
- Setting type: ${selectedSetting}
- Variation seed: ${variationSeed || "auto-generated"}

IMPORTANT: Use the above context elements to create a UNIQUE vocabulary exercise that feels fresh and different from previous generations. Incorporate the scenario, characters, and setting naturally into your word choice and example sentences.

Requirements:
- Present a German word with multiple choice English translations
- Include 1 correct ENGLISH TRANSLATION and 3 plausible but incorrect ENGLISH OPTIONS
- Provide a clear, educational explanation with example usage
- Include a German example sentence and its English translation
- Make distractors believable but clearly wrong to knowledgeable speakers
- The correctAnswer field MUST be the English translation of the German word, NOT the German word itself

Guidelines for difficulty:
- A2_BASIC: Common nouns, basic verbs, everyday concepts
- A2_INTERMEDIATE: More complex verbs, adjectives, common idioms
- B1_BASIC: Abstract concepts, professional vocabulary, compound words
- B1_INTERMEDIATE: Nuanced meanings, formal/informal register differences
- B1_ADVANCED: Sophisticated vocabulary, cultural references, complex expressions

ANTI-REPETITION REQUIREMENTS:
- Choose completely different German words from previous generations
- Use varied vocabulary from the specified scenario context
- Create original example sentences that incorporate the setting and characters
- Avoid repeating common words or predictable examples
- Make each exercise feel unique and contextually rich

Return ONLY a valid JSON object with this exact structure:
{
  "type": "vocabulary",
  "difficulty": "${difficulty}",
  "question": "What does '[German word]' mean in English?",
  "options": ["correct English translation", "incorrect English option 1", "incorrect English option 2", "incorrect English option 3"],
  "correctAnswer": "correct English translation",
  "explanation": "Brief explanation of the word's meaning and usage context, incorporating scenario: ${selectedScenario}",
  "topic": "word category relevant to the context",
  "germanText": "Natural German sentence using the word in the context of ${selectedSetting} with ${selectedCharacters}",
  "englishText": "English translation of the German sentence"
}

CRITICAL: The correctAnswer MUST be an English translation of the German word, never the German word itself!

Make it educational, practical, and culturally relevant to German-speaking countries. Ensure ORIGINALITY by incorporating the variation context naturally.`;
}
