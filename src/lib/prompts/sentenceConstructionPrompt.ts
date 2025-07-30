export function sentenceConstructionPrompt(
  difficulty: string,
  grammarFocus?: string,
  variationSeed?: string
): string {
  const focus = grammarFocus || "word order, cases, or verb conjugation";

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

  // Sentence construction variety elements
  const sentenceScenarios = [
    "planning weekend activities",
    "discussing work projects",
    "describing travel experiences",
    "talking about family events",
    "organizing social gatherings",
    "expressing environmental concerns",
    "sharing hobby interests",
    "discussing health topics",
    "planning educational goals",
    "describing cultural differences",
    "talking about technology",
    "discussing food preferences",
    "sharing news updates",
    "expressing future aspirations",
    "describing past memories",
    "discussing weather changes",
  ];

  const grammaticalStructures = [
    "main clause with time expression",
    "subordinate clause with 'weil'",
    "modal verb construction",
    "past tense narrative",
    "conditional sentence",
    "passive voice structure",
    "reflexive verb usage",
    "prepositional phrase combination",
    "comparative sentence",
    "question formation",
    "imperative construction",
    "subjunctive expression",
    "relative clause structure",
    "infinitive clause",
    "coordinated compound sentence",
    "temporal clause connection",
  ];

  const communicativeIntents = [
    "making suggestions",
    "expressing disagreement",
    "showing enthusiasm",
    "giving explanations",
    "making comparisons",
    "expressing uncertainty",
    "showing concern",
    "making predictions",
    "expressing preferences",
    "giving instructions",
    "making requests",
    "sharing opinions",
    "describing processes",
    "expressing emotions",
    "making complaints",
    "offering solutions",
  ];

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const scenarioIndex = seedNum % sentenceScenarios.length;
  const structureIndex = (seedNum + 13) % grammaticalStructures.length;
  const intentIndex = (seedNum + 23) % communicativeIntents.length;

  const selectedScenario = sentenceScenarios[scenarioIndex];
  const selectedStructure = grammaticalStructures[structureIndex];
  const selectedIntent = communicativeIntents[intentIndex];

  return `
Create a German sentence construction exercise for ${difficulty} level learners (English speakers).
Grammar focus: ${focus}

VARIATION CONTEXT (to ensure unique content):
- Sentence scenario: ${selectedScenario}
- Grammatical structure: ${selectedStructure}
- Communicative intent: ${selectedIntent}
- Variation seed: ${variationSeed || "auto-generated"}

IMPORTANT: Use the above context elements to create a UNIQUE sentence construction exercise that feels fresh and different from previous generations. Design a sentence about ${selectedScenario} using a ${selectedStructure} for the purpose of ${selectedIntent}.

Requirements:
- Create a meaningful German sentence (8-15 words)
- Provide clear instruction in English about what to construct
- Break the sentence into individual words for rearrangement
- Include articles, prepositions, and other function words separately
- Ensure the sentence tests important German grammar rules
- Provide clear explanation of the grammar principles

Difficulty guidelines:
- A2_BASIC: Simple word order, basic cases, present tense
- A2_INTERMEDIATE: More complex word order, modal verbs, past tense
- B1_BASIC: Subordinate clauses, all cases, complex structures
- B1_INTERMEDIATE: Advanced word order, passive voice, subjunctive
- B1_ADVANCED: Complex syntax, multiple clauses, sophisticated grammar

ANTI-REPETITION REQUIREMENTS:
- Create completely original sentences that haven't been used before
- Use varied vocabulary and contexts from the specified scenario
- Choose different names, locations, and specific details for each generation
- Ensure the grammatical structure creates a distinct construction challenge
- Make each sentence feel authentic to the specified scenario and intent

Return ONLY a valid JSON object with this exact structure:
{
  "instruction": "Clear instruction: 'Arrange these words to create a German sentence about ${selectedScenario} that achieves ${selectedIntent}'",
  "correctSentence": "The complete correct German sentence using ${selectedStructure} structure",
  "wordBlocks": ["word1", "word2", "word3", "word4", "etc"],
  "difficulty": "${difficulty}",
  "topic": "grammar topic being tested, contextualized to the scenario",
  "explanation": "Detailed explanation of the grammar rules and word order principles that apply to this sentence. Context: ${selectedScenario} using ${selectedStructure} for ${selectedIntent}"
}

Make the sentence practical and useful for communication while clearly testing the target grammar concept. Ensure ORIGINALITY by incorporating the variation context naturally.`;
}
