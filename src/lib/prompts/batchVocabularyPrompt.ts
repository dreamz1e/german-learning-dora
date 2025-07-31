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

  return `You are an expert German language curriculum creator AI. Follow the STRICT PROTOCOL below to generate a fail-proof batch of vocabulary exercises.

================ GENERATION PROTOCOL (read carefully, DO NOT output) ================
1. INTERNAL_PLAN: Silently think through 5 distinct words related to "${topic}" appropriate for the ${difficulty} level and the "${direction}" translation direction.
2. SELF_CHECK: Ensure that
   • exactly 5 exercises are present.
   • no repeated words across exercises.
   • every "options" array has 4 UNIQUE strings.
   • "correctAnswer" is in the options and is NOT a direct cognate.
   • the JSON strictly matches the schema below.
   If ANY check fails, regenerate BEFORE responding.
3. OUTPUT: Once all checks pass, emit ONLY the JSON object—no markdown, no comments.

================ GOLD-STANDARD EXAMPLE (for internal reference, DO NOT output) ======
{
  "type": "vocabulary",
  "difficulty": "A2",
  "question": "What is the English translation of 'das Gericht'?",
  "options": ["dish", "court", "right", "story"],
  "correctAnswer": "dish",
  "explanation": "'Gericht' in culinary contexts means a prepared dish. It can also mean court of law in other contexts, which serves as a plausible distractor.",
  "topic": "Food",
  "germanText": "Dieses Gericht schmeckt besonders gut mit frischen Kräutern.",
  "englishText": "This dish tastes especially good with fresh herbs."
}

================ TASK =================================================================

Generate EXACTLY 5 diverse German vocabulary exercises for the ${difficulty} level, focusing on "${topic}".

Variation Context:
- Style: ${style}
- Context: ${context}
- Translation Direction: ${direction}
- Seed: ${variationSeed}

Exercise Requirements:

1. **Distinct Words Rule** — each exercise tests a DIFFERENT vocabulary word; do NOT repeat.
2. Provide **4 multiple-choice options** (1 correct translation into ${toLang} + 3 plausible ${toLang} distractors).
3. The "question" must ask for the ${toLang} translation of the ${fromLang} word.
4. The "correctAnswer" must be the proper translation, NOT the original word.
5. Include a **concise educational explanation**.
6. Provide **one German and one English example sentence** demonstrating practical usage.
7. **Avoid direct cognates** (e.g., "Laptop", "Hobby").
8. Naturally integrate style ("${style}") and context ("${context}") in sentences.

================ OUTPUT FORMAT ======================================================
Return ONE valid JSON object and NOTHING else.

{
  "batchId": "auto-generated-uuid",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "type": "vocabulary",
      "difficulty": "${difficulty}",
      "question": "What is the ${toLang} translation of '[${fromLang} word]'?",
      "options": ["Correct ${toLang} Translation", "Distractor 1", "Distractor 2", "Distractor 3"],
      "correctAnswer": "Correct ${toLang} Translation",
      "explanation": "A brief explanation of meaning and usage.",
      "topic": "${topic}",
      "germanText": "A German example sentence.",
      "englishText": "The corresponding English translation."
    }
    // ... exactly 4 more exercise objects
  ]
}`;
}
