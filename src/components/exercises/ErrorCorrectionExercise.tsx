"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface ErrorLocation {
  start: number;
  end: number;
  error: string;
  correction: string;
  explanation: string;
}

interface ErrorCorrectionProps {
  instruction: string;
  incorrectText: string;
  correctText: string;
  errors: ErrorLocation[];
  difficulty: string;
  topic: string;
  onComplete: (score: number, timeSpent: number) => void;
  onNext: () => void;
}

export function ErrorCorrectionExercise({
  instruction,
  incorrectText,
  correctText,
  errors,
  difficulty,
  topic,
  onComplete,
  onNext,
}: ErrorCorrectionProps) {
  const [selectedErrors, setSelectedErrors] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const { addToast } = useToast();

  const handleWordClick = (index: number) => {
    if (isSubmitted) return;

    setSelectedErrors((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const checkAnswers = () => {
    const words = incorrectText.split(" ");
    let correctCount = 0;
    const totalErrors = errors.length;

    // Check each error location
    errors.forEach((error) => {
      const errorWords = incorrectText
        .substring(error.start, error.end)
        .split(" ");
      const startWordIndex =
        incorrectText.substring(0, error.start).split(" ").length - 1;

      // Check if any of the error words were selected
      let errorFound = false;
      for (let i = 0; i < errorWords.length; i++) {
        const wordIndex = startWordIndex + i;
        if (selectedErrors.includes(wordIndex)) {
          errorFound = true;
          break;
        }
      }

      if (errorFound) {
        correctCount++;
      }
    });

    // Calculate score (percentage)
    const score =
      totalErrors > 0 ? Math.round((correctCount / totalErrors) * 100) : 0;

    setIsSubmitted(true);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onComplete(score, timeSpent);

    addToast({
      type: score >= 70 ? "success" : score >= 50 ? "warning" : "error",
      title: "Error Correction Complete!",
      message: `You found ${correctCount}/${totalErrors} errors (${score}%)`,
      duration: 5000,
    });
  };

  const handleNext = () => {
    setSelectedErrors([]);
    setIsSubmitted(false);
    onNext();
  };

  const getDifficultyText = (diff: string) => {
    return diff.replace("_", " ");
  };

  const renderTextWithHighlights = () => {
    const words = incorrectText.split(" ");

    return words.map((word, index) => {
      const isSelected = selectedErrors.includes(index);
      const isActualError = errors.some((error) => {
        const errorWords = incorrectText
          .substring(error.start, error.end)
          .split(" ");
        const startWordIndex =
          incorrectText.substring(0, error.start).split(" ").length - 1;
        return (
          index >= startWordIndex && index < startWordIndex + errorWords.length
        );
      });

      let className = "cursor-pointer px-1 py-0.5 rounded transition-colors ";

      if (isSubmitted) {
        if (isActualError && isSelected) {
          className += "bg-green-200 text-green-800"; // Correctly identified error
        } else if (isActualError && !isSelected) {
          className += "bg-red-200 text-red-800"; // Missed error
        } else if (!isActualError && isSelected) {
          className += "bg-yellow-200 text-yellow-800"; // False positive
        } else {
          className += "hover:bg-gray-100"; // Correct non-error
        }
      } else {
        if (isSelected) {
          className += "bg-blue-200 text-blue-800";
        } else {
          className += "hover:bg-gray-100";
        }
      }

      return (
        <span
          key={index}
          className={className}
          onClick={() => handleWordClick(index)}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">Error Correction</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="info">{getDifficultyText(difficulty)}</Badge>
              <Badge variant="outline" className="capitalize">
                {topic}
              </Badge>
              <Badge variant="secondary">Grammar Check</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instruction */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Task:</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {instruction}
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
              <p className="text-blue-800 text-sm">
                <strong>How to use:</strong> Click on words that contain errors.
                Selected words will be highlighted in blue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text with Errors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Find the Errors</CardTitle>
            <div className="text-sm text-gray-600">
              {selectedErrors.length} errors selected
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 min-h-32">
              <div className="text-lg leading-relaxed space-x-1">
                {renderTextWithHighlights()}
              </div>
            </div>

            {isSubmitted && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Legend:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-200 rounded"></div>
                    <span>Correctly found</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-200 rounded"></div>
                    <span>Missed error</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                    <span>False positive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded border"></div>
                    <span>Correct</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-4">
              {!isSubmitted ? (
                <Button onClick={checkAnswers} size="lg" className="min-w-32">
                  Check Errors
                </Button>
              ) : (
                <Button onClick={handleNext} size="lg" className="min-w-32">
                  Next Exercise
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results & Explanations */}
      {isSubmitted && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="font-semibold text-blue-900 flex items-center space-x-2">
                <span className="text-xl">💡</span>
                <span>Corrections & Explanations</span>
              </h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Correct Version:
                  </h4>
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {correctText}
                  </p>
                </div>

                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border border-blue-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <Badge variant="destructive" className="text-xs">
                          Error {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-medium text-red-600">
                              Incorrect:
                            </span>
                            <span className="bg-red-100 px-2 py-1 rounded text-red-800 font-mono">
                              {error.error}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <span className="font-medium text-green-600">
                              Correct:
                            </span>
                            <span className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono">
                              {error.correction}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-blue-700 text-sm ml-16">
                        {error.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
