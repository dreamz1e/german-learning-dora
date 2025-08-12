export function listeningPrompt(
  difficulty: string,
  topic?: string,
  variationSeed?: string
): string {
  const level = difficulty as
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";

  // Tailor constraints to difficulty
  let sentenceRule = "";
  let styleOptions: string[] = [];
  let grammarHints: string[] = [];
  switch (level) {
    case "A2_BASIC":
      sentenceRule = "Write 1 short sentence (6–10 words).";
      styleOptions = [
        "declarative info (neutral)",
        "simple question",
        "polite request",
      ];
      grammarHints = [
        "prefer present tense",
        "optionally include one time or place phrase",
        "optionally include one separable verb",
      ];
      break;
    case "A2_INTERMEDIATE":
      sentenceRule = "Write 1–2 short sentences (10–18 words total).";
      styleOptions = [
        "declarative info",
        "question",
        "polite request",
        "short daily plan with a time expression",
      ];
      grammarHints = [
        "use present tense; a modal verb is optional",
        "include a time or place phrase if natural",
      ];
      break;
    case "B1_BASIC":
      sentenceRule = "Write 2 sentences (16–24 words total).";
      styleOptions = [
        "short announcement (time/place/transport)",
        "tiny dialogue snippet with one quoted speech fragment",
        "direction or instruction with a prepositional phrase",
      ];
      grammarHints = [
        "may include one subordinate clause (weil/als/wenn/dass)",
        "a separable verb or a modal verb is fine",
      ];
      break;
    case "B1_INTERMEDIATE":
      sentenceRule = "Write 2–3 sentences (22–35 words total).";
      styleOptions = [
        "announcement (time/place/transport)",
        "dialogue snippet with one quoted speech fragment",
        "daily plan or update including a time expression",
      ];
      grammarHints = [
        "include one subordinate clause (weil/als/wenn/dass)",
        "numbers/times/prices may appear if relevant (e.g., 7:30, 12 Euro)",
      ];
      break;
    case "B1_ADVANCED":
      sentenceRule =
        "Write 2–3 sentences (28–40 words total) with one mild clause.";
      styleOptions = [
        "concise announcement with detail",
        "dialogue snippet with one quoted speech fragment",
        "direction/instruction with a prepositional phrase",
      ];
      grammarHints = [
        "include one subordinate clause (weil/als/wenn/dass) naturally",
        "numbers/times/prices may appear if relevant (e.g., 7:30, 12 Euro)",
      ];
      break;
  }

  const chosenStyles = styleOptions.join(", ");
  const chosenGrammar = grammarHints.join("; ");

  return `You are generating a short German listening transcription task for a language learner. Respond with a single JSON object only.

Constraints:
- difficulty: ${difficulty}
- topic: ${topic || "general daily life"}
- Standarddeutsch only, no English in the transcript.
- Keep total speaking time under ~12 seconds.
- ${sentenceRule}
- Randomly choose ONE micro-style (use stability key for diversity): ${chosenStyles}.
- Grammar variety: ${chosenGrammar}. Keep capitalization and punctuation correct.

Output JSON schema (no markdown):
{
  "transcript": "The full German transcript to be spoken.",
  "topic": "${topic || "general daily life"}",
  "difficulty": "${difficulty}",
  "hint": "One brief hint about key words or context in English."
}

Stability key: ${variationSeed || "none"}`;
}
