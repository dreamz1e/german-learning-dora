"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExerciseContainer } from "@/components/exercises/ExerciseContainer";
import { useToast } from "@/components/ui/Toast";

interface GrammarExercise {
  type: string;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

export function GrammarPractice() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentExercise, setCurrentExercise] =
    useState<GrammarExercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("A2_BASIC");
  const [grammarTopic, setGrammarTopic] = useState("");

  const grammarTopics = [
    "Cases (Nominativ, Akkusativ, Dativ, Genitiv)",
    "Verb Conjugation",
    "Word Order",
    "Prepositions",
    "Adjective Endings",
    "Modal Verbs",
    "Past Tense (Perfekt)",
    "Comparative and Superlative",
    "Subordinate Clauses",
    "Reflexive Verbs",
  ];

  const generateExercise = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "grammar",
          difficulty,
          grammarTopic: grammarTopic || undefined,
        }),
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
        message: "Could not generate grammar exercise. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseComplete = async (
    isCorrect: boolean,
    timeSpent: number
  ) => {
    if (!user || !currentExercise) return;

    try {
      // Award XP for completing the exercise
      const xpAmount = isCorrect ? 25 : 10; // Full XP for correct, partial for attempt
      await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: xpAmount,
          reason: `Grammar exercise: ${currentExercise.topic}`,
          category: "EXERCISE",
        }),
      });

      // Show success message
      addToast({
        type: "success",
        title: "Exercise Complete!",
        message: `You earned ${xpAmount} XP! ${
          isCorrect ? "Perfect!" : "Keep practicing!"
        }`,
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
        <h1 className="text-3xl font-bold tracking-tight">Grammar Practice</h1>
        <p className="text-muted-foreground text-lg">
          Master German grammar with AI-generated exercises
        </p>
      </div>

      {/* Exercise Generator */}
      {!currentExercise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span>Generate Grammar Exercise</span>
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
                            : "border-border hover:border-primary hover:bg-blue-50"
                        }
                      `}
                    >
                      {level.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grammar Topic Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Grammar Topic (Optional)
                </label>
                <select
                  value={grammarTopic}
                  onChange={(e) => setGrammarTopic(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Any Topic</option>
                  {grammarTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
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
              AI-Generated Grammar Exercise
            </Badge>
            <Button variant="outline" onClick={() => setCurrentExercise(null)}>
              Generate New Exercise
            </Button>
          </div>

          <ExerciseContainer
            title="Grammar Practice"
            question={currentExercise.question}
            options={currentExercise.options}
            correctAnswer={currentExercise.correctAnswer}
            explanation={currentExercise.explanation}
            type={currentExercise.type}
            difficulty={currentExercise.difficulty}
            topic={currentExercise.topic}
            onComplete={handleExerciseComplete}
            onNextExercise={generateExercise}
          />
        </div>
      )}

      {/* Tips and Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <span className="text-xl">💡</span>
            <span>Grammar Practice Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-600">
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span>🎯</span>
                <span>Start with A2 Basic if you're new to German grammar</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>📚</span>
                <span>
                  Focus on one grammar topic at a time for better retention
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span>🔄</span>
                <span>Practice regularly - even 10 minutes daily helps</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span>✍️</span>
                <span>Read explanations carefully to understand the rules</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>⭐</span>
                <span>
                  You earn 25 XP for correct answers, 10 XP for attempts
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span>🏆</span>
                <span>Track your progress in the achievements section</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
