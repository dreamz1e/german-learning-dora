export function vocabularyWordsPrompt(
  count: number,
  difficulty: string,
  category?: string,
  variationSeed?: string
): string {
  const categoryGuidance =
    category ||
    "a mix of useful, high-frequency words from different categories";

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

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

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedTheme = thematicFoci[seedNum % thematicFoci.length];
  const selectedSetting =
    contextualSettings[(seedNum + 19) % contextualSettings.length];
  const selectedUsage = usageEmphases[(seedNum + 31) % usageEmphases.length];

  return `You are an expert German language curriculum creator AI. Your task is to generate a list of vocabulary words. Your response MUST be a single, valid JSON array.

Generate exactly ${count} high-frequency German vocabulary words for a ${difficulty} level learner.
- Category Focus: ${categoryGuidance}

Variation Context (MUST be used to ensure uniqueness):
- Thematic Focus: ${selectedTheme}
- Contextual Setting: ${selectedSetting}
- Usage Emphasis: ${selectedUsage}
- Seed: ${variationSeed || "auto-generated"}

You MUST use the variation context to generate a unique and cohesive word list related to the theme, setting, and usage.

Each item in the list MUST adhere to the following strict requirements:
1.  **Include a practical, commonly used German word** or expression.
2.  **Provide an accurate English translation**.
3.  **Include a natural German example sentence** that demonstrates the word's usage in the specified context.
4.  **The words MUST be appropriate** for the ${difficulty} level.
5.  **The list MUST be original** and distinct from previous generations.

The output MUST be a single, valid JSON array with the specified number of objects. Do NOT include any markdown, comments, or other text outside of the JSON.
[
  {
    "german": "A German word or expression related to '${selectedTheme}'",
    "english": "The accurate English translation",
    "difficulty": "${difficulty}",
    "category": "A word category reflecting the thematic focus",
    "exampleSentence": "A natural German sentence demonstrating the word's usage in '${selectedSetting}' for '${selectedUsage}'."
  }
]
`;
}
