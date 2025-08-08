"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface ExerciseResult {
  isCorrect: boolean;
  timeSpent: number;
  xpEarned: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  topic: string;
  difficulty: string;
}

interface ExerciseSummaryProps {
  results: ExerciseResult[];
  totalXp: number;
  correctCount: number;
  totalCount: number;
  averageTime: number;
  onContinue: () => void;
  isDailyChallenge?: boolean;
}

export function ExerciseSummary({
  results,
  totalXp,
  correctCount,
  totalCount,
  averageTime,
  onContinue,
  isDailyChallenge = false,
}: ExerciseSummaryProps) {
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const isPerfect = correctCount === totalCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Header */}
      <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400" />
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl">
              {isPerfect ? "🎉" : accuracy >= 80 ? "🎯" : "📚"}
            </div>
            <CardTitle className="text-2xl">
              {isPerfect
                ? "Perfect Score!"
                : accuracy >= 80
                ? "Great Job!"
                : "Good Effort!"}
            </CardTitle>
            {isDailyChallenge && (
              <Badge
                variant="success"
                className="bg-pink-100 text-pink-700 ring-1 ring-pink-300"
              >
                🎯 Daily Challenge Complete!
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {correctCount}/{totalCount}
            </div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600">
              +{totalXp} XP
            </div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-600">
              {Math.round(averageTime)}s
            </div>
            <div className="text-sm text-muted-foreground">Avg. Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="ring-1 ring-border/80">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-xl">📊</span>
            <span>Exercise Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.isCorrect
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-lg ${
                          result.isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.isCorrect ? "✓" : "✗"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {result.difficulty.replace("_", " ")}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {result.topic}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.question}
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-muted-foreground">
                        Your answer:{" "}
                        <span
                          className={
                            result.isCorrect
                              ? "text-green-700 font-medium"
                              : "text-red-700 font-medium"
                          }
                        >
                          {result.userAnswer}
                        </span>
                      </span>
                      {!result.isCorrect && (
                        <span className="text-muted-foreground">
                          Correct:{" "}
                          <span className="text-green-700 font-medium">
                            {result.correctAnswer}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium text-green-600">
                      +{result.xpEarned} XP
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.timeSpent}s
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button size="lg" onClick={onContinue} className="min-w-32">
          {isDailyChallenge ? "Continue" : "Next Exercise"}
        </Button>
      </div>
    </div>
  );
}
