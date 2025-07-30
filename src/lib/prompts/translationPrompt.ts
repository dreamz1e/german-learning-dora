export function translationPrompt(
  difficulty: string,
  direction: string,
  variationSeed?: string
): string {
  const fromLang = direction === "english-to-german" ? "English" : "German";
  const toLang = direction === "english-to-german" ? "German" : "English";

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

  // Translation-specific variety elements
  const communicationContexts = [
    "business correspondence",
    "casual social interaction",
    "academic discussion",
    "travel communication",
    "medical consultation",
    "customer service",
    "family conversation",
    "media interview",
    "technical instruction",
    "cultural exchange",
    "emergency situation",
    "entertainment review",
    "educational content",
    "legal documentation",
    "artistic description",
    "sports commentary",
  ];

  const functionalPurposes = [
    "expressing opinions",
    "giving instructions",
    "making requests",
    "describing experiences",
    "comparing options",
    "explaining processes",
    "sharing emotions",
    "providing directions",
    "making complaints",
    "offering help",
    "asking questions",
    "making suggestions",
    "narrating events",
    "expressing preferences",
    "giving advice",
    "making announcements",
  ];

  const registerStyles = [
    "formal professional",
    "casual friendly",
    "academic scholarly",
    "conversational informal",
    "polite respectful",
    "direct assertive",
    "diplomatic careful",
    "enthusiastic expressive",
    "technical precise",
    "creative artistic",
    "journalistic objective",
    "personal intimate",
  ];

  // Use variation seed to deterministically select different elements
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 60000);
  const contextIndex = seedNum % communicationContexts.length;
  const purposeIndex = (seedNum + 11) % functionalPurposes.length;
  const registerIndex = (seedNum + 19) % registerStyles.length;

  const selectedContext = communicationContexts[contextIndex];
  const selectedPurpose = functionalPurposes[purposeIndex];
  const selectedRegister = registerStyles[registerIndex];

  return `
Create a translation exercise for ${difficulty} level German learners (English speakers).
Translation direction: ${fromLang} to ${toLang}

VARIATION CONTEXT (to ensure unique content):
- Communication context: ${selectedContext}
- Functional purpose: ${selectedPurpose}
- Register style: ${selectedRegister}
- Variation seed: ${variationSeed || "auto-generated"}

IMPORTANT: Use the above context elements to create a UNIQUE translation exercise that feels fresh and different from previous generations. Create a sentence that fits the ${selectedContext} context, serves the purpose of ${selectedPurpose}, and uses a ${selectedRegister} style.

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

ANTI-REPETITION REQUIREMENTS:
- Create completely original sentences that haven't been used before
- Use varied vocabulary and contexts from the specified communication scenario
- Choose different names, locations, and specific details for each generation
- Ensure the register style creates a distinct translation challenge
- Make each sentence feel authentic to the specified context and purpose

Return ONLY a valid JSON object with this exact structure:
{
  "type": "translation",
  "difficulty": "${difficulty}",
  "question": "Translate to ${toLang}: '[${fromLang} sentence in ${selectedContext} context with ${selectedRegister} style]'",
  "options": ["correct translation", "distractor with grammar error", "distractor with vocabulary error", "distractor with word order error"],
  "correctAnswer": "correct translation",
  "explanation": "Clear explanation of grammar rules, vocabulary choices, and cultural context that make this translation correct. Context: ${selectedContext} for ${selectedPurpose}",
  "topic": "translation"
}

Make it practical and help learners understand both languages better through comparison. Ensure ORIGINALITY by incorporating the variation context naturally.`;
}
