import OpenAI from "openai";
import { vocabularyPrompt } from "./prompts/vocabularyPrompt";
import { grammarPrompt } from "./prompts/grammarPrompt";
import { readingPrompt } from "./prompts/readingPrompt";
import { vocabularyWordsPrompt } from "./prompts/vocabularyWordsPrompt";
import { translationPrompt } from "./prompts/translationPrompt";
import {
  GermanExerciseSchema,
  VocabularyWordsSchema,
  ReadingExerciseSchema,
  WritingExerciseSchema,
  SentenceConstructionSchema,
  ErrorCorrectionSchema,
} from "./schemas";
import { processAIResponse } from "./responseUtils";

// Configure OpenAI client for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = "google/gemini-2.5-flash";

export interface GermanExercise {
  type:
    | "vocabulary"
    | "grammar"
    | "reading"
    | "listening"
    | "translation"
    | "fill-blank"
    | "writing";
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  germanText?: string;
  englishText?: string;
}

export interface VocabularyWord {
  german: string;
  english: string;
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  category: string;
  exampleSentence: string;
  pronunciation?: string;
}

export interface ReadingExercise {
  title: string;
  text: string;
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

export interface WritingExercise {
  prompt: string;
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  topic: string;
  guidelines: string[];
  minWords: number;
  maxWords: number;
}

export interface SentenceConstructionExercise {
  instruction: string;
  correctSentence: string;
  wordBlocks: string[];
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  topic: string;
  explanation: string;
}

export interface ErrorCorrectionExercise {
  instruction: string;
  incorrectText: string;
  correctText: string;
  errors: Array<{
    start: number;
    end: number;
    error: string;
    correction: string;
    explanation: string;
  }>;
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  topic: string;
}

export async function generateVocabularyExercise(
  difficulty: string,
  topic?: string
): Promise<GermanExercise> {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "user", content: vocabularyPrompt(difficulty, topic) },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_vocabulary_exercise",
          schema: GermanExerciseSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const exercise = processAIResponse<GermanExercise>(content, [
      "type",
      "difficulty",
      "question",
      "correctAnswer",
      "explanation",
      "topic",
    ]);

    // Ensure type is set correctly
    exercise.type = "vocabulary";
    exercise.difficulty = difficulty as any;

    return exercise;
  } catch (error) {
    console.error("Error generating vocabulary exercise:", error);
    throw new Error("Failed to generate vocabulary exercise");
  }
}

export async function generateGrammarExercise(
  difficulty: string,
  grammarTopic?: string
): Promise<GermanExercise> {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "user", content: grammarPrompt(difficulty, grammarTopic) },
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_grammar_exercise",
          schema: GermanExerciseSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const exercise = processAIResponse<GermanExercise>(content, [
      "type",
      "difficulty",
      "question",
      "correctAnswer",
      "explanation",
      "topic",
    ]);

    // Ensure type is set correctly
    exercise.type = "grammar";
    exercise.difficulty = difficulty as any;

    return exercise;
  } catch (error) {
    console.error("Error generating grammar exercise:", error);
    throw new Error("Failed to generate grammar exercise");
  }
}

export async function generateReadingExercise(
  difficulty: string,
  topic?: string
): Promise<ReadingExercise> {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: readingPrompt(difficulty, topic) }],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_reading_exercise",
          schema: ReadingExerciseSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const exercise = processAIResponse<ReadingExercise>(content, [
      "title",
      "text",
      "difficulty",
      "questions",
    ]);

    // Ensure difficulty is set correctly
    exercise.difficulty = difficulty as any;

    return exercise;
  } catch (error) {
    console.error("Error generating reading exercise:", error);
    throw new Error("Failed to generate reading exercise");
  }
}

