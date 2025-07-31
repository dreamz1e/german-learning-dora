export function translationPrompt(
  difficulty: string,
  direction: string,
  variationSeed?: string
): string {
  const fromLang = direction === "english-to-german" ? "English" : "German";
  const toLang = direction === "english-to-german" ? "German" : "English";

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  const communicationContexts = [
    "business correspondence",
    "casual social interaction",
    "academic discussion",
    "travel communication",
    "medical consultation",
    "customer service",
    "family conversation",
    "media interview",
    "technical instruction",
    "cultural exchange",
    "emergency situation",
    "entertainment review",
    "educational content",
    "legal documentation",
    "artistic description",
    "sports commentary",
  ];

  const functionalPurposes = [
    "expressing opinions",
    "giving instructions",
    "making requests",
    "describing experiences",
    "comparing options",
    "explaining processes",
    "sharing emotions",
    "providing directions",
    "making complaints",
    "offering help",
    "asking questions",
    "making suggestions",
    "narrating events",
    "expressing preferences",
    "giving advice",
    "making announcements",
  ];

  const registerStyles = [
    "formal professional",
    "casual friendly",
    "academic scholarly",
    "conversational informal",
    "polite respectful",
    "direct assertive",
    "diplomatic careful",
    "enthusiastic expressive",
    "technical precise",
    "creative artistic",
    "journalistic objective",
    "personal intimate",
  ];

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedContext =
    communicationContexts[seedNum % communicationContexts.length];
  const selectedPurpose =
    functionalPurposes[(seedNum + 11) % functionalPurposes.length];
  const selectedRegister =
    registerStyles[(seedNum + 19) % registerStyles.length];

  return `You are an expert German language curriculum creator AI. Your task is to generate a unique translation exercise. Your response MUST be a single, valid JSON object.

Create a translation exercise for a ${difficulty} level learner.
- Direction: ${fromLang} to ${toLang}

Variation Context (MUST be used to ensure uniqueness):
- Communication Context: ${selectedContext}
- Functional Purpose: ${selectedPurpose}
- Register Style: ${selectedRegister}
- Seed: ${variationSeed || "auto-generated"}

You MUST use the variation context to create an original sentence that fits the specified context, purpose, and register.

The exercise MUST adhere to the following strict requirements:
1.  **Create a practical, authentic sentence** for translation that is appropriate for the ${difficulty} level.
2.  **Provide 4 multiple-choice options**: 1 correct translation and 3 plausible distractors that test common errors.
3.  **Include a clear explanation** of the grammar, vocabulary, and cultural nuances that make the correct answer the best choice.
4.  **Ensure the exercise is original** and distinct from previous generations, inspired by the variation context.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "type": "translation",
  "difficulty": "${difficulty}",
  "question": "Translate to ${toLang}: '[${fromLang} sentence reflecting ${selectedContext}, ${selectedRegister} style]'",
  "options": ["Correct Translation", "Distractor with Grammar Error", "Distractor with Vocabulary Error", "Distractor with Word Order Error"],
  "correctAnswer": "Correct Translation",
  "explanation": "A clear explanation of the translation choices, contextualized with: ${selectedContext} for ${selectedPurpose}.",
  "topic": "translation"
}
`;
}
