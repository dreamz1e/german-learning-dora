// JSON Schema definitions for AI-generated content validation

export const GermanExerciseSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [
        "vocabulary",
        "grammar",
        "reading",
        "listening",
        "translation",
        "fill-blank",
      ],
    },
    difficulty: {
      type: "string",
      enum: [
        "A2_BASIC",
        "A2_INTERMEDIATE",
        "B1_BASIC",
        "B1_INTERMEDIATE",
        "B1_ADVANCED",
      ],
    },
    question: {
      type: "string",
      minLength: 10,
      maxLength: 500,
    },
    options: {
      type: "array",
      items: {
        type: "string",
        minLength: 1,
        maxLength: 200,
      },
      minItems: 4,
      maxItems: 4,
    },
    correctAnswer: {
      type: "string",
      minLength: 1,
      maxLength: 200,
    },
    explanation: {
      type: "string",
      minLength: 20,
      maxLength: 1000,
    },
    topic: {
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    germanText: {
      type: "string",
      maxLength: 500,
    },
    englishText: {
      type: "string",
      maxLength: 500,
    },
  },
  required: [
    "type",
    "difficulty",
    "question",
    "options",
    "correctAnswer",
    "explanation",
    "topic",
  ],
  additionalProperties: false,
};

export const VocabularyWordsSchema = {
  type: "object",
  properties: {
    words: {
      type: "array",
      items: {
        type: "object",
        properties: {
          german: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
          english: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
          difficulty: {
            type: "string",
            enum: [
              "A2_BASIC",
              "A2_INTERMEDIATE",
              "B1_BASIC",
              "B1_INTERMEDIATE",
              "B1_ADVANCED",
            ],
          },
          category: {
            type: "string",
            minLength: 3,
            maxLength: 50,
          },
          exampleSentence: {
            type: "string",
            minLength: 10,
            maxLength: 300,
          },
        },
        required: [
          "german",
          "english",
          "difficulty",
          "category",
          "exampleSentence",
        ],
        additionalProperties: false,
      },
      minItems: 1,
      maxItems: 10,
    },
  },
  required: ["words"],
  additionalProperties: false,
};

export const ReadingExerciseSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      minLength: 5,
      maxLength: 100,
    },
    text: {
      type: "string",
      minLength: 150,
      maxLength: 500,
    },
    difficulty: {
      type: "string",
      enum: [
        "A2_BASIC",
        "A2_INTERMEDIATE",
        "B1_BASIC",
        "B1_INTERMEDIATE",
        "B1_ADVANCED",
      ],
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            minLength: 10,
            maxLength: 200,
          },
          options: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
              maxLength: 150,
            },
            minItems: 4,
            maxItems: 4,
          },
          correctAnswer: {
            type: "string",
            minLength: 1,
            maxLength: 150,
          },
          explanation: {
            type: "string",
            minLength: 15,
            maxLength: 500,
          },
        },
        required: ["question", "options", "correctAnswer", "explanation"],
        additionalProperties: false,
      },
      minItems: 3,
      maxItems: 5,
    },
  },
  required: ["title", "text", "difficulty", "questions"],
  additionalProperties: false,
};

export const WritingExerciseSchema = {
  type: "object",
  properties: {
    promptDe: {
      type: "string",
      minLength: 10,
      maxLength: 500,
    },
    promptEn: {
      type: "string",
      minLength: 10,
      maxLength: 500,
    },
    difficulty: {
      type: "string",
      enum: [
        "A2_BASIC",
        "A2_INTERMEDIATE",
        "B1_BASIC",
        "B1_INTERMEDIATE",
        "B1_ADVANCED",
      ],
    },
    topic: {
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    guidelines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          de: { type: "string", minLength: 5, maxLength: 200 },
          en: { type: "string", minLength: 5, maxLength: 200 },
        },
        required: ["de", "en"],
        additionalProperties: false,
      },
      minItems: 3,
      maxItems: 8,
    },
    minWords: {
      type: "number",
      minimum: 20,
      maximum: 500,
    },
    maxWords: {
      type: "number",
      minimum: 50,
      maximum: 1000,
    },
  },
  required: [
    "promptDe",
    "promptEn",
    "difficulty",
    "topic",
    "guidelines",
    "minWords",
    "maxWords",
  ],
  additionalProperties: false,
};

