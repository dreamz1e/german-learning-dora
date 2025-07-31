"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SentenceConstructionExercise } from "@/components/exercises/SentenceConstructionExercise";
import { ErrorCorrectionExercise } from "@/components/exercises/ErrorCorrectionExercise";
import { useToast } from "@/components/ui/Toast";

interface SentenceConstructionData {
  instruction: string;
  correctSentence: string;
  wordBlocks: string[];
  difficulty: string;
  topic: string;
  explanation: string;
}

interface ErrorCorrectionData {
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
  difficulty: string;
  topic: string;
}

interface AdvancedExercisesProps {
  onNavigate?: (page: string) => void;
}

export function AdvancedExercises({ onNavigate }: AdvancedExercisesProps = {}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [exerciseType, setExerciseType] = useState<"sentence" | "error">(
    "sentence"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("A2_BASIC");
  const [grammarFocus, setGrammarFocus] = useState("");
  const [isGeneratingNewExercise, setIsGeneratingNewExercise] = useState(false);

  const grammarFocusOptions = [
    "Word Order",
    "Cases (Nom/Akk/Dat/Gen)",
    "Verb Conjugation",
    "Modal Verbs",
    "Subordinate Clauses",
    "Prepositions",
    "Adjective Endings",
    "Past Tense Formation",
    "Reflexive Verbs",
    "Passive Voice",
  ];

  const generateExercise = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const endpoint =
        exerciseType === "sentence"
          ? "/api/ai/generate-sentence-construction"
          : "/api/ai/generate-error-correction";

      const body =
        exerciseType === "sentence"
          ? { difficulty, grammarFocus: grammarFocus || undefined }
          : { difficulty, errorType: "mixed" };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to generate exercise");
      }

      const data = await response.json();
      setCurrentExercise(data.exercise);
    } catch (error) {
      console.error("Error generating exercise:", error);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: "Could not generate exercise. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewExercise = async () => {
    if (!user) return;

    setIsGeneratingNewExercise(true);
    try {
      // Clear current exercise first
      setCurrentExercise(null);

      // Generate new exercise
      await generateExercise();

      addToast({
        type: "success",
        title: "New Exercise Generated",
        message: "A fresh exercise has been created!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating new exercise:", error);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: "Could not generate new exercise. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsGeneratingNewExercise(false);
    }
  };

  const handleExerciseComplete = async (
    isCorrectOrScore: boolean | number,
    timeSpent: number
  ) => {
    if (!user) return;

    try {
      let xpAmount = 30; // Base XP

      if (exerciseType === "sentence") {
        // Boolean for sentence construction
        xpAmount = isCorrectOrScore ? 35 : 15;
      } else {
        // Score (0-100) for error correction
        const score = isCorrectOrScore as number;
        xpAmount = Math.round(20 + (score / 100) * 30); // 20-50 XP based on score
      }

      await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: xpAmount,
          reason: `Advanced exercise: ${
            exerciseType === "sentence"
              ? "Sentence Construction"
              : "Error Correction"
          }`,
          category: "EXERCISE",
        }),
      });

      const message =
        exerciseType === "sentence"
          ? `You earned ${xpAmount} XP! ${
              isCorrectOrScore ? "Perfect construction!" : "Keep practicing!"
            }`
          : `You earned ${xpAmount} XP! Score: ${isCorrectOrScore}%`;

      addToast({
        type: "success",
        title: "Exercise Complete!",
        message,
        duration: 4000,
      });
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Advanced Exercises
        </h1>
        <p className="text-muted-foreground text-lg">
          Challenge yourself with sentence construction and error correction
        </p>
      </div>

      {/* Exercise Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setExerciseType("sentence");
                setCurrentExercise(null);
              }}
              className={`
                p-4 rounded-lg border-2 text-left transition-colors
                ${
                  exerciseType === "sentence"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary hover:bg-pink-50"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔧</span>
                <div>
                  <h3 className="font-semibold">Sentence Construction</h3>
                  <p className="text-sm opacity-80">
                    Build German sentences from word blocks
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setExerciseType("error");
                setCurrentExercise(null);
              }}
              className={`
                p-4 rounded-lg border-2 text-left transition-colors
                ${
                  exerciseType === "error"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary hover:bg-pink-50"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="font-semibold">Error Correction</h3>
                  <p className="text-sm opacity-80">
                    Find and identify German grammar errors
                  </p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Generator */}
      {!currentExercise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">
                {exerciseType === "sentence" ? "🔧" : "🔍"}
              </span>
              <span>
                Generate{" "}
                {exerciseType === "sentence"
                  ? "Sentence Construction"
                  : "Error Correction"}{" "}
                Exercise
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "A2_BASIC",
                    "A2_INTERMEDIATE",
                    "B1_BASIC",
                    "B1_INTERMEDIATE",
                    "B1_ADVANCED",
                  ].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`
                        p-3 rounded-lg border-2 text-sm font-medium transition-colors
                        ${
                          difficulty === level
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary hover:bg-pink-50"
                        }
                      `}
                    >
                      {level.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grammar Focus (for sentence construction) */}
              {exerciseType === "sentence" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Grammar Focus (Optional)
                  </label>
                  <select
                    value={grammarFocus}
                    onChange={(e) => setGrammarFocus(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Any Grammar Topic</option>
                    {grammarFocusOptions.map((focus) => (
                      <option key={focus} value={focus}>
                        {focus}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={generateExercise}
                disabled={isLoading}
                size="lg"
                className="min-w-48"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Exercise"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      {currentExercise && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-sm">
              AI-Generated{" "}
              {exerciseType === "sentence"
                ? "Sentence Construction"
                : "Error Correction"}{" "}
              Exercise
            </Badge>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={generateNewExercise}
              disabled={isGeneratingNewExercise}
            >
              {isGeneratingNewExercise ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating New Batch...</span>
                </div>
              ) : (
                "Generate New Batch"
              )}
            </Button>
          </div>

          {exerciseType === "sentence" ? (
            <SentenceConstructionExercise
              instruction={currentExercise.instruction}
              correctSentence={currentExercise.correctSentence}
              wordBlocks={currentExercise.wordBlocks}
              difficulty={currentExercise.difficulty}
              topic={currentExercise.topic}
              explanation={currentExercise.explanation}
              onComplete={handleExerciseComplete}
              onNext={generateExercise}
              isLoadingNext={isLoading}
            />
          ) : (
            <ErrorCorrectionExercise
              instruction={currentExercise.instruction}
              incorrectText={currentExercise.incorrectText}
              correctText={currentExercise.correctText}
              errors={currentExercise.errors}
              difficulty={currentExercise.difficulty}
              topic={currentExercise.topic}
              onComplete={handleExerciseComplete}
              onNext={generateExercise}
              isLoadingNext={isLoading}
            />
          )}
        </div>
      )}

      {/* Tips and Information */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-indigo-700">
            <span className="text-xl">💡</span>
            <span>Advanced Exercise Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-600">
            <div className="space-y-3">
              <h4 className="font-semibold">Sentence Construction:</h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span>🔧</span>
                  <span>Think about German word order rules</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>📚</span>
                  <span>Consider which case each noun should be in</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>⭐</span>
                  <span>35 XP for correct, 15 XP for attempts</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Error Correction:</h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span>🔍</span>
                  <span>
                    Look for common mistakes: cases, verb forms, agreements
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>🎯</span>
                  <span>Click on words that seem incorrect</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>⭐</span>
                  <span>20-50 XP based on accuracy percentage</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
