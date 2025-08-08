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
import { batchVocabularyPrompt } from "./prompts/batchVocabularyPrompt";
import { batchGrammarPrompt } from "./prompts/batchGrammarPrompt";
import {
  GermanExerciseSchema,
  VocabularyWordsSchema,
  ReadingExerciseSchema,
  WritingExerciseSchema,
  SentenceConstructionSchema,
  ErrorCorrectionSchema,
  WritingEvaluationSchema,
  BatchGrammarExercisesSchema,
  BatchVocabularyExercisesSchema,
} from "./schemas";
import { processAIResponse } from "./responseUtils";
import { ContentTracker } from "./contentTracker";
import {
  ExerciseCycleManager,
  vocabularyTopics,
  grammarTopics,
  BatchExercises,
  GermanExercise,
  ReadingExercise,
  VocabularyWord,
  WritingExercise,
  SentenceConstructionExercise,
  ErrorCorrectionExercise,
  WritingEvaluation,
  WritingEvaluationError,
} from "@/types/exerciseTypes";

// Configure OpenAI client for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = "openai/gpt-4.1";
const evaluationModel = "anthropic/claude-sonnet-4"; // Better for structured output

// In-memory exercise cycle managers (in production, this would be stored in database)
const exerciseCycleManagers = new Map<string, ExerciseCycleManager>();

function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function selectRandomTopic(
  topicPool: string[],
  excludeTopics: string[] = []
): string {
  const availableTopics = topicPool.filter(
    (topic) => !excludeTopics.includes(topic)
  );
  return availableTopics.length === 0
    ? topicPool[Math.floor(Math.random() * topicPool.length)]
    : availableTopics[Math.floor(Math.random() * availableTopics.length)];
}

// Helper function to reduce code duplication in exercise generation
async function generateExerciseWithRetry<T>(
  generateFn: () => Promise<T>,
  exerciseType: string,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateFn();
    } catch (error) {
      console.error(
        `Error generating ${exerciseType} on attempt ${attempt + 1}:`,
        error
      );
      if (attempt === maxRetries - 1)
        throw new Error(
          `Failed to generate ${exerciseType} after ${maxRetries} attempts`
        );
    }
  }
  throw new Error(`Failed to generate ${exerciseType}`);
}

export async function generateBatchVocabularyExercises(
  difficulty: string,
  userId: string = "anonymous",
  topic?: string,
  direction: "german-to-english" | "english-to-german" = "german-to-english"
): Promise<BatchExercises> {
  const manager = exerciseCycleManagers.get(`vocab_${userId}`) || {
    currentBatch: null,
    currentIndex: 0,
    exerciseType: "vocabulary" as const,
    userId,
    difficulty,
    topicHistory: [],
  };

  const selectedTopic =
    topic ||
    selectRandomTopic(vocabularyTopics, manager.topicHistory.slice(-3));
  const variationSeed = ContentTracker.generateVariationSeed(
    userId,
    "vocabulary-batch",
    difficulty,
    selectedTopic
  );

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "user",
        content: batchVocabularyPrompt(
          difficulty,
          selectedTopic,
          variationSeed,
          direction
        ),
      },
    ],
    temperature: 0.2,
    max_tokens: 6000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "batch_vocabulary_exercises",
        schema: BatchVocabularyExercisesSchema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No content generated");

  const batchExercises = processAIResponse<BatchExercises>(content, [
    "batchId",
    "topic",
    "difficulty",
    "exercises",
  ]);

  // Set proper values
  batchExercises.batchId = generateBatchId();
  batchExercises.difficulty = difficulty as any;
  batchExercises.exercises.forEach((ex) => {
    ex.type = "vocabulary";
    ex.difficulty = difficulty as any;
  });

  // Track content and update history
  const exerciseKeys = batchExercises.exercises.map(
    (ex) => `${ex.question}-${ex.germanText || ""}`
  );
  exerciseKeys.forEach((key) => ContentTracker.trackContent(key));

  manager.topicHistory.push(selectedTopic);
  if (manager.topicHistory.length > 5)
    manager.topicHistory = manager.topicHistory.slice(-5);

  console.log(`Generated vocabulary batch: ${selectedTopic}`);
  return batchExercises;
}

