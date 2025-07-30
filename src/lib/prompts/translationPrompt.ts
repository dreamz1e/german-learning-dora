export const translationPrompt = (difficulty: string, direction: "german-to-english" | "english-to-german" = "english-to-german") => `
Create a translation exercise for ${difficulty} level German learners (English speakers).
Direction: ${direction}

Requirements:
- Create a practical sentence for translation
- Provide 4 multiple choice options
- Include clear explanation of key grammar/vocabulary
- Use contextually relevant content

Make it practical and educational.
`;