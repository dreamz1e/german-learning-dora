export function batchGrammarPrompt(
  difficulty: string,
  topic: string,
  variationSeed?: string
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
  const scenarios = [
    "daily conversation",
    "business meeting",
    "academic discussion",
    "casual chat",
    "formal presentation",
    "family gathering",
    "travel situation",
    "media interview",
    "problem solving",
  ];
  const focuses = [
    "practical usage",
    "formal structures",
    "common mistakes",
    "authentic contexts",
    "real-world application",
  ];

  const scenario = scenarios[seedNum % scenarios.length];
  const focus = focuses[(seedNum + 5) % focuses.length];

  return `Generate 5 diverse German grammar exercises for ${difficulty} level focusing on "${topic}".

Scenario: ${scenario}, ${focus}
Seed: ${variationSeed}

Each exercise must:
- Test different aspects of the grammar topic
- Include 4 multiple choice options
- Have educational explanations
- Use varied vocabulary and contexts

Return JSON:
{
  "batchId": "auto-generated",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "type": "grammar",
      "difficulty": "${difficulty}",
      "question": "Grammar question testing specific rule",
      "options": ["correct", "error1", "error2", "error3"],
      "correctAnswer": "correct",
      "explanation": "Grammar rule explanation with context",
      "topic": "${topic}",
      "germanText": "German sentence example",
      "englishText": "English translation"
    }
    // ... 4 more exercises
  ]
}

Include common learner errors in distractors. Focus on practical, authentic usage.`;
}