export async function generateBatchGrammarExercises(
  difficulty: string,
  userId: string = "anonymous",
  grammarTopic?: string
): Promise<BatchExercises> {
  const manager = exerciseCycleManagers.get(`grammar_${userId}`) || {
    currentBatch: null,
    currentIndex: 0,
    exerciseType: "grammar" as const,
    userId,
    difficulty,
    topicHistory: [],
  };

  const selectedTopic =
    grammarTopic ||
    selectRandomTopic(grammarTopics, manager.topicHistory.slice(-3));
  const variationSeed = ContentTracker.generateVariationSeed(
    userId,
    "grammar-batch",
    difficulty,
    selectedTopic
  );

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "user",
        content: batchGrammarPrompt(difficulty, selectedTopic, variationSeed),
      },
    ],
    temperature: 0.2,
    max_tokens: 7000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "batch_grammar_exercises",
        schema: BatchGrammarExercisesSchema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No content generated");

  const batchExercises = processAIResponse<BatchExercises>(content, [
    "batchId",
    "topic",
    "difficulty",
    "exercises",
  ]);

  // Set proper values
  batchExercises.batchId = generateBatchId();
  batchExercises.difficulty = difficulty as any;
  batchExercises.exercises.forEach((ex) => {
    ex.type = "grammar";
    ex.difficulty = difficulty as any;
  });

  // Track content and update history
  const exerciseKeys = batchExercises.exercises.map(
    (ex) => `${ex.question}-${ex.germanText || ""}`
  );
  exerciseKeys.forEach((key) => ContentTracker.trackContent(key));

  manager.topicHistory.push(selectedTopic);
  if (manager.topicHistory.length > 5)
    manager.topicHistory = manager.topicHistory.slice(-5);

  console.log(`Generated grammar batch: ${selectedTopic}`);
  return batchExercises;
}

export function initializeExerciseCycleManager(
  exerciseType: "vocabulary" | "grammar",
  userId: string,
  difficulty: string
): ExerciseCycleManager {
  const manager: ExerciseCycleManager = {
    currentBatch: null,
    currentIndex: 0,
    exerciseType,
    userId,
    difficulty,
    topicHistory: [],
  };
  exerciseCycleManagers.set(`${exerciseType}_${userId}`, manager);
  return manager;
}

export async function getNextExercise(
  exerciseType: "vocabulary" | "grammar",
  userId: string,
  difficulty: string,
  topic?: string,
  direction?: "german-to-english" | "english-to-german"
): Promise<GermanExercise> {
  const key = `${exerciseType}_${userId}`;
  let manager =
    exerciseCycleManagers.get(key) ||
    initializeExerciseCycleManager(exerciseType, userId, difficulty);

  // Generate new batch if needed
  if (
    !manager.currentBatch ||
    manager.currentIndex >= manager.currentBatch.exercises.length
  ) {
    console.log(`Generating new ${exerciseType} batch for user ${userId}`);

    manager.currentBatch =
      exerciseType === "vocabulary"
        ? await generateBatchVocabularyExercises(
            difficulty,
            userId,
            topic,
            direction
          )
        : await generateBatchGrammarExercises(difficulty, userId, topic);

    manager.currentIndex = 0;
    exerciseCycleManagers.set(key, manager);
  }

  const exercise = manager.currentBatch.exercises[manager.currentIndex++];
  exerciseCycleManagers.set(key, manager);

  console.log(
    `Serving exercise ${manager.currentIndex}/${manager.currentBatch.exercises.length} from: ${manager.currentBatch.topic}`
  );
  return exercise;
}

export function getCurrentBatchInfo(
  exerciseType: "vocabulary" | "grammar",
  userId: string
): { topic: string; remaining: number; total: number } | null {
  const manager = exerciseCycleManagers.get(`${exerciseType}_${userId}`);
  if (!manager?.currentBatch) return null;

  return {
    topic: manager.currentBatch.topic,
    remaining: manager.currentBatch.exercises.length - manager.currentIndex,
    total: manager.currentBatch.exercises.length,
  };
}

export function resetExerciseBatch(
  exerciseType: "vocabulary" | "grammar",
  userId: string
): void {
  const key = `${exerciseType}_${userId}`;
  const manager = exerciseCycleManagers.get(key);

  if (manager) {
    manager.currentBatch = null;
    manager.currentIndex = 0;
    exerciseCycleManagers.set(key, manager);
    console.log(`Reset ${exerciseType} batch for user ${userId}`);
  }
}

export async function generateVocabularyExercise(
  difficulty: string,
  topic?: string,
  userId: string = "anonymous",
  direction: "german-to-english" | "english-to-german" = "german-to-english"
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

      // Lower base temperature for reliability; gently increase on retries
      const temperature = 0.3 + attempt * 0.1;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: vocabularyPrompt(
              difficulty,
              topic,
              variationSeed,
              direction
            ),
          },
        ],
        temperature: Math.min(temperature, 0.6),
        presence_penalty: 0.2,
        frequency_penalty: 0.2,
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

      // Lower base temperature for reliability; gently increase on retries
      const temperature = 0.3 + attempt * 0.1;

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
        temperature: Math.min(temperature, 0.5),
        presence_penalty: 0.2,
        frequency_penalty: 0.2,
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
        max_tokens: 4000,
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
        max_tokens: 5000, // Increased to avoid truncation
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
