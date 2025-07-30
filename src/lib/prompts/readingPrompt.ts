export function readingPrompt(difficulty: string, topic?: string): string {
  const topicGuidance =
    topic ||
    "daily life, German culture, current events, travel, food, work, or social situations";

  return `
Create an engaging German reading comprehension exercise for ${difficulty} level learners (English speakers).
Topic focus: ${topicGuidance}

Requirements:
- Write a German text of 150-250 words appropriate for the level
- Create 3-4 comprehensive comprehension questions
- Each question should have 4 multiple choice options
- Include clear explanations for correct answers
- Make content culturally relevant and interesting
- Use authentic German language patterns

Text guidelines by difficulty:
- A2_BASIC: Simple sentences, basic vocabulary, present tense focus
- A2_INTERMEDIATE: More complex sentences, past tense, common expressions
- B1_BASIC: Varied sentence structures, subjunctive, abstract concepts
- B1_INTERMEDIATE: Complex ideas, formal/informal registers, cultural nuances
- B1_ADVANCED: Sophisticated content, implied meanings, cultural references

Question types to include:
- Main idea comprehension
- Specific detail questions
- Inference and implication
- Vocabulary in context
- Cultural understanding

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Engaging, descriptive title for the text",
  "text": "German text (150-250 words) with natural flow and authentic language",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "Clear question about the text content",
      "options": ["correct answer", "plausible distractor 1", "plausible distractor 2", "plausible distractor 3"],
      "correctAnswer": "correct answer",
      "explanation": "Explanation of why this answer is correct, with reference to the text"
    },
    {
      "question": "Another comprehension question",
      "options": ["correct answer", "distractor 1", "distractor 2", "distractor 3"],
      "correctAnswer": "correct answer", 
      "explanation": "Clear reasoning for the correct answer"
    }
  ]
}

Make the text interesting, educational, and representative of real German usage and culture.`;
}
