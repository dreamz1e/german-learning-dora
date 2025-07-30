export const vocabularyPrompt = (difficulty: string, topic?: string) => `
Create a German vocabulary exercise for ${difficulty} level learners (English speakers).
${topic ? `Focus on the topic: ${topic}` : ""}

Requirements:
- Present a German word with multiple choice English translations
- Include 1 correct answer and 3 plausible incorrect options
- Provide a clear explanation
- Include an example German sentence using the word

The response should be educational and appropriate for language learners.
Make it practical and commonly used vocabulary.
`;