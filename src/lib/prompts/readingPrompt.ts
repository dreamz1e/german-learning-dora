export const readingPrompt = (difficulty: string, topic?: string) => `
Create a German reading comprehension exercise for ${difficulty} level learners (English speakers).
${
  topic
    ? `Topic: ${topic}`
    : "Use an interesting, everyday topic like daily life, travel, food, work, or hobbies."
}

Requirements:
- Write a German text of 150-250 words appropriate for the level
- Create 3-4 comprehension questions
- Each question should have 4 multiple choice options
- Include clear explanations for correct answers
- Make the content engaging and practical

Make the text interesting and culturally relevant to German-speaking countries.
`;