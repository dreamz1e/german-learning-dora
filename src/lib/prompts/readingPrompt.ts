export function readingPrompt(
  difficulty: string,
  topic?: string,
  variationSeed?: string
): string {
  const topicGuidance =
    topic ||
    "daily life, German culture, current events, travel, food, work, or social situations";

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

  // Reading-specific variety elements
  const textTypes = [
    "news article",
    "personal blog post",
    "travel guide excerpt",
    "product review",
    "social media post",
    "email correspondence",
    "instruction manual",
    "academic text",
    "magazine interview",
    "historical account",
    "cultural commentary",
    "weather report",
    "recipe description",
    "event announcement",
    "job advertisement",
    "housing listing",
  ];

  const narrativePerspectives = [
    "first-person experience",
    "third-person observation",
    "expert analysis",
    "casual storytelling",
    "formal reporting",
    "personal reflection",
    "instructional guidance",
    "conversational tone",
    "journalistic style",
    "academic presentation",
    "creative narrative",
    "practical advice",
  ];

  const contentFoci = [
    "regional German traditions",
    "modern lifestyle trends",
    "environmental awareness",
    "technology impact",
    "social relationships",
    "professional development",
    "health and wellness",
    "educational experiences",
    "cultural exchanges",
    "seasonal activities",
    "urban vs rural life",
    "generational differences",
    "economic topics",
    "artistic pursuits",
    "sports and recreation",
    "food culture",
  ];

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const textTypeIndex = seedNum % textTypes.length;
  const perspectiveIndex = (seedNum + 7) % narrativePerspectives.length;
  const contentIndex = (seedNum + 13) % contentFoci.length;

  const selectedTextType = textTypes[textTypeIndex];
  const selectedPerspective = narrativePerspectives[perspectiveIndex];
  const selectedContent = contentFoci[contentIndex];

  return `
Create an engaging German reading comprehension exercise for ${difficulty} level learners (English speakers).
Topic focus: ${topicGuidance}

VARIATION CONTEXT (to ensure unique content):
- Text type: ${selectedTextType}
- Narrative perspective: ${selectedPerspective}
- Content focus: ${selectedContent}
- Variation seed: ${variationSeed || "auto-generated"}

IMPORTANT: Use the above context elements to create a UNIQUE reading exercise that feels fresh and different from previous generations. Structure your text as a ${selectedTextType} with a ${selectedPerspective}, focusing on ${selectedContent}.

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

ANTI-REPETITION REQUIREMENTS:
- Create completely original text content that hasn't been seen before
- Use the specified text type and perspective to make content unique
- Choose different locations, names, dates, and specific details
- Vary sentence structures and vocabulary choices significantly
- Ensure the content focus creates a distinct thematic experience

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Engaging, descriptive title reflecting the ${selectedTextType} about ${selectedContent}",
  "text": "German text (150-250 words) written as a ${selectedTextType} with ${selectedPerspective}, focusing on ${selectedContent}",
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

Make the text interesting, educational, and representative of real German usage and culture. Ensure ORIGINALITY by fully incorporating the variation context.`;
}
