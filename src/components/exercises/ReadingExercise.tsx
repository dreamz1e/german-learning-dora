"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/Toast";

interface ReadingQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface ReadingExerciseProps {
  title: string;
  text: string;
  difficulty: string;
  questions: ReadingQuestion[];
  onComplete: (score: number, timeSpent: number) => void;
}

export function ReadingExercise({
  title,
  text,
  difficulty,
  questions,
  onComplete,
}: ReadingExerciseProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const { addToast } = useToast();

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (!isCompleted) {
      setAnswers((prev) => ({
        ...prev,
        [questionIndex]: answer,
      }));
    }
  };

  const handleSubmit = () => {
    const unansweredQuestions = questions.filter((_, index) => !answers[index]);

    if (unansweredQuestions.length > 0) {
      addToast({
        type: "warning",
        title: "Incomplete",
        message: `Please answer all ${questions.length} questions before submitting.`,
        duration: 3000,
      });
      return;
    }

    const correctAnswers = questions.filter(
      (q, index) => answers[index] === q.correctAnswer
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    setIsCompleted(true);
    onComplete(score, timeSpent);

    addToast({
      type: score >= 70 ? "success" : score >= 50 ? "warning" : "error",
      title: "Reading Exercise Complete!",
      message: `You scored ${score}% (${correctAnswers}/${questions.length} correct)`,
      duration: 5000,
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const getDifficultyText = (diff: string) => {
    return diff.replace("_", " ");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="info">{getDifficultyText(difficulty)}</Badge>
              <Badge variant="secondary">Reading Comprehension</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* German Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {text}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Questions</CardTitle>
              <div className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Question */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                Question {currentQuestion + 1}
              </h3>
              <p className="text-muted-foreground">
                {questions[currentQuestion]?.question}
              </p>

              {/* Answer Options */}
              <div className="space-y-3">
                {questions[currentQuestion]?.options.map(
                  (option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() =>
                        handleAnswerSelect(currentQuestion, option)
                      }
                      disabled={isCompleted}
                      className={`
                      w-full text-left p-3 rounded-lg border-2 transition-all duration-200
                      ${
                        !isCompleted &&
                        "hover:border-primary hover:bg-blue-50 cursor-pointer"
                      }
                      ${
                        answers[currentQuestion] === option
                          ? "border-primary bg-blue-50"
                          : "border-border"
                      }
                      ${
                        isCompleted &&
                        option === questions[currentQuestion]?.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : ""
                      }
                      ${
                        isCompleted &&
                        answers[currentQuestion] === option &&
                        option !== questions[currentQuestion]?.correctAnswer
                          ? "border-red-500 bg-red-50"
                          : ""
                      }
                      ${isCompleted ? "cursor-not-allowed" : ""}
                    `}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold
                        ${
                          answers[currentQuestion] === option
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground"
                        }
                        ${
                          isCompleted &&
                          option === questions[currentQuestion]?.correctAnswer
                            ? "border-green-500 bg-green-500 text-white"
                            : ""
                        }
                        ${
                          isCompleted &&
                          answers[currentQuestion] === option &&
                          option !== questions[currentQuestion]?.correctAnswer
                            ? "border-red-500 bg-red-500 text-white"
                            : ""
                        }
                      `}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <span
                          className={`
                        text-sm
                        ${
                          isCompleted &&
                          option === questions[currentQuestion]?.correctAnswer
                            ? "text-green-700 font-medium"
                            : ""
                        }
                        ${
                          isCompleted &&
                          answers[currentQuestion] === option &&
                          option !== questions[currentQuestion]?.correctAnswer
                            ? "text-red-700"
                            : ""
                        }
                      `}
                        >
                          {option}
                        </span>
                        {isCompleted &&
                          option ===
                            questions[currentQuestion]?.correctAnswer && (
                            <span className="text-green-600 ml-auto">✓</span>
                          )}
                        {isCompleted &&
                          answers[currentQuestion] === option &&
                          option !==
                            questions[currentQuestion]?.correctAnswer && (
                            <span className="text-red-600 ml-auto">✗</span>
                          )}
                      </div>
                    </button>
                  )
                )}
              </div>

              {/* Explanation (shown after completion) */}
              {isCompleted && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">
                    Explanation:
                  </h4>
                  <p className="text-sm text-blue-800">
                    {questions[currentQuestion]?.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`
                      w-8 h-8 rounded-full text-xs font-bold transition-colors
                      ${
                        index === currentQuestion
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                      ${answers[index] ? "ring-2 ring-green-400" : ""}
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(questions.length - 1, currentQuestion + 1)
                  )
                }
                disabled={currentQuestion === questions.length - 1}
              >
                Next
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              {!isCompleted ? (
                <Button onClick={handleSubmit} size="lg">
                  Submit All Answers
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold text-foreground">
                    Score:{" "}
                    {Math.round(
                      (questions.filter(
                        (q, i) => answers[i] === q.correctAnswer
                      ).length /
                        questions.length) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {
                      questions.filter((q, i) => answers[i] === q.correctAnswer)
                        .length
                    }{" "}
                    out of {questions.length} correct
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
