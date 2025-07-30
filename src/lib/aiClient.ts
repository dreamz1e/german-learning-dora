import OpenAI from "openai";
import { vocabularyPrompt } from "./prompts/vocabularyPrompt";
import { grammarPrompt } from "./prompts/grammarPrompt";
import { readingPrompt } from "./prompts/readingPrompt";
import { vocabularyWordsPrompt } from "./prompts/vocabularyWordsPrompt";
import { translationPrompt } from "./prompts/translationPrompt";
import { createWritingPrompt } from "./prompts/writingPrompt";
import { sentenceConstructionPrompt } from "./prompts/sentenceConstructionPrompt";
import { errorCorrectionPrompt } from "./prompts/errorCorrectionPrompt";
import {
  GermanExerciseSchema,
  VocabularyWordsSchema,
  ReadingExerciseSchema,
  WritingExerciseSchema,
  SentenceConstructionSchema,
  ErrorCorrectionSchema,
} from "./schemas";
import { processAIResponse } from "./responseUtils";
import { ContentTracker } from "./contentTracker";

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
  topic?: string,
  userId: string = "anonymous"
): Promise<GermanExercise> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Generate variation seed for unique content
      const variationSeed = ContentTracker.generateVariationSeed(
        userId,
        "vocabulary",
        difficulty,
        topic
      );

      // Add randomness to temperature based on attempt number
      const temperature = 0.7 + attempt * 0.1;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: vocabularyPrompt(difficulty, topic, variationSeed),
          },
        ],
        temperature: Math.min(temperature, 1.0),
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

      // Check if content is too similar to recent generations
      const exerciseKey = `${exercise.question}-${exercise.germanText || ""}`;
      if (ContentTracker.isDuplicate(exerciseKey) && attempt < maxRetries - 1) {
        console.log(
          `Duplicate vocabulary content detected on attempt ${
            attempt + 1
          }, retrying...`
        );
        attempt++;
        continue;
      }

      // Ensure type is set correctly
      exercise.type = "vocabulary";
      exercise.difficulty = difficulty as any;

      // Track this content to prevent future duplicates
      const exerciseContentForTracking = `${exercise.question}-${
        exercise.germanText || ""
      }`;
      ContentTracker.trackContent(exerciseContentForTracking);

      return exercise;
    } catch (error) {
      console.error(
        `Error generating vocabulary exercise on attempt ${attempt + 1}:`,
        error
      );
      attempt++;

      if (attempt >= maxRetries) {
        throw new Error(
          "Failed to generate vocabulary exercise after multiple attempts"
        );
      }
    }
  }

  throw new Error("Failed to generate vocabulary exercise");
}

export async function generateGrammarExercise(
  difficulty: string,
  grammarTopic?: string,
  userId: string = "anonymous"
): Promise<GermanExercise> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Generate variation seed for unique content
      const variationSeed = ContentTracker.generateVariationSeed(
        userId,
        "grammar",
        difficulty,
        grammarTopic
      );

      // Add randomness to temperature based on attempt number
      const temperature = 0.7 + attempt * 0.1; // Increase creativity on retries

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: grammarPrompt(
              difficulty,
              grammarTopic,
              "multiple-choice",
              variationSeed
            ),
          },
        ],
        temperature: Math.min(temperature, 1.0),
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
      console.log(content);
      if (!content) throw new Error("No content generated");

      const exercise = processAIResponse<GermanExercise>(content, [
        "type",
        "difficulty",
        "question",
        "correctAnswer",
        "explanation",
        "topic",
      ]);

      // Check if content is too similar to recent generations
      const exerciseKey = `${exercise.question}-${exercise.germanText || ""}`;
      if (ContentTracker.isDuplicate(exerciseKey) && attempt < maxRetries - 1) {
        console.log(
          `Duplicate content detected on attempt ${attempt + 1}, retrying...`
        );
        attempt++;
        continue;
      }

      // Ensure type is set correctly
      exercise.type = "grammar";
      exercise.difficulty = difficulty as any;

      // Track this content to prevent future duplicates
      const exerciseContentForTracking = `${exercise.question}-${
        exercise.germanText || ""
      }`;
      ContentTracker.trackContent(exerciseContentForTracking);

      return exercise;
    } catch (error) {
      console.error(
        `Error generating grammar exercise on attempt ${attempt + 1}:`,
        error
      );
      attempt++;

      if (attempt >= maxRetries) {
        throw new Error(
          "Failed to generate grammar exercise after multiple attempts"
        );
      }
    }
  }

  throw new Error("Failed to generate grammar exercise");
}

