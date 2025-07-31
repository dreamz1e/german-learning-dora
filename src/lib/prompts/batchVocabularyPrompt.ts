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

  return `Generate 5 diverse German vocabulary exercises for ${difficulty} level about "${topic}".

Context: ${context} setting, ${style} style
Translation direction: ${direction}
Seed: ${variationSeed}

Each exercise must:
- Test different ${
    isGermanToEnglish ? "German words" : "English words"
  } within the topic
- Include 4 options (1 correct ${
    isGermanToEnglish ? "ENGLISH TRANSLATION" : "GERMAN TRANSLATION"
  }, 3 incorrect ${isGermanToEnglish ? "ENGLISH" : "GERMAN"} distractors)
- Have clear explanations
- Include German + English example sentences
- The correctAnswer field MUST be the ${
    isGermanToEnglish
      ? "English translation of the German word"
      : "German translation of the English word"
  }, NOT the ${isGermanToEnglish ? "German word itself" : "English word itself"}
- DO NOT use words, which translate to the same word in the other language (e.g. "Laptop" and "Laptop" or "Smartphone" and "Smartphone");

Return JSON:
{
  "batchId": "auto-generated",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "type": "vocabulary",
      "difficulty": "${difficulty}",
      "question": "${
        isGermanToEnglish
          ? "What does '[German word]' mean in English?"
          : "What is the German translation of '[English word]'?"
      }",
      "options": [${
        isGermanToEnglish
          ? '"correct English translation", "incorrect English option 1", "incorrect English option 2", "incorrect English option 3"'
          : '"correct German translation", "incorrect German option 1", "incorrect German option 2", "incorrect German option 3"'
      }],
      "correctAnswer": "${
        isGermanToEnglish
          ? "correct English translation"
          : "correct German translation"
      }",
      "explanation": "Brief explanation with context",
      "topic": "${topic}",
      "germanText": "German example sentence",
      "englishText": "English translation"
    }
    // ... 4 more exercises
  ]
}

Focus on practical, high-frequency vocabulary. Ensure variety and avoid repetition.

CRITICAL: The correctAnswer MUST always be ${
    isGermanToEnglish
      ? "an English translation of the German word being tested, never the German word itself"
      : "a German translation of the English word being tested, never the English word itself"
  }!`;
}
