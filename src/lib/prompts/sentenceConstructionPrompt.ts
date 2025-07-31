export function sentenceConstructionPrompt(
  difficulty: string,
  grammarFocus?: string,
  variationSeed?: string
): string {
  const focus = grammarFocus || "word order, cases, or verb conjugation";

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

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

  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const selectedScenario =
    sentenceScenarios[seedNum % sentenceScenarios.length];
  const selectedStructure =
    grammaticalStructures[(seedNum + 13) % grammaticalStructures.length];
  const selectedIntent =
    communicativeIntents[(seedNum + 23) % communicativeIntents.length];

  return `You are an expert German language curriculum creator AI. Your task is to generate a unique sentence construction exercise. Your response MUST be a single, valid JSON object.

Create a German sentence construction exercise for a ${difficulty} level learner, focusing on ${focus}.

Variation Context (MUST be used to ensure uniqueness):
- Scenario: ${selectedScenario}
- Structure: ${selectedStructure}
- Intent: ${selectedIntent}
- Seed: ${variationSeed || "auto-generated"}

You MUST use the variation context to design a sentence about ${selectedScenario}, using a ${selectedStructure} to achieve the communicative intent of ${selectedIntent}.

The exercise MUST adhere to the following strict requirements:
1.  **Create a meaningful German sentence** (8-15 words) that tests a key grammar rule.
2.  **Provide a clear instruction in English** about what the user needs to build.
3.  **Break the complete sentence into individual word blocks** for rearrangement.
4.  **The "correctSentence" MUST be the single valid sentence** that can be formed from the blocks.
5.  **Provide a clear, detailed explanation** of the grammar and word order principles involved.
6.  **The exercise MUST be original** and distinct from previous generations.

The output MUST be a single, valid JSON object with the following structure. Do NOT include any markdown, comments, or other text outside of the JSON.
{
  "instruction": "Arrange the words to form a coherent German sentence about ${selectedScenario} that is meant for ${selectedIntent}.",
  "correctSentence": "The complete, correct German sentence using a ${selectedStructure}.",
  "wordBlocks": ["word1", "word2", "word3", "etc."],
  "difficulty": "${difficulty}",
  "topic": "The grammar topic being tested, contextualized to the scenario.",
  "explanation": "A detailed explanation of the grammar and word order rules, contextualized with: ${selectedScenario}, ${selectedStructure}, ${selectedIntent}."
}
`;
}
