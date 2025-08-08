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
    "business meetings",
    "social gatherings",
    "health and fitness",
    "leisure activities",
    "personal finance",
    "legal matters",
    "environmental issues",
    "cultural exchange",
    "sports and fitness",
    "travel planning",
    "food and dining",
    "entertainment and media",
    "technology and innovation",
    "art and culture",
    "science and technology",
    "politics and government",
    "religion and spirituality",
    "personal relationships",
    "workplace dynamics",
    "school and education",
    "community and society",
  ];
  const focuses = [
    "practical usage",
    "formal structures",
    "common mistakes",
    "authentic contexts",
    "real-world application",
    "cultural context",
    "historical background",
    "linguistic features",
    "regional variations",
    "literary language",
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
  const characters = characterTypes[(seedNum + 7) % characterTypes.length];
  const timeframe = timeframes[(seedNum + 11) % timeframes.length];

  return `You are an expert German language item writer AND internal validator. Generate a batch of German grammar multiple-choice exercises that are unambiguous, fully grammatical, and conform exactly to the JSON schema used by the calling system.

================ GENERATION PROTOCOL (read carefully, DO NOT output) ================
1) INTERNAL_PLAN
   • Silently design 10 exercises that each test a distinct nuance of the target grammar topic.
   • Keep difficulty, register, and vocabulary consistent with the provided difficulty.

2) HARD SELF-CHECK (must pass for EVERY exercise)
   Structure & Schema
   • Exactly 10 exercises in total.
   • For every exercise: type = "grammar"; difficulty = exactly "${difficulty}"; topic = exactly "${topic}".
   • Each options array contains 4 TRIMMED, UNIQUE strings; no duplicates by case or spacing; no underscores/tabs; no leading/trailing spaces.
   • The correctAnswer value appears exactly once within options (string equality after trim).

   Placeholder Discipline
   • Let N = number of space-separated tokens in correctAnswer. The question MUST contain exactly N '__BLANK__' placeholders.
   • Placeholders map 1:1 to the answer tokens in order. Filling them with correctAnswer must yield a well-formed sentence with normal spacing and punctuation (no '__BLANK__', no double spaces).

   Grammar & Usage Gate (with correctAnswer filled)
   • Sentence is 100% grammatical per standard German (Duden/Regelwerk):
     – Case, gender, and number agreement (articles, adjectives, pronouns, nouns).
     – Verb position: V2 in main clauses; verb-final in subordinate clauses; correct placement of particles.
     – Separable verbs: correct split/placement (e.g., stellte … vor).
     – Government of prepositions (mit + Dativ, für + Akkusativ, wegen + Genitiv, etc.).
     – Tense/aspect/modality appropriate to context; Konjunktiv I/II usage where required.
     – Adjective endings and article declension are correct.
     – Negation placement (nicht/kein) is correct.
     – Orthography: nouns capitalized; ß/ss used correctly; commas for subclauses.

   Uniqueness-of-Answer Stress Test
   • For EACH option, replace the blanks (splitting multi-word options by spaces). Label each candidate as:
     grammatical AND matches intended meaning AND natural to a native speaker.
   • Exactly ONE candidate may satisfy all three. If more than one qualifies, rework distractors or the stem until only one remains correct.

   Distractor Quality
   • Each distractor is plausible but wrong for a specific named reason (choose distinct reasons):
     wrong case after preposition, wrong word order (V2/Vfinal), wrong tense/modality, incorrect separable prefix placement,
     incorrect article/adjective ending, wrong preposition/collocation, register mismatch, semantic mismatch.
   • Avoid distractors that are correct but less common; avoid merely stylistic differences.

   Variation & Context
   • Integrate the scenario "${scenario}", characters "${characters}", focus "${focus}", and timeframe "${timeframe}" naturally.
   • Keep sentences concise and authentic for the given context.

   Serialization Hygiene
   • Values contain no raw newline/tab characters; no stray quotes; no markdown.
   • Punctuation and spacing are normal German typography.

   If ANY of the above checks fails for an exercise, regenerate that exercise and re-run this SELF-CHECK until all pass.

3) OUTPUT
   • When all exercises pass the self-check, output ONE JSON object that conforms exactly to the specified schema. Output nothing else.

================ GOLD-STANDARD EXAMPLE (for internal reference, DO NOT output) ======
{
  "type": "grammar",
  "difficulty": "${difficulty}",
  "question": "Bevor das Meeting begann, __BLANK__ der Manager die Agenda __BLANK__.",
  "options": ["stellte vor", "stellte zu", "legte aus", "setzte an"],
  "correctAnswer": "stellte vor",
  "explanation": "The separable verb 'vorstellen' splits into 'stellte … vor' in the simple past.",
  "topic": "Separable verbs in past tense",
  "germanText": "Bevor das Meeting begann, stellte der Manager die Agenda vor.",
  "englishText": "Before the meeting started, the manager presented the agenda."
},
{
  "type": "grammar",
  "difficulty": "${difficulty}",
  "question": "Die Rechnung ist falsch, das __BLANK__ ein Irrtum __BLANK__!",
  "options": ["muss sein", "darf sein", "sollte sein", "kann sein"],
  "correctAnswer": "muss sein",
  "explanation": "Fixed expression 'Das muss ein Irrtum sein' uses the modal verb 'muss' with 'sein'.",
  "topic": "Modal verbs in set expressions",
  "germanText": "Die Rechnung ist falsch, das muss ein Irrtum sein!",
  "englishText": "The bill is wrong, that must be a mistake!"
},
{
  "type": "grammar",
  "difficulty": "${difficulty}",
  "question": "Wir __BLANK__ Ihnen dankbar, wenn Sie uns die Unterlagen bis Freitag zusenden könnten.",
  "options": ["würden wir", "waren", "sollen wir", "wären"],
  "correctAnswer": "wären",
  "explanation": "Use Konjunktiv II of 'sein' (wären) for polite requests: 'Wir wären Ihnen dankbar …'.",
  "topic": "Konjunktiv II in polite requests",
  "germanText": "Wir wären Ihnen dankbar, wenn Sie uns die Unterlagen bis Freitag zusenden könnten.",
  "englishText": "We would be grateful if you could send us the documents by Friday."
}

================ TASK =================================================================

Generate EXACTLY 10 diverse German grammar exercises for the ${difficulty} level, focusing on "${topic}".

Variation Context:
- Scenario: ${scenario}
- Focus: ${focus}
- Seed: ${variationSeed}
- Characters: ${characters}
- Timeframe: ${timeframe}

Each exercise MUST satisfy ALL of the following:

1. Unambiguous Correctness: only ONE option yields a grammatical, natural sentence matching the intended meaning and context.
2. Placeholder Discipline: '__BLANK__' placeholders exactly match the number of tokens in correctAnswer and their positions in the final sentence.
3. Grammatical Integrity: with correctAnswer, the sentence is fully grammatical and natural per standard German (see Self-Check rules above).
4. Topic Coverage: each exercise targets a DIFFERENT sub-aspect of "${topic}"; avoid repetition.
5. Distractors: provide 3 plausible, rule-based errors (distinct reasons) that commonly occur for this topic.
6. Explanation: concise (≤200 chars), English, states the rule and, if space allows, why distractors fail.
7. Context Integration: weave in scenario, characters, focus, and timeframe naturally.
8. Serialization Hygiene: no raw newlines/tabs; escape if necessary; avoid markdown.

================ OUTPUT FORMAT ======================================================
Return ONE valid JSON object and NOTHING else.
Example:
{
  "batchId": "auto-generated-uuid",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "type": "grammar",
      "difficulty": "${difficulty}",
      "question": "A grammatically correct sentence with one or more '__BLANK__' placeholders.",
      "options": ["Correct Answer", "Distractor 1", "Distractor 2", "Distractor 3"],
      "correctAnswer": "Correct Answer",
      "explanation": "A brief explanation in English of the grammar rule.",
      "topic": "${topic}",
      "germanText": "A German sentence or short text providing context.",
      "englishText": "The English translation of the German text."
    }
    // ... exactly 9 more exercise objects
  ]
}`;
}
