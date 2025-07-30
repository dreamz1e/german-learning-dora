// JSON schemas for structured output

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
    },
    options: {
      type: "array",
      items: {
        type: "string",
      },
    },
    correctAnswer: {
      type: "string",
    },
    explanation: {
      type: "string",
    },
    topic: {
      type: "string",
    },
    germanText: {
      type: "string",
    },
    englishText: {
      type: "string",
    },
  },
  required: [
    "type",
    "difficulty",
    "question",
    "correctAnswer",
    "explanation",
    "topic",
  ],
  additionalProperties: false,
};

export const VocabularyWordSchema = {
  type: "object",
  properties: {
    german: {
      type: "string",
    },
    english: {
      type: "string",
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
    },
    exampleSentence: {
      type: "string",
    },
    pronunciation: {
      type: "string",
    },
  },
  required: ["german", "english", "difficulty", "category", "exampleSentence"],
  additionalProperties: false,
};

export const VocabularyWordsSchema = {
  type: "array",
  items: VocabularyWordSchema,
};

export const ReadingExerciseQuestionSchema = {
  type: "object",
  properties: {
    question: {
      type: "string",
    },
    options: {
      type: "array",
      items: {
        type: "string",
      },
      minItems: 4,
      maxItems: 4,
    },
    correctAnswer: {
      type: "string",
    },
    explanation: {
      type: "string",
    },
  },
  required: ["question", "options", "correctAnswer", "explanation"],
  additionalProperties: false,
};

export const ReadingExerciseSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    text: {
      type: "string",
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
      items: ReadingExerciseQuestionSchema,
      minItems: 3,
      maxItems: 4,
    },
  },
  required: ["title", "text", "difficulty", "questions"],
  additionalProperties: false,
};
