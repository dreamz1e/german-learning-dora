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
      minWords: 50,
      maxWords: 100,
      complexity: "simple sentences, basic vocabulary, present tense",
    },
    A2_INTERMEDIATE: {
      minWords: 80,
      maxWords: 150,
      complexity: "compound sentences, past tense, common expressions",
    },
    B1_BASIC: {
      minWords: 120,
      maxWords: 200,
      complexity: "complex sentences, varied vocabulary, multiple tenses",
    },
    B1_INTERMEDIATE: {
      minWords: 150,
      maxWords: 250,
      complexity: "sophisticated structure, abstract concepts, register",
    },
    B1_ADVANCED: {
      minWords: 200,
      maxWords: 300,
      complexity: "advanced vocabulary, cultural references, nuance",
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

  return `You are an expert German language curriculum creator AI. Your task is to generate a unique writing exercise prompt. Your response MUST be a single, valid JSON object.

Create a German writing exercise for a ${difficulty} level learner.
- Topic: ${topicGuidance}
- Type: ${exerciseTypes[exerciseType as keyof typeof exerciseTypes]}

Variation Context (MUST be used to ensure uniqueness):
- Writing Context: ${selectedContext}
- Target Audience: ${selectedAudience}
- Writing Purpose: ${selectedPurpose}
- Seed: ${variationSeed || "auto-generated"}

You MUST use the variation context to design a unique prompt as a ${selectedContext} for ${selectedAudience} with the purpose of ${selectedPurpose}.

The exercise MUST adhere to the following strict requirements:
1.  **Provide a clear, engaging writing prompt** that is culturally relevant.
2.  **Include 4-6 specific guidelines** to help structure the writing and focus the learner.
3.  **Set an appropriate word count** (${guidelines.minWords}-${
    guidelines.maxWords
  } words) and complexity level.
4.  **The prompt MUST be original** and distinct from previous generations, inspired by the variation context.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "prompt": "A clear, engaging writing task designed as a ${selectedContext} for ${selectedAudience} with the purpose of ${selectedPurpose}.",
  "difficulty": "${difficulty}",
  "topic": "A specific topic category reflecting the context.",
  "guidelines": [
    "Guideline 1 for structuring the writing (context-specific).",
    "Guideline 2 for content requirements (audience-specific).",
    "Guideline 3 for grammar/vocabulary focus (purpose-specific).",
    "Guideline 4 for style or tone (appropriate for context and audience)."
  ],
  "minWords": ${guidelines.minWords},
  "maxWords": ${guidelines.maxWords}
}
`;
}
