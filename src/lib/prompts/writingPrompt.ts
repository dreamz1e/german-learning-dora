export function createWritingPrompt(
  difficulty: string,
  topic?: string,
  exerciseType: string = "guided",
  variationSeed?: string
): string {
  const topicGuidance =
    topic || "daily life, personal experiences, or current events";

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  const writingContexts = [
    "personal memoir",
    "professional proposal",
    "travel journal",
    "product review",
    "social commentary",
    "instructional guide",
    "complaint letter",
    "thank you note",
    "event planning",
    "problem-solving essay",
    "cultural comparison",
    "future prediction",
    "advice column",
    "news report",
    "interview transcript",
    "creative storytelling",
  ];

  const audienceTypes = [
    "close friends",
    "professional colleagues",
    "family members",
    "potential employers",
    "service providers",
    "community leaders",
    "academic peers",
    "online audience",
    "government officials",
    "healthcare providers",
    "educational institutions",
    "business partners",
    "cultural organizations",
    "environmental groups",
    "social media followers",
    "local residents",
  ];

  const writingPurposes = [
    "persuading and convincing",
    "informing and educating",
    "entertaining and engaging",
    "requesting assistance",
    "expressing gratitude",
    "solving problems",
    "sharing experiences",
    "providing instructions",
    "making complaints",
    "celebrating achievements",
    "analyzing situations",
    "making recommendations",
    "describing processes",
    "comparing options",
    "narrating events",
    "expressing opinions",
  ];

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedContext = writingContexts[seedNum % writingContexts.length];
  const selectedAudience = audienceTypes[(seedNum + 9) % audienceTypes.length];
  const selectedPurpose =
    writingPurposes[(seedNum + 17) % writingPurposes.length];

  const difficultyGuidelines = {
    A2_BASIC: {
      minWords: 30,
      maxWords: 80,
      complexity: "very simple sentences, everyday vocabulary, present tense",
    },
    A2_INTERMEDIATE: {
      minWords: 50,
      maxWords: 120,
      complexity:
        "short compound sentences, familiar past tense forms, common phrases",
    },
    B1_BASIC: {
      minWords: 70,
      maxWords: 150,
      complexity:
        "mostly simple sentences with a few complex ones, varied common vocabulary",
    },
    B1_INTERMEDIATE: {
      minWords: 90,
      maxWords: 200,
      complexity:
        "mix of simple and complex sentences, some abstract ideas, appropriate register",
    },
    B1_ADVANCED: {
      minWords: 110,
      maxWords: 220,
      complexity: "clear structure, broader vocabulary, light nuance",
    },
  };

  const guidelines =
    difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines];

  const exerciseTypes = {
    guided: "structured writing with specific prompts",
    creative: "creative storytelling or imaginative writing",
    formal: "formal letter, email, or business communication",
    descriptive: "detailed description of people, places, or events",
  };

  return `You are an encouraging German language tutor AI. Your task is to generate a simple, flexible writing exercise prompt. Your response MUST be a single, valid JSON object. Make the task bilingual using structured fields: provide separate German and English fields.

Create a German writing exercise for a ${difficulty} level learner.
- Topic: ${topicGuidance}
- Type: ${exerciseTypes[exerciseType as keyof typeof exerciseTypes]}

Variation Context (use for inspiration to keep outputs varied):
- Writing Context: ${selectedContext}
- Target Audience: ${selectedAudience}
- Writing Purpose: ${selectedPurpose}
- Seed: ${variationSeed || "auto-generated"}

Use the variation context to design a unique prompt as a ${selectedContext} for ${selectedAudience} with the purpose of ${selectedPurpose}. Keep the task open-ended and learner-friendly.

Please follow these learner-friendly requirements (keep it simple and flexible):
1.  Provide a clear, friendly writing prompt in BOTH German and English using two fields: promptDe and promptEn (German is the primary prompt).
2.  Include 3-4 short, optional suggestions to help structure ideas (not strict rules). Each suggestion MUST be an object with fields: { "de": "...", "en": "..." }.
3.  Set a suggested word range (${guidelines.minWords}-${
    guidelines.maxWords
  } words) and note the expected complexity level: ${guidelines.complexity}.
4.  Ensure the prompt is original and distinct from previous generations, taking inspiration from the variation context.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "promptDe": "Eine klare, freundliche Schreibaufgabe als ${selectedContext} für ${selectedAudience} mit dem Zweck ${selectedPurpose}.",
  "promptEn": "A clear, friendly writing task designed as a ${selectedContext} for ${selectedAudience} with the purpose of ${selectedPurpose}.",
  "difficulty": "${difficulty}",
  "topic": "A specific topic category reflecting the context.",
  "guidelines": [
    { "de": "Kurzer Starttipp (kontextbezogen).", "en": "Short suggestion to get started (context-specific)." },
    { "de": "Hinweis, was enthalten sein könnte (zielgruppenbezogen).", "en": "Tip about what to include (audience-specific)." },
    { "de": "Hilfreicher Sprachfokus (zweckbezogen, optional).", "en": "Helpful language focus (purpose-specific, optional)." },
    { "de": "Hinweis zum Stil/Ton (optional).", "en": "Style/tone suggestion (optional)." }
  ],
  "minWords": ${guidelines.minWords},
  "maxWords": ${guidelines.maxWords}
}
`;
}
