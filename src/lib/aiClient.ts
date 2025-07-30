import OpenAI from "openai";
import { vocabularyPrompt } from "./prompts/vocabularyPrompt";
import { grammarPrompt } from "./prompts/grammarPrompt";
import { readingPrompt } from "./prompts/readingPrompt";
import { vocabularyWordsPrompt } from "./prompts/vocabularyWordsPrompt";
import { translationPrompt } from "./prompts/translationPrompt";
import { createWritingPrompt } from "./prompts/writingPrompt";
import { sentenceConstructionPrompt } from "./prompts/sentenceConstructionPrompt";
import { errorCorrectionPrompt } from "./prompts/errorCorrectionPrompt";
import { createWritingEvaluationPrompt } from "./prompts/writingEvaluationPrompt";
import {
  GermanExerciseSchema,
  VocabularyWordsSchema,
  ReadingExerciseSchema,
  WritingExerciseSchema,
  SentenceConstructionSchema,
  ErrorCorrectionSchema,
  WritingEvaluationSchema,
} from "./schemas";
import { processAIResponse } from "./responseUtils";
import { ContentTracker } from "./contentTracker";

// Configure OpenAI client for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = "google/gemini-2.5-flash";
const evaluationModel = "openai/gpt-4.1"; // Better for structured output

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

export interface WritingEvaluationError {
  start: number;
  end: number;
  originalText: string;
  correctedText: string;
  errorType:
    | "grammar"
    | "vocabulary"
    | "spelling"
    | "syntax"
    | "punctuation"
    | "verb-conjugation"
    | "noun-declension"
    | "word-order"
    | "article-usage"
    | "preposition";
  severity: "minor" | "moderate" | "major";
  explanation: string;
  suggestion: string;
}

export interface WritingEvaluation {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  structureScore: number;
  correctedText: string;
  errors: WritingEvaluationError[];
  positiveAspects: string[];
  improvementSuggestions: string[];
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  wordCount: number;
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

export async function evaluateWriting(
  userText: string,
  difficulty: string,
  originalPrompt?: string,
  userId: string = "anonymous"
): Promise<WritingEvaluation> {
  const maxRetries = 2;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Try with JSON schema first
      const response = await openai.chat.completions.create({
        model: evaluationModel,
        messages: [
          {
            role: "user",
            content: createWritingEvaluationPrompt(
              userText,
              difficulty,
              originalPrompt
            ),
          },
        ],
        temperature: 0.3,
        max_tokens: 2000, // Increased to avoid truncation
        response_format:
          attempt === 0
            ? {
                type: "json_schema",
                json_schema: {
                  name: "german_writing_evaluation",
                  schema: WritingEvaluationSchema,
                },
              }
            : undefined, // Fallback without schema on retry
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No content generated");

      let evaluation: WritingEvaluation;

      try {
        evaluation = processAIResponse<WritingEvaluation>(content, [
          "overallScore",
          "grammarScore",
          "vocabularyScore",
          "structureScore",
          "correctedText",
        ]);
      } catch (parseError) {
        console.error(
          "JSON parsing failed, trying basic extraction:",
          parseError
        );
        // Try to extract basic info from malformed response
        evaluation = extractBasicEvaluation(content, userText, difficulty);
      }

      // Ensure difficulty is set correctly
      evaluation.difficulty = difficulty as any;

      // Calculate word count if not provided
      if (!evaluation.wordCount) {
        evaluation.wordCount = userText
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
      }

      // Ensure arrays exist even if empty
      evaluation.errors = evaluation.errors || [];
      evaluation.positiveAspects = evaluation.positiveAspects || [];
      evaluation.improvementSuggestions =
        evaluation.improvementSuggestions || [];

      return evaluation;
    } catch (error) {
      console.error(
        `Error evaluating writing on attempt ${attempt + 1}:`,
        error
      );
      attempt++;

      if (attempt >= maxRetries) {
        // Return a basic evaluation as fallback
        const wordCount = userText
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;

        return {
          overallScore: 70,
          grammarScore: 70,
          vocabularyScore: 70,
          structureScore: 70,
          correctedText: userText,
          errors: [],
          positiveAspects: ["Your writing shows effort and practice!"],
          improvementSuggestions: [
            "Continue practicing German writing regularly.",
          ],
          difficulty: difficulty as any,
          wordCount: wordCount,
        };
      }
    }
  }

  throw new Error("Failed to evaluate writing after retries");
}

// Function to extract basic evaluation data from malformed JSON responses
function extractBasicEvaluation(
  content: string,
  userText: string,
  difficulty: string
): WritingEvaluation {
  const wordCount = userText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Try to extract scores using regex
  const overallScore = extractScore(content, "overallScore") || 75;
  const grammarScore = extractScore(content, "grammarScore") || 70;
  const vocabularyScore = extractScore(content, "vocabularyScore") || 75;
  const structureScore = extractScore(content, "structureScore") || 75;

  // Try to extract corrected text
  const correctedTextMatch = content.match(/"correctedText":\s*"([^"]+)"/);
  const correctedText = correctedTextMatch ? correctedTextMatch[1] : userText;

  // Try to extract basic errors info
  const errors: WritingEvaluationError[] = [];
  const errorMatches = content.match(/"originalText":\s*"([^"]+)"/g);

  if (errorMatches && errorMatches.length > 0) {
    errorMatches.slice(0, 3).forEach((match, index) => {
      const originalTextMatch = match.match(/"originalText":\s*"([^"]+)"/);
      if (originalTextMatch) {
        const originalText = originalTextMatch[1];
        const start = userText.indexOf(originalText);
        if (start >= 0) {
          errors.push({
            start,
            end: start + originalText.length,
            originalText,
            correctedText: originalText, // Fallback
            errorType: "grammar",
            severity: "moderate",
            explanation: "Error detected in analysis",
            suggestion: "Review this section for improvements",
          });
        }
      }
    });
  }

  return {
    overallScore,
    grammarScore,
    vocabularyScore,
    structureScore,
    correctedText,
    errors,
    positiveAspects: ["Your writing shows good effort and practice!"],
    improvementSuggestions: [
      "Continue practicing German grammar and vocabulary.",
    ],
    difficulty: difficulty as any,
    wordCount,
  };
}

// Helper function to extract score values from text
function extractScore(content: string, scoreType: string): number | null {
  const regex = new RegExp(`"${scoreType}":\\s*(\\d+)`, "i");
  const match = content.match(regex);
  return match ? parseInt(match[1], 10) : null;
}