export const SentenceConstructionSchema = {
  type: "object",
  properties: {
    instruction: {
      type: "string",
      minLength: 20,
      maxLength: 300,
    },
    correctSentence: {
      type: "string",
      minLength: 10,
      maxLength: 200,
    },
    wordBlocks: {
      type: "array",
      items: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      minItems: 5,
      maxItems: 20,
    },
    difficulty: {
      type: "string",
      enum: [
        "A2_BASIC",
        "A2_INTERMEDIATE",
        "B1_BASIC",
        "B1_INTERMEDIATE",
        "B1_ADVANCED",
      ],
    },
    topic: {
      type: "string",
      minLength: 5,
      maxLength: 100,
    },
    explanation: {
      type: "string",
      minLength: 30,
      maxLength: 500,
    },
  },
  required: [
    "instruction",
    "correctSentence",
    "wordBlocks",
    "difficulty",
    "topic",
    "explanation",
  ],
  additionalProperties: false,
};

export const ErrorCorrectionSchema = {
  type: "object",
  properties: {
    instruction: {
      type: "string",
      minLength: 20,
      maxLength: 300,
    },
    incorrectText: {
      type: "string",
      minLength: 50,
      maxLength: 500,
    },
    correctText: {
      type: "string",
      minLength: 50,
      maxLength: 500,
    },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: {
            type: "number",
            minimum: 0,
          },
          end: {
            type: "number",
            minimum: 0,
          },
          error: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
          correction: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
          explanation: {
            type: "string",
            minLength: 10,
            maxLength: 300,
          },
        },
        required: ["start", "end", "error", "correction", "explanation"],
        additionalProperties: false,
      },
      minItems: 2,
      maxItems: 6,
    },
    difficulty: {
      type: "string",
      enum: [
        "A2_BASIC",
        "A2_INTERMEDIATE",
        "B1_BASIC",
        "B1_INTERMEDIATE",
        "B1_ADVANCED",
      ],
    },
    topic: {
      type: "string",
      minLength: 5,
      maxLength: 100,
    },
  },
  required: [
    "instruction",
    "incorrectText",
    "correctText",
    "errors",
    "difficulty",
    "topic",
  ],
  additionalProperties: false,
};

export const WritingEvaluationSchema = {
  type: "object",
  properties: {
    overallScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    grammarScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    vocabularyScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    structureScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    correctedText: {
      type: "string",
    },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: {
            type: "integer",
          },
          end: {
            type: "integer",
          },
          originalText: {
            type: "string",
          },
          correctedText: {
            type: "string",
          },
          errorType: {
            type: "string",
          },
          severity: {
            type: "string",
          },
          explanation: {
            type: "string",
          },
          suggestion: {
            type: "string",
          },
        },
        required: [
          "start",
          "end",
          "originalText",
          "correctedText",
          "errorType",
          "severity",
          "explanation",
          "suggestion",
        ],
      },
    },
    positiveAspects: {
      type: "array",
      items: {
        type: "string",
      },
    },
    improvementSuggestions: {
      type: "array",
      items: {
        type: "string",
      },
    },
    difficulty: {
      type: "string",
    },
    wordCount: {
      type: "integer",
    },
  },
  required: [
    "overallScore",
    "grammarScore",
    "vocabularyScore",
    "structureScore",
    "correctedText",
    "errors",
    "positiveAspects",
    "improvementSuggestions",
    "difficulty",
    "wordCount",
  ],
};

// Batch Exercise Generation Schemas
export const BatchGrammarExercisesSchema = {
  type: "object",
  properties: {
    batchId: {
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    topic: {
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    difficulty: {
      type: "string",
      enum: [
        "A2_BASIC",
        "A2_INTERMEDIATE",
        "B1_BASIC",
        "B1_INTERMEDIATE",
        "B1_ADVANCED",
      ],
    },
    exercises: {
      type: "array",
      items: GermanExerciseSchema,
      minItems: 10,
      maxItems: 10,
    },
  },
  required: ["batchId", "topic", "difficulty", "exercises"],
  additionalProperties: false,
};

export const BatchVocabularyExercisesSchema = {
  type: "object",
  properties: {
    batchId: {
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    topic: {
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    difficulty: {
      type: "string",
      enum: [
        "A2_BASIC",
        "A2_INTERMEDIATE",
        "B1_BASIC",
        "B1_INTERMEDIATE",
        "B1_ADVANCED",
      ],
    },
    exercises: {
      type: "array",
      items: GermanExerciseSchema,
      minItems: 10,
      maxItems: 10,
    },
  },
  required: ["batchId", "topic", "difficulty", "exercises"],
  additionalProperties: false,
};