export async function generateVocabularyWords(
  count: number = 5,
  difficulty: string,
  category?: string
): Promise<VocabularyWord[]> {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: vocabularyWordsPrompt(count, difficulty, category),
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_vocabulary_words",
          schema: VocabularyWordsSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const words = processAIResponse<VocabularyWord[]>(content);

    // Ensure difficulty is set correctly for all words
    words.forEach((word) => {
      word.difficulty = difficulty as any;
    });

    return words;
  } catch (error) {
    console.error("Error generating vocabulary words:", error);
    throw new Error("Failed to generate vocabulary words");
  }
}

export async function generateTranslationExercise(
  difficulty: string,
  direction: "german-to-english" | "english-to-german" = "english-to-german"
): Promise<GermanExercise> {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "user", content: translationPrompt(difficulty, direction) },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_translation_exercise",
          schema: GermanExerciseSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const exercise = processAIResponse<GermanExercise>(content, [
      "type",
      "difficulty",
      "question",
      "correctAnswer",
      "explanation",
      "topic",
    ]);

    // Ensure type is set correctly
    exercise.type = "translation";
    exercise.difficulty = difficulty as any;

    return exercise;
  } catch (error) {
    console.error("Error generating translation exercise:", error);
    throw new Error("Failed to generate translation exercise");
  }
}

export async function generateWritingExercise(
  difficulty: string,
  topic?: string,
  exerciseType: string = "guided"
): Promise<WritingExercise> {
  const topicGuidance =
    topic || "daily life, personal experiences, or current events";

  const difficultyGuidelines = {
    A2_BASIC: {
      minWords: 50,
      maxWords: 100,
      complexity: "simple sentences, basic vocabulary, present tense focus",
    },
    A2_INTERMEDIATE: {
      minWords: 80,
      maxWords: 150,
      complexity: "compound sentences, past tense, common expressions",
    },
    B1_BASIC: {
      minWords: 120,
      maxWords: 200,
      complexity: "complex sentences, varied vocabulary, multiple tenses",
    },
    B1_INTERMEDIATE: {
      minWords: 150,
      maxWords: 250,
      complexity:
        "sophisticated structure, abstract concepts, formal/informal register",
    },
    B1_ADVANCED: {
      minWords: 200,
      maxWords: 300,
      complexity:
        "advanced vocabulary, cultural references, nuanced expression",
    },
  };

  const guidelines =
    difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines];

  const exerciseTypes = {
    guided: "structured writing with specific prompts and guidelines",
    creative: "creative storytelling or imaginative writing",
    formal: "formal letter, email, or business communication",
    descriptive: "detailed description of people, places, or events",
  };

  const prompt = `
Create a German writing exercise for ${difficulty} level learners (English speakers).
Topic: ${topicGuidance}
Exercise type: ${exerciseTypes[exerciseType as keyof typeof exerciseTypes]}

Requirements:
- Provide a clear, engaging writing prompt in English
- Include 4-6 specific guidelines to help structure the writing
- Set appropriate word count (${guidelines.minWords}-${
    guidelines.maxWords
  } words)
- Ensure the task matches the complexity level: ${guidelines.complexity}
- Make it practical and relevant to real-world communication

Return ONLY a valid JSON object with this exact structure:
{
  "prompt": "Clear, engaging writing task in English",
  "difficulty": "${difficulty}",
  "topic": "specific topic category",
  "guidelines": [
    "Guideline 1 for structuring the writing",
    "Guideline 2 for content requirements", 
    "Guideline 3 for grammar/vocabulary focus",
    "Guideline 4 for style or tone"
  ],
  "minWords": ${guidelines.minWords},
  "maxWords": ${guidelines.maxWords}
}

Make the prompt engaging and culturally relevant to German-speaking countries.`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_writing_exercise",
          schema: WritingExerciseSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const exercise = processAIResponse<WritingExercise>(content, [
      "prompt",
      "difficulty",
      "topic",
      "guidelines",
      "minWords",
      "maxWords",
    ]);

    // Ensure difficulty is set correctly
    exercise.difficulty = difficulty as any;

    return exercise;
  } catch (error) {
    console.error("Error generating writing exercise:", error);
    throw new Error("Failed to generate writing exercise");
  }
}

