export const grammarPrompt = (difficulty: string, grammarTopic?: string) => `
Create a German grammar exercise for ${difficulty} level learners (English speakers).
${
  grammarTopic
    ? `Focus on: ${grammarTopic}`
    : "Focus on common grammar topics like cases, verb conjugation, word order, or prepositions."
}

Requirements:
- Create a fill-in-the-blank or multiple choice question
- Test practical grammar knowledge
- Include 4 options if multiple choice
- Provide clear explanation of the grammar rule
- Make it contextually relevant

Focus on practical, everyday German usage.
`;