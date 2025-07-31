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

  return `You are an expert German language curriculum creator AI. Follow the STRICT PROTOCOL below to generate a fail-proof batch of German grammar exercises.

================ GENERATION PROTOCOL (read carefully, DO NOT output) ================
1. INTERNAL_PLAN: Silently decide on 10 exercises, each with a unique aspect of the target grammar topic.
2. SELF_CHECK: After drafting, verify that
    • exactly 10 exercises exist.
    • each "options" array has 4 UNIQUE strings.
    • "correctAnswer" is included in "options".
    • Let N = number of words in "correctAnswer" (split by spaces). There MUST be exactly N '__BLANK__' placeholders in "question".
    • For EACH option, build a candidate sentence by replacing the blanks with that option (split into parts if multi-word). Count how many candidates are simultaneously
      – fully grammatical,
      – convey the intended meaning,
      – and sound natural to a native speaker.
      Exactly ONE option must satisfy all criteria; mark it as "correctAnswer".
    • Reconstruct the sentence with the chosen "correctAnswer" and ensure:
      – no '__BLANK__' tokens remain,
      – no double spaces occur.
    • JSON strictly conforms to the schema below (no missing/extra keys).
    If ANY check fails, regenerate BEFORE responding.
3. OUTPUT: Once all checks pass, emit ONLY the JSON object—no markdown, no comments.

================ GOLD-STANDARD EXAMPLE (for internal reference, DO NOT output) ======
{
  "type": "grammar",
  "difficulty": "B1",
  "question": "Bevor das Meeting begann, __BLANK__ der Manager die Agenda __BLANK__.",
  "options": ["stellte vor", "stellte zu", "legte aus", "setzte an"],
  "correctAnswer": "stellte vor",
  "explanation": "The separable verb 'vorstellen' splits into 'stellte ... vor' in the simple past.",
  "topic": "Separable verbs in past tense",
  "germanText": "Gestern stellte der Lehrer den neuen Plan vor.",
  "englishText": "Yesterday the teacher presented the new plan."
},
{
  "type": "grammar",
  "difficulty": "B2",
  "question": "Die Rechnung ist falsch, das __BLANK__ ein Irrtum __BLANK__!",
  "options": ["muss sein", "darf sein", "sollte sein", "kann sein"],
  "correctAnswer": "muss sein",
  "explanation": "Fixed expression 'Das muss ein Irrtum sein' uses the modal verb 'muss' followed by 'sein'.",
  "topic": "Modal verbs in set expressions",
  "germanText": "Das muss ein Irrtum sein.",
  "englishText": "That must be a mistake."
},
{
  "type": "grammar",
  "difficulty": "B2",
  "question": "Wir __BLANK__ Ihnen dankbar, wenn Sie uns die Unterlagen bis Freitag zusenden könnten.",
  "options": ["wären", "würden wir", "waren", "sollen wir"],
  "correctAnswer": "wären",
  "explanation": "In formal requests the Konjunktiv II of 'sein' (wären) expresses politeness: 'Wir wären Ihnen dankbar …'.",
  "topic": "Konjunktiv II in polite requests",
  "germanText": "Wir wären Ihnen sehr dankbar, wenn Sie uns informieren könnten.",
  "englishText": "We would be very grateful if you could inform us."
}

================ TASK =================================================================

Generate EXACTLY 10 diverse German grammar exercises for the ${difficulty} level, focusing on "${topic}".

Variation Context:
- Scenario: ${scenario}
- Focus: ${focus}
- Seed: ${variationSeed}

Each exercise MUST satisfy ALL of the following:

1. **Unambiguous Correctness Rule** — only ONE correct answer among the four options.
2. **Strict Placeholder and Deconstruction Rule**
   • Use '__BLANK__' to mark every missing segment.
   • The number of '__BLANK__' placeholders MUST equal the number of space-separated parts in "correctAnswer".
   • Place each placeholder exactly where its corresponding part belongs in the final sentence (e.g. passive voice: "__BLANK__ der Nutzer … __BLANK__"  → "wird gefragt").
   • If a multi-word answer is required, list the parts in order, separated by a single space, in "correctAnswer".
3. **Grammatical Integrity** — with the correct answer filled in, the sentence is 100 % grammatical, logical and natural.
4. **Coverage** — each exercise tests a DIFFERENT aspect of "${topic}".
5. Provide **1 correct answer and 3 plausible distractors** targeting common errors.
6. Include a **clear, educational explanation** in English (≤200 characters, no raw line breaks).
7. **Integrate scenario ("${scenario}") and focus ("${focus}")** naturally into the context.
8. **Serialization hygiene** — no field value may contain raw newline, carriage-return or tab characters. If absolutely needed, use \n escapes within the JSON string.

================ OUTPUT FORMAT ======================================================
Return ONE valid JSON object and NOTHING else.

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
      "explanation": "A detailed explanation in English of the grammar rule.",
      "topic": "${topic}",
      "germanText": "A German sentence or short text providing context.",
      "englishText": "The English translation of the German text."
    }
    // ... exactly 4 more exercise objects
  ]
}`;
}