export async function generateReadingExercise(
  difficulty: string,
  topic?: string,
  userId: string = "anonymous"
): Promise<ReadingExercise> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Generate variation seed for unique content
      const variationSeed = ContentTracker.generateVariationSeed(
        userId,
        "reading",
        difficulty,
        topic
      );

      // Add randomness to temperature based on attempt number
      const temperature = 0.8 + attempt * 0.1;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: readingPrompt(difficulty, topic, variationSeed),
          },
        ],
        temperature: Math.min(temperature, 1.0),
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

      // Check if content is too similar to recent generations
      const exerciseKey = `${exercise.title}-${
        exercise.text?.substring(0, 100) || ""
      }`;
      if (ContentTracker.isDuplicate(exerciseKey) && attempt < maxRetries - 1) {
        console.log(
          `Duplicate reading content detected on attempt ${
            attempt + 1
          }, retrying...`
        );
        attempt++;
        continue;
      }

      // Ensure difficulty is set correctly
      exercise.difficulty = difficulty as any;

      // Track this content to prevent future duplicates
      const exerciseContentForTracking = `${exercise.title}-${
        exercise.text?.substring(0, 100) || ""
      }`;
      ContentTracker.trackContent(exerciseContentForTracking);

      return exercise;
    } catch (error) {
      console.error(
        `Error generating reading exercise on attempt ${attempt + 1}:`,
        error
      );
      attempt++;

      if (attempt >= maxRetries) {
        throw new Error(
          "Failed to generate reading exercise after multiple attempts"
        );
      }
    }
  }

  throw new Error("Failed to generate reading exercise");
}

export async function generateVocabularyWords(
  count: number = 5,
  difficulty: string,
  category?: string,
  userId: string = "anonymous"
): Promise<VocabularyWord[]> {
  try {
    // Generate variation seed for unique content
    const variationSeed = ContentTracker.generateVariationSeed(
      userId,
      "vocabulary-words",
      difficulty,
      category
    );

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: vocabularyWordsPrompt(
            count,
            difficulty,
            category,
            variationSeed
          ),
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
  direction: "german-to-english" | "english-to-german" = "english-to-german",
  userId: string = "anonymous"
): Promise<GermanExercise> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Generate variation seed for unique content
      const variationSeed = ContentTracker.generateVariationSeed(
        userId,
        "translation",
        difficulty,
        direction
      );

      // Add randomness to temperature based on attempt number
      const temperature = 0.7 + attempt * 0.1;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: translationPrompt(difficulty, direction, variationSeed),
          },
        ],
        temperature: Math.min(temperature, 1.0),
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

      // Check if content is too similar to recent generations
      const exerciseKey = `${exercise.question}-${exercise.correctAnswer}`;
      if (ContentTracker.isDuplicate(exerciseKey) && attempt < maxRetries - 1) {
        console.log(
          `Duplicate translation content detected on attempt ${
            attempt + 1
          }, retrying...`
        );
        attempt++;
        continue;
      }

      // Ensure type is set correctly
      exercise.type = "translation";
      exercise.difficulty = difficulty as any;

      // Track this content to prevent future duplicates
      ContentTracker.trackContent(exerciseKey);

      return exercise;
    } catch (error) {
      console.error(
        `Error generating translation exercise on attempt ${attempt + 1}:`,
        error
      );
      attempt++;

      if (attempt >= maxRetries) {
        throw new Error(
          "Failed to generate translation exercise after multiple attempts"
        );
      }
    }
  }

  throw new Error("Failed to generate translation exercise");
}

export async function generateWritingExercise(
  difficulty: string,
  topic?: string,
  exerciseType: string = "guided",
  userId: string = "anonymous"
): Promise<WritingExercise> {
  try {
    // Generate variation seed for unique content
    const variationSeed = ContentTracker.generateVariationSeed(
      userId,
      "writing",
      difficulty,
      topic
    );

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: createWritingPrompt(
            difficulty,
            topic,
            exerciseType,
            variationSeed
          ),
        },
      ],
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
  grammarFocus?: string,
  userId: string = "anonymous"
): Promise<SentenceConstructionExercise> {
  try {
    // Generate variation seed for unique content
    const variationSeed = ContentTracker.generateVariationSeed(
      userId,
      "sentence-construction",
      difficulty,
      grammarFocus
    );

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: sentenceConstructionPrompt(
            difficulty,
            grammarFocus,
            variationSeed
          ),
        },
      ],
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
  errorType: string = "mixed",
  userId: string = "anonymous"
): Promise<ErrorCorrectionExercise> {
  try {
    // Generate variation seed for unique content
    const variationSeed = ContentTracker.generateVariationSeed(
      userId,
      "error-correction",
      difficulty,
      errorType
    );

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: errorCorrectionPrompt(difficulty, errorType, variationSeed),
        },
      ],
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
