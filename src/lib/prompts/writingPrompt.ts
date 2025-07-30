export function createWritingPrompt(
  difficulty: string,
  topic?: string,
  exerciseType: string = "guided",
  variationSeed?: string
): string {
  const topicGuidance =
    topic || "daily life, personal experiences, or current events";

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

  // Writing-specific variety elements
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

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const contextIndex = seedNum % writingContexts.length;
  const audienceIndex = (seedNum + 9) % audienceTypes.length;
  const purposeIndex = (seedNum + 17) % writingPurposes.length;

  const selectedContext = writingContexts[contextIndex];
  const selectedAudience = audienceTypes[audienceIndex];
  const selectedPurpose = writingPurposes[purposeIndex];

  const difficultyGuidelines = {
    A2_BASIC: {
      minWords: 50,
      maxWords: 100,
      complexity: "simple sentences, basic vocabulary, present tense focus",
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
      complexity:
        "sophisticated structure, abstract concepts, formal/informal register",
    },
    B1_ADVANCED: {
      minWords: 200,
      maxWords: 300,
      complexity:
        "advanced vocabulary, cultural references, nuanced expression",
    },
  };

  const guidelines =
    difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines];

  const exerciseTypes = {
    guided: "structured writing with specific prompts and guidelines",
    creative: "creative storytelling or imaginative writing",
    formal: "formal letter, email, or business communication",
    descriptive: "detailed description of people, places, or events",
  };

  return `
  Create a German writing exercise for ${difficulty} level learners (English speakers).
  Topic: ${topicGuidance}
  Exercise type: ${exerciseTypes[exerciseType as keyof typeof exerciseTypes]}

  VARIATION CONTEXT (to ensure unique content):
  - Writing context: ${selectedContext}
  - Target audience: ${selectedAudience}
  - Writing purpose: ${selectedPurpose}
  - Variation seed: ${variationSeed || "auto-generated"}

  IMPORTANT: Use the above context elements to create a UNIQUE writing exercise that feels fresh and different from previous generations. Design the prompt as a ${selectedContext} for ${selectedAudience} with the purpose of ${selectedPurpose}.
  
  Requirements:
  - Provide a clear, engaging writing prompt
  - Include 4-6 specific guidelines to help structure the writing
  - Set appropriate word count (${guidelines.minWords}-${
    guidelines.maxWords
  } words)
  - Ensure the task matches the complexity level: ${guidelines.complexity}
  - Make it practical and relevant to real-world communication

  ANTI-REPETITION REQUIREMENTS:
  - Create completely original writing scenarios that haven't been used before
  - Use varied locations, situations, and specific details
  - Ensure the audience and purpose create a unique writing challenge
  - Incorporate fresh vocabulary and context relevant to the scenario
  - Make each prompt feel distinct and engaging
  
  Return ONLY a valid JSON object with this exact structure:
  {
    "prompt": "Clear, engaging writing task designed as a ${selectedContext} for ${selectedAudience} with the purpose of ${selectedPurpose}",
    "difficulty": "${difficulty}",
    "topic": "specific topic category reflecting the context",
    "guidelines": [
      "Guideline 1 for structuring the writing (context-specific)",
      "Guideline 2 for content requirements (audience-specific)", 
      "Guideline 3 for grammar/vocabulary focus (purpose-specific)",
      "Guideline 4 for style or tone (appropriate to context and audience)"
    ],
    "minWords": ${guidelines.minWords},
    "maxWords": ${guidelines.maxWords}
  }
  
  Make the prompt engaging and culturally relevant to German-speaking countries. Ensure ORIGINALITY by incorporating the variation context naturally.`;
}
