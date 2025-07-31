export function readingPrompt(
  difficulty: string,
  topic?: string,
  variationSeed?: string
): string {
  const topicGuidance =
    topic ||
    "daily life, German culture, current events, travel, food, work, or social situations";

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

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

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedTextType = textTypes[seedNum % textTypes.length];
  const selectedPerspective =
    narrativePerspectives[(seedNum + 7) % narrativePerspectives.length];
  const selectedContent = contentFoci[(seedNum + 13) % contentFoci.length];

  return `You are an expert German language curriculum creator AI. Your task is to generate a unique reading comprehension exercise. Your response MUST be a single, valid JSON object.

Create an engaging German reading exercise for a ${difficulty} level learner.
- Topic Focus: ${topicGuidance}

Variation Context (MUST be used to ensure uniqueness):
- Text Type: ${selectedTextType}
- Narrative Perspective: ${selectedPerspective}
- Content Focus: ${selectedContent}
- Seed: ${variationSeed || "auto-generated"}

You MUST use the variation context to create an original exercise. The text should be a ${selectedTextType} with a ${selectedPerspective}, focusing on ${selectedContent}.

The exercise MUST adhere to the following strict requirements:
1.  **Write a German text** of 150-250 words, appropriate for the ${difficulty} level.
2.  **Create 3-4 comprehension questions** that test understanding of the text.
3.  **Each question must have 4 multiple-choice options**: one correct answer and three plausible but incorrect distractors.
4.  **Provide a clear explanation** for each correct answer, referencing the relevant part of the text.
5.  **Ensure content is culturally relevant, interesting, and authentic**.
6.  **The text and questions MUST be original** and distinct from previous generations.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "title": "An engaging title reflecting the '${selectedTextType}' about '${selectedContent}'",
  "text": "A German text (150-250 words) written as a ${selectedTextType} with a ${selectedPerspective}, focusing on ${selectedContent}.",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "A clear comprehension question about the text's content.",
      "options": ["Correct Answer", "Plausible Distractor 1", "Plausible Distractor 2", "Plausible Distractor 3"],
      "correctAnswer": "Correct Answer",
      "explanation": "An explanation of why this answer is correct, with direct reference to the text."
    }
  ]
}
`;
}
