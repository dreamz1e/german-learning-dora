export function batchVocabularyPrompt(
  difficulty: string,
  topic: string,
  variationSeed?: string,
  direction: "german-to-english" | "english-to-german" = "german-to-english"
): string {
  // Simple hash for deterministic variation
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }

  const seedNum = variationSeed ? hashString(variationSeed) : Date.now();
  const contextVariants = [
    "workplace",
    "travel",
    "social",
    "academic",
    "family",
    "shopping",
    "health",
    "culture",
    "technology",
    "environment",
  ];
  const styleVariants = [
    "conversational",
    "formal",
    "practical",
    "descriptive",
    "instructional",
  ];

  const context = contextVariants[seedNum % contextVariants.length];
  const style = styleVariants[(seedNum + 7) % styleVariants.length];
  const isGermanToEnglish = direction === "german-to-english";
  const fromLang = isGermanToEnglish ? "German" : "English";
  const toLang = isGermanToEnglish ? "English" : "German";

  return `You are an expert German language curriculum creator AI. Your task is to generate a batch of high-quality vocabulary exercises. Your response MUST be a single, valid JSON object.

Generate exactly 5 diverse German vocabulary exercises for the ${difficulty} level, focusing on "${topic}".

Variation Context:
- Style: ${style}
- Context: ${context}
- Translation Direction: ${direction}
- Seed: ${variationSeed}

You MUST use the variation context to ensure the generated exercises are unique and distinct from previous requests.

Each of the 5 exercises MUST adhere to the following strict requirements:
1.  **Test a different vocabulary word** within the topic "${topic}". Do not repeat words.
2.  **Provide 4 multiple-choice options**: 1 correct ${toLang} translation and 3 plausible but incorrect ${toLang} distractors.
3.  **The "question" field MUST present the word to be translated**.
4.  **The "correctAnswer" field MUST be the correct ${toLang} translation**. It MUST NOT be the original word from the question.
5.  **Provide a clear, educational explanation** that clarifies the word's meaning and usage.
6.  **Include one German and one English example sentence** demonstrating practical usage.
7.  **AVOID direct cognates** or words that are identical in both languages (e.g., "Laptop," "Hobby").
8.  **Incorporate the style ("${style}") and context ("${context}")** naturally into the exercises.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "batchId": "auto-generated-uuid",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "type": "vocabulary",
      "difficulty": "${difficulty}",
      "question": "What is the ${toLang} translation of '[${fromLang} word]?'",
      "options": ["Correct ${toLang} Translation", "Incorrect ${toLang} Distractor 1", "Incorrect ${toLang} Distractor 2", "Incorrect ${toLang} Distractor 3"],
      "correctAnswer": "Correct ${toLang} Translation",
      "explanation": "A brief but clear explanation of the word's meaning, context, and usage.",
      "topic": "${topic}",
      "germanText": "A practical German example sentence using the word.",
      "englishText": "The corresponding English translation of the sentence."
    }
    // ... exactly 4 more exercise objects
  ]
}
`;
}
