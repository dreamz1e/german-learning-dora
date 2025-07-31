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

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedGenre = textGenres[seedNum % textGenres.length];
  const selectedContext = errorContexts[(seedNum + 17) % errorContexts.length];
  const selectedSituation =
    communicationSituations[(seedNum + 29) % communicationSituations.length];

  return `You are an expert German language curriculum creator AI. Your task is to generate a unique error correction exercise. Your response MUST be a single, valid JSON object.

Create a German error correction exercise for a ${difficulty} level learner. The exercise must focus on "${errorType}" errors.

Variation Context (MUST be used to ensure uniqueness):
- Text Genre: ${selectedGenre}
- Error Context: ${selectedContext}
- Communication Situation: ${selectedSituation}
- Seed: ${variationSeed || "auto-generated"}

You MUST use the variation context to create an original exercise. The text should be written as a ${selectedGenre} in the context of ${selectedContext} for a ${selectedSituation}.

The exercise MUST adhere to the following strict requirements:
1.  **Create a German text** with 3 to 5 deliberate, realistic errors that a ${difficulty} learner would make.
2.  **Provide the fully corrected version** of the text.
3.  **Identify each error** with its precise start and end character positions.
4.  **For each error, specify the incorrect text, the correction, and a clear explanation** of the grammar or vocabulary rule.
5.  **Ensure the errors are appropriate** for the specified ${difficulty} level.
6.  **The text MUST be original** and distinct from previous generations, using the variation context to inspire unique content.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "instruction": "Find and identify the errors in this German ${selectedGenre} about ${selectedSituation}.",
  "incorrectText": "A German text written as a ${selectedGenre} in a ${selectedContext} style, containing 3-5 deliberate errors.",
  "correctText": "The same text with all errors corrected.",
  "errors": [
    {
      "start": 15,
      "end": 23,
      "error": "the incorrect word or phrase",
      "correction": "the correct word or phrase",
      "explanation": "A clear explanation of why the original was wrong and why the correction is right, contextualized to the ${selectedGenre}."
    }
  ],
  "difficulty": "${difficulty}",
  "topic": "A description of the error focus, contextualized to the communication situation."
}
`;
}
