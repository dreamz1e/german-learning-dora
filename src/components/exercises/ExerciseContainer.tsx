"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface ExerciseOption {
  id: string;
  text: string;
}

interface ExerciseContainerProps {
  title: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: string;
  difficulty: string;
  topic?: string;
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNextExercise: () => void;
  germanText?: string;
  englishText?: string;
  isLoadingNext?: boolean;
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
}: ExerciseContainerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const { addToast } = useToast();

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
    onComplete(isCorrect, timeSpent);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {/* Exercise Container with conditional blur and loading overlay */}
      <div
        className={`${
          isLoadingNext ? "pointer-events-none" : ""
        } transition-all duration-200 relative`}
      >
        {/* Loading Overlay - positioned relative to exercise container */}
        {isLoadingNext && (
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg border">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-lg font-medium">
                Generating next exercise...
              </span>
            </div>
          </div>
        )}
        {/* Exercise Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-xl">{title}</CardTitle>
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
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Question */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {question}
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

                      // Show context text based on direction
                      const contextText = isEnglishToGerman
                        ? englishText
                        : germanText;
                      const translationText = isEnglishToGerman
                        ? germanText
                        : englishText;

                      return (
                        <>
                          {contextText && (
                            <p className="text-pink-900 font-medium italic">
                              "{contextText}"
                            </p>
                          )}
                          {/* Show translation only after answer is submitted */}
                          {isAnswered && translationText && (
                            <p className="text-pink-700 text-sm mt-2">
                              Translation: "{translationText}"
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
                {options.map((option, index) => (
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
