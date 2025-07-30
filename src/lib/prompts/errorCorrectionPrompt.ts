export function errorCorrectionPrompt(
  difficulty: string,
  errorType: string = "mixed",
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

  // Error correction variety elements
  const textGenres = [
    "personal email",
    "news report",
    "blog post",
    "product description",
    "social media update",
    "instruction manual",
    "academic paper",
    "travel review",
    "job application",
    "complaint letter",
    "event invitation",
    "weather forecast",
    "recipe instructions",
    "movie review",
    "sports commentary",
    "health advice",
  ];

  const errorContexts = [
    "formal business writing",
    "casual personal communication",
    "academic discourse",
    "technical documentation",
    "creative storytelling",
    "journalistic reporting",
    "instructional content",
    "social interaction",
    "professional correspondence",
    "educational material",
    "entertainment content",
    "informational text",
    "persuasive writing",
    "descriptive narrative",
    "comparative analysis",
    "procedural explanation",
  ];

  const communicationSituations = [
    "international collaboration",
    "family gathering discussion",
    "customer service interaction",
    "educational presentation",
    "social media engagement",
    "professional networking",
    "cultural exchange",
    "problem-solving session",
    "travel planning",
    "health consultation",
    "hobby sharing",
    "news discussion",
    "event organization",
    "product recommendation",
    "experience sharing",
    "future planning",
  ];

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const genreIndex = seedNum % textGenres.length;
  const contextIndex = (seedNum + 17) % errorContexts.length;
  const situationIndex = (seedNum + 29) % communicationSituations.length;

  const selectedGenre = textGenres[genreIndex];
  const selectedContext = errorContexts[contextIndex];
  const selectedSituation = communicationSituations[situationIndex];

  return `
Create a German error correction exercise for ${difficulty} level learners (English speakers).
Error type focus: ${errorType}

VARIATION CONTEXT (to ensure unique content):
- Text genre: ${selectedGenre}
- Error context: ${selectedContext}
- Communication situation: ${selectedSituation}
- Variation seed: ${variationSeed || "auto-generated"}

IMPORTANT: Use the above context elements to create a UNIQUE error correction exercise that feels fresh and different from previous generations. Write the text as a ${selectedGenre} in the context of ${selectedContext} for a ${selectedSituation}.

Requirements:
- Create a German text with 3-5 deliberate errors
- Errors should be realistic mistakes that learners commonly make
- Provide the correct version and detailed explanations
- Include character positions for each error (start and end positions in the text)
- Make errors appropriate for the difficulty level

Error types to include:
- Grammar: cases, verb conjugation, adjective endings, word order
- Vocabulary: false friends, inappropriate word choice, spelling
- Mixed: combination of grammar and vocabulary errors

Difficulty guidelines:
- A2_BASIC: Basic case errors, simple verb forms, common vocabulary mistakes
- A2_INTERMEDIATE: Modal verbs, past tense, preposition errors
- B1_BASIC: Complex cases, subjunctive, advanced vocabulary
- B1_INTERMEDIATE: Sophisticated grammar, formal/informal register
- B1_ADVANCED: Nuanced errors, cultural/idiomatic mistakes

ANTI-REPETITION REQUIREMENTS:
- Create completely original text content that hasn't been used before
- Use varied vocabulary and contexts from the specified genre and situation
- Choose different names, locations, and specific details for each generation
- Ensure the error context creates distinct types of realistic mistakes
- Make each text feel authentic to the specified genre and communication situation

Return ONLY a valid JSON object with this exact structure:
{
  "instruction": "Find and identify the errors in this German ${selectedGenre} about ${selectedSituation}",
  "incorrectText": "German text written as a ${selectedGenre} in ${selectedContext} style with 3-5 deliberate errors",
  "correctText": "The same text with all errors corrected",
  "errors": [
    {
      "start": 15,
      "end": 23,
      "error": "incorrect word or phrase",
      "correction": "correct word or phrase", 
      "explanation": "explanation of why this is wrong and the rule that applies, contextualized to ${selectedGenre}"
    }
  ],
  "difficulty": "${difficulty}",
  "topic": "type of errors focus contextualized to the communication situation"
}

Make the text meaningful and the errors realistic to what German learners would actually make. Ensure ORIGINALITY by incorporating the variation context naturally.`;
}
