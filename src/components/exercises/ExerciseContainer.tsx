"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { ExerciseResult, ExerciseSummary } from "./ExerciseSummary";

interface ExerciseContainerProps {
  title: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: string;
  difficulty: string;
  topic?: string;
  onComplete: (
    isCorrect: boolean,
    timeSpent: number,
    userAnswer?: string
  ) => void;
  onNextExercise: () => void;
  germanText?: string;
  englishText?: string;
  isLoadingNext?: boolean;
  showSummary?: boolean;
  exerciseResults?: ExerciseResult[];
  totalXp?: number;
  correctCount?: number;
  totalCount?: number;
  averageTime?: number;
  onContinue?: () => void;
  isDailyChallenge?: boolean;
  // When false, disables inline word translation (click-to-translate and bubble)
  enableWordTranslation?: boolean;
}

export function ExerciseContainer({
  title,
  question,
  options = [],
  correctAnswer,
  explanation,
  type,
  difficulty,
  topic,
  onComplete,
  onNextExercise,
  germanText,
  englishText,
  isLoadingNext = false,
  showSummary = false,
  exerciseResults = [],
  totalXp = 0,
  correctCount = 0,
  totalCount = 0,
  averageTime = 0,
  onContinue,
  isDailyChallenge = false,
  enableWordTranslation = true,
}: ExerciseContainerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const { addToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Translation bubble state
  const [bubble, setBubble] = useState<{
    word: string;
    translation: string;
    x: number;
    y: number;
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const requestTranslation = async (
    word: string,
    sentence?: string,
    anchor?: HTMLElement
  ) => {
    if (!word || word === "_______") return;
    try {
      setIsTranslating(true);
      const res = await fetch("/api/ai/translate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, sentence }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Position bubble relative to container
      if (anchor && containerRef.current) {
        const anchorRect = anchor.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const x = anchorRect.left - containerRect.left + anchorRect.width / 2;
        const y = anchorRect.top - containerRect.top; // top of word
        setBubble({ word, translation: data.translation, x, y });
        // Auto-hide after 3 seconds
        setTimeout(
          () => setBubble((b) => (b && b.word === word ? null : b)),
          3000
        );
      }
    } catch (e) {
      addToast({
        type: "error",
        title: "Translation failed",
        message: "Could not translate the word right now.",
        duration: 2500,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Render a text with clickable German words; blanks are shown as underscores and are not clickable
  const renderClickableGermanText = (text?: string) => {
    if (!text) return null;

    // Replace __BLANK__ tokens with a fixed underscore placeholder for display
    const BLANK_PLACEHOLDER = "_______";
    const fullSentence = text.replace(/__BLANK__/g, BLANK_PLACEHOLDER);

    // If translation is disabled, just return plain text with blanks shown
    if (!enableWordTranslation) {
      return <>{fullSentence}</>;
    }

    // Split into tokens: keep spaces and punctuation as separate parts
    const parts = fullSentence
      .split(/(\s+|[.,;:!?()"“”‚’'…])/g)
      .filter((p) => p !== "");

    return (
      <>
        {parts.map((part, idx) => {
          const isWord = /[A-Za-zÄÖÜäöüß]/.test(part);
          const isBlank = part === BLANK_PLACEHOLDER;
          if (isWord && !isBlank) {
            return (
              <span
                key={`w-${idx}-${part}`}
                className="cursor-help underline decoration-dotted decoration-pink-400 underline-offset-4 hover:text-pink-700"
                onClick={(e) =>
                  requestTranslation(part, fullSentence, e.currentTarget)
                }
              >
                {part}
              </span>
            );
          }
          return <span key={`t-${idx}`}>{part}</span>;
        })}
      </>
    );
  };

  // Shuffle options using Fisher-Yates algorithm
  const shuffledOptions = useMemo(() => {
    if (!options || options.length === 0) return [];

    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [options]);

  const handleSubmit = () => {
    if (!selectedAnswer) {
      addToast({
        type: "warning",
        title: "Please select an answer",
        message: "Choose one of the options before submitting.",
        duration: 3000,
      });
      return;
    }

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const isCorrect = selectedAnswer === correctAnswer;

    setIsAnswered(true);
    onComplete(isCorrect, timeSpent, selectedAnswer);

    addToast({
      type: isCorrect ? "success" : "error",
      title: isCorrect ? "Correct!" : "Incorrect",
      message: isCorrect
        ? "Well done!"
        : `The correct answer was: ${correctAnswer}`,
      duration: 4000,
    });
  };

  const handleNextExercise = () => {
    setSelectedAnswer("");
    setIsAnswered(false);
    onNextExercise();
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "A2_BASIC":
        return "success";
      case "A2_INTERMEDIATE":
        return "info";
      case "B1_BASIC":
        return "warning";
      case "B1_INTERMEDIATE":
        return "warning";
      case "B1_ADVANCED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDifficultyText = (diff: string) => {
    return diff.replace("_", " ");
  };

  // Show summary if requested
  if (showSummary) {
    return (
      <ExerciseSummary
        results={exerciseResults}
        totalXp={totalXp}
        correctCount={correctCount}
        totalCount={totalCount}
        averageTime={averageTime}
        onContinue={onContinue || onNextExercise}
        isDailyChallenge={isDailyChallenge}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative" ref={containerRef}>
      {/* Exercise Container with conditional blur and loading overlay */}
      <div
        className={`${
          isLoadingNext ? "pointer-events-none" : ""
        } transition-all duration-200 relative`}
      >
        {/* Loading Overlay - positioned relative to exercise container */}
        {isLoadingNext && (
          <div className="absolute inset-0 backdrop-blur-sm bg-card/40 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-card rounded-lg p-6 flex items-center space-x-3 shadow-lg ring-1 ring-border">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-lg font-medium">
                Generating next exercise...
              </span>
            </div>
          </div>
        )}
        {/* Exercise Header */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400" />
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">{title}</CardTitle>
                {isDailyChallenge && (
                  <Badge
                    variant="success"
                    className="bg-pink-100 text-pink-700 border-pink-300"
                    title="You're in a Daily Challenge task"
                  >
                    🎯 Daily Challenge
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getDifficultyColor(difficulty) as any}>
                  {getDifficultyText(difficulty)}
                </Badge>
                {topic && (
                  <Badge variant="outline" className="capitalize">
                    {topic}
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {type}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Exercise */}
        <Card className={isDailyChallenge ? "ring-1 ring-pink-200" : undefined}>
          <CardContent className="p-8">
            <div className="space-y-6">
              {isDailyChallenge && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-pink-800 text-sm">
                    <span>🚀</span>
                    <span>
                      Daily Challenge Mode! Complete this task to earn bonus XP
                      and keep your streak alive.
                    </span>
                  </div>
                  <a
                    href="#"
                    className="text-pink-700 text-xs underline hover:text-pink-800"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    What is this?
                  </a>
                </div>
              )}
              {/* Question */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {renderClickableGermanText(question)}
                </h2>

                {/* Context Sentence (if provided) */}
                {(germanText || englishText) && (
                  <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                    {(() => {
                      // Determine direction based on question content
                      const isGermanToEnglish =
                        question.includes("mean in English") ||
                        question.includes("German word");
                      const isEnglishToGerman =
                        question.includes("German translation of") ||
                        question.includes("English word");

                      // For grammar exercises, don't show German text as context initially
                      // since it often contains or is the correct answer
                      const isGrammarExercise = type === "grammar";

                      // Show context text based on exercise type and direction
                      let contextText;
                      let translationText;

                      if (isGrammarExercise) {
                        // For grammar exercises, only show English context (if available)
                        contextText = englishText;
                        translationText = germanText?.replace(
                          /__BLANK__/g,
                          "_______"
                        );
                      } else {
                        // For vocabulary/other exercises, use original logic
                        contextText = isEnglishToGerman
                          ? englishText
                          : germanText;
                        translationText = isEnglishToGerman
                          ? germanText
                          : englishText;
                      }

                      return (
                        <>
                          {contextText && (
                            <p className="text-pink-900 font-medium italic">
                              {/* Wrap as clickable only if enabled and context is likely German */}
                              {!enableWordTranslation
                                ? contextText
                                : isGrammarExercise || isEnglishToGerman
                                ? contextText
                                : renderClickableGermanText(contextText)}
                            </p>
                          )}
                          {/* Show translation only after answer is submitted */}
                          {isAnswered && translationText && (
                            <p className="text-pink-700 text-sm mt-2">
                              Translation:{" "}
                              {
                                // After answering, translationText is shown. Wrap only if enabled and it's likely German
                                !enableWordTranslation
                                  ? translationText
                                  : isGrammarExercise || isEnglishToGerman
                                  ? renderClickableGermanText(translationText)
                                  : translationText
                              }
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {shuffledOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !isAnswered && setSelectedAnswer(option)}
                    disabled={isAnswered}
                    className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                    ${
                      !isAnswered &&
                      "hover:border-primary hover:bg-pink-50 cursor-pointer"
                    }
                    ${
                      selectedAnswer === option
                        ? "border-primary bg-pink-50"
                        : "border-border"
                    }
                    ${
                      isAnswered && option === correctAnswer
                        ? "border-green-500 bg-green-50"
                        : ""
                    }
                    ${
                      isAnswered &&
                      selectedAnswer === option &&
                      option !== correctAnswer
                        ? "border-red-500 bg-red-50"
                        : ""
                    }
                    ${isAnswered ? "cursor-not-allowed" : ""}
                  `}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold
                      ${
                        selectedAnswer === option
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground"
                      }
                      ${
                        isAnswered && option === correctAnswer
                          ? "border-green-500 bg-green-500 text-white"
                          : ""
                      }
                      ${
                        isAnswered &&
                        selectedAnswer === option &&
                        option !== correctAnswer
                          ? "border-red-500 bg-red-500 text-white"
                          : ""
                      }
                    `}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span
                        className={`
                      font-medium
                      ${
                        isAnswered && option === correctAnswer
                          ? "text-green-700"
                          : ""
                      }
                      ${
                        isAnswered &&
                        selectedAnswer === option &&
                        option !== correctAnswer
                          ? "text-red-700"
                          : ""
                      }
                    `}
                      >
                        {option}
                      </span>
                      {isAnswered && option === correctAnswer && (
                        <span className="text-green-600 ml-auto">✓</span>
                      )}
                      {isAnswered &&
                        selectedAnswer === option &&
                        option !== correctAnswer && (
                          <span className="text-red-600 ml-auto">✗</span>
                        )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center pt-4">
                {!isAnswered ? (
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    disabled={!selectedAnswer}
                    className="min-w-32"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextExercise}
                    size="lg"
                    className="min-w-32"
                    disabled={isLoadingNext}
                  >
                    {isLoadingNext ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Next Exercise"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Speech Bubble */}
        {enableWordTranslation && bubble && (
          <div
            className="absolute z-50 -translate-x-1/2"
            style={{ left: bubble.x, top: Math.max(bubble.y - 40, 0) }}
            onClick={() => setBubble(null)}
          >
            <div className="bg-card ring-1 ring-pink-200 text-pink-900 rounded-md shadow-lg px-3 py-1.5 text-sm">
              {bubble.translation}
            </div>
            <div className="mx-auto w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-pink-200" />
          </div>
        )}

        {/* Explanation (shown after answering) */}
        {isAnswered && (
          <Card className="bg-pink-50 border border-pink-200">
            <CardContent className="p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-pink-900 flex items-center space-x-2">
                  <span className="text-xl">💡</span>
                  <span>Explanation</span>
                </h3>
                <p className="text-pink-800 leading-relaxed">{explanation}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