export async function generateSentenceConstructionExercise(
  difficulty: string,
  grammarFocus?: string
): Promise<SentenceConstructionExercise> {
  const focus = grammarFocus || "word order, cases, or verb conjugation";

  const prompt = `
Create a German sentence construction exercise for ${difficulty} level learners (English speakers).
Grammar focus: ${focus}

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

Return ONLY a valid JSON object with this exact structure:
{
  "instruction": "Clear instruction: 'Arrange these words to create a German sentence that...'",
  "correctSentence": "The complete correct German sentence",
  "wordBlocks": ["word1", "word2", "word3", "word4", "etc"],
  "difficulty": "${difficulty}",
  "topic": "grammar topic being tested (e.g., 'Word Order', 'Dative Case')",
  "explanation": "Detailed explanation of the grammar rules and word order principles that apply to this sentence"
}

Make the sentence practical and useful for communication while clearly testing the target grammar concept.`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_sentence_construction",
          schema: SentenceConstructionSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const exercise = processAIResponse<SentenceConstructionExercise>(content, [
      "instruction",
      "correctSentence",
      "wordBlocks",
      "difficulty",
      "topic",
      "explanation",
    ]);

    // Ensure difficulty is set correctly
    exercise.difficulty = difficulty as any;

    return exercise;
  } catch (error) {
    console.error("Error generating sentence construction exercise:", error);
    throw new Error("Failed to generate sentence construction exercise");
  }
}

export async function generateErrorCorrectionExercise(
  difficulty: string,
  errorType: string = "mixed"
): Promise<ErrorCorrectionExercise> {
  const prompt = `
Create a German error correction exercise for ${difficulty} level learners (English speakers).
Error type focus: ${errorType}

Requirements:
- Create a German text with 3-5 deliberate errors
- Errors should be realistic mistakes that learners commonly make
- Provide the correct version and detailed explanations
- Include character positions for each error (start and end positions in the text)
- Make errors appropriate for the difficulty level

Error types to include:
- Grammar: cases, verb conjugation, adjective endings, word order
- Vocabulary: false friends, inappropriate word choice, spelling
- Mixed: combination of grammar and vocabulary errors

Difficulty guidelines:
- A2_BASIC: Basic case errors, simple verb forms, common vocabulary mistakes
- A2_INTERMEDIATE: Modal verbs, past tense, preposition errors
- B1_BASIC: Complex cases, subjunctive, advanced vocabulary
- B1_INTERMEDIATE: Sophisticated grammar, formal/informal register
- B1_ADVANCED: Nuanced errors, cultural/idiomatic mistakes

Return ONLY a valid JSON object with this exact structure:
{
  "instruction": "Find and identify the errors in this German text",
  "incorrectText": "German text with 3-5 deliberate errors",
  "correctText": "The same text with all errors corrected",
  "errors": [
    {
      "start": 15,
      "end": 23,
      "error": "incorrect word or phrase",
      "correction": "correct word or phrase", 
      "explanation": "explanation of why this is wrong and the rule that applies"
    }
  ],
  "difficulty": "${difficulty}",
  "topic": "type of errors focus (e.g., 'Case Errors', 'Verb Conjugation')"
}

Make the text meaningful and the errors realistic to what German learners would actually make.`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "german_error_correction",
          schema: ErrorCorrectionSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const exercise = processAIResponse<ErrorCorrectionExercise>(content, [
      "instruction",
      "incorrectText",
      "correctText",
      "errors",
      "difficulty",
      "topic",
    ]);

    // Ensure difficulty is set correctly
    exercise.difficulty = difficulty as any;

    return exercise;
  } catch (error) {
    console.error("Error generating error correction exercise:", error);
    throw new Error("Failed to generate error correction exercise");
  }
}
