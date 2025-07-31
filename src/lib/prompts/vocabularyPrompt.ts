export function vocabularyPrompt(
  difficulty: string,
  topic?: string,
  variationSeed?: string,
  direction: "german-to-english" | "english-to-german" = "german-to-english"
): string {
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

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

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedScenario = contextScenarios[seedNum % contextScenarios.length];
  const selectedCharacters =
    characterTypes[(seedNum + 5) % characterTypes.length];
  const selectedSetting =
    contextSettings[(seedNum + 11) % contextSettings.length];

  const isGermanToEnglish = direction === "german-to-english";
  const fromLang = isGermanToEnglish ? "German" : "English";
  const toLang = isGermanToEnglish ? "English" : "German";

  return `You are an expert German language curriculum creator AI. Your task is to generate a unique vocabulary exercise. Your response MUST be a single, valid JSON object.

Create a high-quality vocabulary exercise for a ${difficulty} level learner.
- Topic: ${topic || "practical, everyday vocabulary"}
- Direction: ${direction}

Variation Context (MUST be used to ensure uniqueness):
- Scenario: ${selectedScenario}
- Characters: ${selectedCharacters}
- Setting: ${selectedSetting}
- Seed: ${variationSeed || "auto-generated"}

You MUST use the variation context to create an original exercise. Incorporate the scenario, characters, and setting naturally into the content.

The exercise MUST adhere to the following strict requirements:
1.  **Present a ${fromLang} word** and ask for its ${toLang} translation.
2.  **Provide 4 multiple-choice ${toLang} options**: 1 correct translation and 3 plausible but incorrect distractors.
3.  **The "correctAnswer" MUST be the ${toLang} translation**, not the original word.
4.  **Provide a clear, educational explanation** of the word's meaning and usage.
5.  **Include a German example sentence and its English translation**, incorporating the variation context.
6.  **The exercise MUST be original** and distinct from previous generations.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "type": "vocabulary",
  "difficulty": "${difficulty}",
  "question": "What is the ${toLang} translation of the ${fromLang} word '[word]?'",
  "options": ["Correct ${toLang} Translation", "Incorrect ${toLang} Distractor 1", "Incorrect ${toLang} Distractor 2", "Incorrect ${toLang} Distractor 3"],
  "correctAnswer": "Correct ${toLang} Translation",
  "explanation": "A clear explanation of the word's meaning, contextualized with '${selectedScenario}'.",
  "topic": "A word category relevant to the context.",
  "germanText": "A natural German sentence using the word in the context of '${selectedSetting}' with '${selectedCharacters}'.",
  "englishText": "The English translation of the German sentence."
}
`;
}
