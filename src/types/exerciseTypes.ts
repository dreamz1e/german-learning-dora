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
  promptDe: string;
  promptEn: string;
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  topic: string;
  guidelines: Array<{ de: string; en: string }>;
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

export interface BatchExercises {
  batchId: string;
  topic: string;
  difficulty:
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED";
  exercises: GermanExercise[];
}

export interface ExerciseCycleManager {
  currentBatch: BatchExercises | null;
  currentIndex: number;
  exerciseType: "vocabulary" | "grammar";
  userId: string;
  difficulty: string;
  topicHistory: string[];
}

// Topic pools for varied content generation
export const vocabularyTopics = [
  "Daily Life & Routine",
  "Food & Cooking",
  "Travel & Transportation",
  "Work & Career",
  "Health & Body",
  "Family & Relationships",
  "Hobbies & Leisure",
  "Environment & Nature",
  "Technology & Media",
  "Shopping & Money",
  "Education & Learning",
  "Home & Living",
];

export const grammarTopics = [
  "Verb Conjugation & Tenses",
  "Cases & Declensions",
  "Word Order & Sentence Structure",
  "Modal Verbs & Auxiliaries",
  "Prepositions & Fixed Expressions",
  "Adjective Endings & Comparison",
  "Subordinate Clauses & Conjunctions",
  "Passive Voice & Reflexive Verbs",
  "Conditional & Subjunctive",
  "Questions & Negation",
];
