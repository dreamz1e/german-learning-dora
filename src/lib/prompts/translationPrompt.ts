export function translationPrompt(
  difficulty: string,
  direction: string
): string {
  const fromLang = direction === "english-to-german" ? "English" : "German";
  const toLang = direction === "english-to-german" ? "German" : "English";

  return `
Create a translation exercise for ${difficulty} level German learners (English speakers).
Translation direction: ${fromLang} to ${toLang}

Requirements:
- Create a practical, authentic sentence for translation
- Provide 4 multiple choice options (1 correct, 3 plausible distractors)
- Include clear explanation of grammar and vocabulary choices
- Use contextually relevant, real-world content
- Test both vocabulary and grammatical understanding

Sentence complexity by difficulty:
- A2_BASIC: Simple sentences, basic vocabulary, common structures
- A2_INTERMEDIATE: Compound sentences, more vocabulary, basic idioms
- B1_BASIC: Complex sentences, formal/informal register, cultural context
- B1_INTERMEDIATE: Nuanced expressions, advanced grammar, idiomatic language
- B1_ADVANCED: Sophisticated language, cultural references, complex syntax

Focus areas to test:
- Case usage (if translating to German)
- Verb conjugation and tense
- Word order differences
- Idiomatic expressions
- Cultural context
- Formal vs informal register

Distractor guidelines:
- Make options believable but clearly wrong
- Include common learner errors
- Test different aspects (grammar vs vocabulary vs word order)

Return ONLY a valid JSON object with this exact structure:
{
  "type": "translation",
  "difficulty": "${difficulty}",
  "question": "Translate to ${toLang}: '[${fromLang} sentence]'",
  "options": ["correct translation", "distractor with grammar error", "distractor with vocabulary error", "distractor with word order error"],
  "correctAnswer": "correct translation",
  "explanation": "Clear explanation of grammar rules, vocabulary choices, and cultural context that make this translation correct",
  "topic": "translation"
}

Make it practical and help learners understand both languages better through comparison.`;
}
