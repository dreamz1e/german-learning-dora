export function grammarPrompt(
  difficulty: string,
  grammarTopic?: string,
  exerciseType: string = "multiple-choice",
  variationSeed?: string
): string {
  const topicGuidance =
    grammarTopic ||
    "cases (Nominativ, Akkusativ, Dativ, Genitiv), verb conjugation, word order, prepositions, adjective endings, or modal verbs";

  const exerciseTypes = {
    "multiple-choice": "multiple choice question with 4 options",
    "fill-in-blank": "fill-in-the-blank exercise with a word bank",
    transformation: "sentence transformation exercise",
  };

  // Variety-generating elements to prevent repetition
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

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000); // Changes every minute
  const scenarioIndex = seedNum % contextScenarios.length;
  const characterIndex = (seedNum + 3) % characterTypes.length;
  const timeIndex = (seedNum + 7) % timeframes.length;

  const selectedScenario = contextScenarios[scenarioIndex];
  const selectedCharacters = characterTypes[characterIndex];
  const selectedTimeframe = timeframes[timeIndex];

  return `
Create a comprehensive German grammar exercise for ${difficulty} level learners (English speakers).
Grammar focus: ${topicGuidance}
Exercise type: ${exerciseTypes[exerciseType as keyof typeof exerciseTypes]}

VARIATION CONTEXT (to ensure unique content):
- Scenario setting: ${selectedScenario}
- Character types: ${selectedCharacters}
- Timeframe focus: ${selectedTimeframe}
- Variation seed: ${variationSeed || "auto-generated"}

IMPORTANT: Use the above context elements to create a UNIQUE exercise that feels fresh and different from previous generations. Incorporate the scenario, character types, and timeframe naturally into your grammar exercise.

Requirements:
- Create a practical, contextual German sentence or dialogue
- Test specific grammar knowledge relevant to the difficulty level
- Include clear, educational explanations of grammar rules
- Make content culturally relevant and authentic
- Use real-world scenarios that learners will encounter
- Provide detailed reasoning for correct answers

Grammar complexity by difficulty:
- A2_BASIC: Basic case usage, present tense verbs, simple word order, basic prepositions
- A2_INTERMEDIATE: Past tense, modal verbs, dative case, compound sentences, common adjective endings
- B1_BASIC: All four cases, subjunctive mood, complex word order, subordinate clauses, advanced prepositions
- B1_INTERMEDIATE: Passive voice, conditional sentences, formal/informal register, complex adjective declensions
- B1_ADVANCED: Advanced subjunctive usage, sophisticated syntax, nuanced grammar rules, literary constructions

Key grammar areas to test:
- Case system: proper use of Nominativ, Akkusativ, Dativ, Genitiv
- Verb conjugation: regular/irregular verbs, tenses, mood
- Word order: main clauses, subordinate clauses, question formation
- Adjective endings: weak, strong, and mixed declensions
- Prepositions: case requirements and usage contexts
- Modal verbs: meanings and conjugation patterns
- Articles: definite, indefinite, and case changes

Distractor guidelines (for multiple choice):
- Include common learner errors (wrong case, incorrect verb form, word order mistakes)
- Make options plausible but clearly distinguishable to knowledgeable speakers
- Test different aspects of the grammar rule being taught
- Include typical interference from English grammar patterns

ANTI-REPETITION REQUIREMENTS:
- Create completely original content that hasn't been seen before
- Use the provided scenario context to make the exercise unique
- Vary your vocabulary choices and sentence structures
- Choose different names, places, and specific details each time
- Ensure the grammar examples feel fresh and unexpected

Return ONLY a valid JSON object with this exact structure:
{
  "type": "grammar",
  "difficulty": "${difficulty}",
  "question": "Clear question or instruction about what grammar rule to apply",
  "germanText": "German sentence or dialogue providing context for the grammar point (incorporating the scenario: ${selectedScenario})",
  "options": ["correct answer", "distractor with common error 1", "distractor with common error 2", "distractor with common error 3"],
  "correctAnswer": "correct answer",
  "explanation": "Detailed explanation of the grammar rule, why this answer is correct, and common mistakes to avoid. Include variation context: ${selectedScenario} + ${selectedCharacters} + ${selectedTimeframe}",
  "topic": "specific grammar topic being tested (e.g., 'Dative Case', 'Modal Verbs', 'Word Order')"
}

Make the exercise practical, educational, and representative of how Germans actually use the language in everyday situations. Ensure ORIGINALITY by incorporating the variation context naturally.`;
}
