export function createWritingPrompt(
  difficulty: string,
  topic?: string,
  exerciseType: string = "guided"
): string {
  const topicGuidance =
    topic || "daily life, personal experiences, or current events";

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
  
  Requirements:
  - Provide a clear, engaging writing prompt
  - Include 4-6 specific guidelines to help structure the writing
  - Set appropriate word count (${guidelines.minWords}-${
    guidelines.maxWords
  } words)
  - Ensure the task matches the complexity level: ${guidelines.complexity}
  - Make it practical and relevant to real-world communication
  
  Return ONLY a valid JSON object with this exact structure:
  {
    "prompt": "Clear, engaging writing task in English",
    "difficulty": "${difficulty}",
    "topic": "specific topic category",
    "guidelines": [
      "Guideline 1 for structuring the writing",
      "Guideline 2 for content requirements", 
      "Guideline 3 for grammar/vocabulary focus",
      "Guideline 4 for style or tone"
    ],
    "minWords": ${guidelines.minWords},
    "maxWords": ${guidelines.maxWords}
  }
  
  Make the prompt engaging and culturally relevant to German-speaking countries.`;
}
