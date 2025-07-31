export function grammarPrompt(
  difficulty: string,
  grammarTopic?: string,
  exerciseType: string = "multiple-choice",
  variationSeed?: string
): string {
  const topicGuidance =
    grammarTopic ||
    "a key German grammar rule such as cases, verb conjugation, word order, or prepositions";

  const exerciseTypes = {
    "multiple-choice": "multiple choice question with 4 options",
    "fill-in-blank": "fill-in-the-blank exercise with a word bank",
    transformation: "sentence transformation exercise",
  };

  const contextScenarios = [
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

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedScenario = contextScenarios[seedNum % contextScenarios.length];
  const selectedCharacters =
    characterTypes[(seedNum + 3) % characterTypes.length];
  const selectedTimeframe = timeframes[(seedNum + 7) % timeframes.length];

  return `You are an expert German language curriculum creator AI. Your task is to generate a unique and grammatically flawless grammar exercise. Your response MUST be a single, valid JSON object.

Create a comprehensive German grammar exercise for a ${difficulty} level learner.
- Grammar Focus: ${topicGuidance}
- Exercise Type: ${exerciseTypes[exerciseType as keyof typeof exerciseTypes]}

Variation Context (MUST be used to ensure uniqueness):
- Scenario: ${selectedScenario}
- Characters: ${selectedCharacters}
- Timeframe: ${selectedTimeframe}
- Seed: ${variationSeed || "auto-generated"}

The exercise MUST adhere to the following strict requirements:
1.  **Unambiguous Correctness Rule**: There MUST be only one correct answer among the options. The correct answer must be unambiguously and contextually correct. The distractors must be plausible but definitively wrong.
    - **Good Example**: "Wir müssen unbedingt __ über __ deinen Urlaub reden." (Correct: "über", Distractors: "mit", "von", "an") -> This is good because only "über" fits the context of discussing a topic.
    - **Bad Example**: "Wir müssen unbedingt __ deinen Urlaub reden." (Correct: "mit", Distractors: "über", "von", "an") -> This is bad because the correct answer is grammatically wrong in the sentence, creating confusion.

2.  **Strict Placeholder and Deconstruction Rule**:
    - If a verb phrase needs to be split, you MUST use multiple '__BLANK__' placeholders.
    - The 'correctAnswer' MUST then contain the parts in order, separated by a space.
    - **Correct Example**: question: "Vor dem Interview __BLANK__ sich der Moderator den Ablauf __BLANK__.", correctAnswer: "stellte vor"
    - **Never provide a multi-word answer choice for a single blank.**

3.  **Grammatical Integrity**: The final sentence, when blanks are filled with the correct answer, MUST be 100% grammatically correct, logical, and natural-sounding.

4.  **Provide a clear question or instruction**.
5.  **Include one correct answer and three plausible distractors** that target common learner errors.
6.  **Provide a detailed, educational explanation**.
7.  **The exercise MUST be original** and distinct from previous generations.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "type": "grammar",
  "difficulty": "${difficulty}",
  "question": "A grammatically correct sentence with one or more '__BLANK__' placeholders.",
  "germanText": "A German sentence providing context.",
  "options": ["Correct Answer", "Plausible Distractor 1", "Plausible Distractor 2", "Plausible Distractor 3"],
  "correctAnswer": "Correct Answer",
  "explanation": "A detailed explanation of the grammar rule, contextualized with the variation context.",
  "topic": "The specific grammar topic being tested."
}
`;
}
