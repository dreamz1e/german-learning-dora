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
    | "fill-blank";
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
