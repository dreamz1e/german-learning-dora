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
    "workplace communication",
    "casual conversation",
    "formal writing",
    "travel situations",
    "family interactions",
    "shopping and services",
    "education settings",
    "social media posts",
    "restaurant experiences",
    "public transportation",
    "medical appointments",
    "hobby discussions",
    "cultural events",
    "daily routines",
    "weather discussions",
    "technology usage",
  ];
  const focuses = [
    "practical usage",
    "formal structures",
    "common mistakes",
    "authentic contexts",
    "real-world application",
  ];

  const characterTypes = [
    "young professionals",
    "students",
    "retirees",
    "tourists",
    "locals",
    "colleagues",
    "friends",
    "family members",
    "service workers",
    "customers",
  ];

  const timeframes = [
    "present situations",
    "past experiences",
    "future plans",
    "hypothetical scenarios",
    "recurring events",
    "one-time occurrences",
    "ongoing processes",
  ];

  const scenario = scenarios[seedNum % scenarios.length];
  const focus = focuses[(seedNum + 5) % focuses.length];

  return `You are an expert German language curriculum creator AI, tasked with generating a batch of grammatically flawless grammar exercises. Your response MUST be a single, valid JSON object.

Generate exactly 5 diverse German grammar exercises for the ${difficulty} level, focusing on "${topic}".

Variation Context:
- Scenario: ${scenario}
- Focus: ${focus}
- Seed: ${variationSeed}

Each of the 5 exercises MUST adhere to the following strict requirements:
1.  **Unambiguous Correctness Rule**: There MUST be only one correct answer among the options. The correct answer must be unambiguously and contextually correct. The distractors must be plausible but definitively wrong.
    - **Good Example**: "Wir müssen unbedingt __ über __ deinen Urlaub reden." (Correct: "über", Distractors: "mit", "von", "an") -> This is good because only "über" fits the context of discussing a topic.
    - **Bad Example**: "Wir müssen unbedingt __ deinen Urlaub reden." (Correct: "mit", Distractors: "über", "von", "an") -> This is bad because the correct answer is grammatically wrong in the sentence, creating confusion.

2.  **Strict Placeholder and Deconstruction Rule**:
    - If a verb phrase needs to be split, you MUST use multiple '__BLANK__' placeholders.
    - The 'correctAnswer' MUST then contain the parts in order, separated by a space.
    - **Correct Example**: question: "Vor dem Interview __BLANK__ sich der Moderator den Ablauf __BLANK__.", correctAnswer: "stellte vor"
    - **Never provide a multi-word answer choice for a single blank.**

3.  **Grammatical Integrity**: The final sentence, when blanks are filled with the correct answer, MUST be 100% grammatically correct, logical, and natural-sounding.

4.  **Test a different aspect** of the grammar topic "${topic}".
5.  **Include one correct answer and three plausible distractors** that target common learner errors.
6.  **Provide a detailed, educational explanation**.
7.  **Incorporate the scenario ("${scenario}") and focus ("${focus}")** naturally into the exercises.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "batchId": "auto-generated-uuid",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "type": "grammar",
      "difficulty": "${difficulty}",
      "question": "A grammatically correct sentence with one or more '__BLANK__' placeholders.",
      "options": ["Correct Answer", "Plausible Distractor 1", "Plausible Distractor 2", "Plausible Distractor 3"],
      "correctAnswer": "Correct Answer",
      "explanation": "A detailed explanation in English of the grammar rule and why the answer is correct.",
      "topic": "${topic}",
      "germanText": "A German sentence or short text providing context",
      "englishText": "The English translation of the German text."
    }
    // ... exactly 4 more exercise objects
  ]
}
`;
}
