"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WritingExercise } from "@/components/exercises/WritingExercise";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface BilingualGuideline {
  de: string;
  en: string;
}

interface WritingPrompt {
  promptDe: string;
  promptEn: string;
  difficulty: string;
  topic: string;
  guidelines: BilingualGuideline[];
  minWords: number;
  maxWords: number;
}

interface WritingPracticeProps {
  onNavigate?: (page: string) => void;
}

export function WritingPractice({ onNavigate }: WritingPracticeProps = {}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("A2_BASIC");
  const [topic, setTopic] = useState("");
  const [exerciseType, setExerciseType] = useState("guided");
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  // Daily Challenge auto-start
  useEffect(() => {
    const activeDailyChallenge = localStorage.getItem("activeDailyChallenge");
    if (activeDailyChallenge) {
      const challenge = JSON.parse(activeDailyChallenge);
      if (challenge.taskType === "writing") {
        setIsDailyChallenge(true);
        setDifficulty(
          challenge.difficulty === "Easy"
            ? "A2_BASIC"
            : challenge.difficulty === "Medium"
            ? "B1_BASIC"
            : "B1_ADVANCED"
        );
        if (challenge.content?.prompt) {
          setTopic(challenge.content.prompt);
        }
        generatePrompt();
      }
    }
  }, []);

  const topics = [
    "Daily Life",
    "Personal Experiences",
    "Travel & Adventures",
    "Food & Culture",
    "Work & Career",
    "Education & Learning",
    "Technology & Media",
    "Environment & Nature",
    "Health & Lifestyle",
    "Relationships & Family",
  ];

  const exerciseTypes = [
    {
      value: "guided",
      label: "Guided Writing",
      description: "Structured with clear guidelines",
    },
    {
      value: "creative",
      label: "Creative Writing",
      description: "Imaginative storytelling",
    },
    {
      value: "formal",
      label: "Formal Writing",
      description: "Letters, emails, business",
    },
    {
      value: "descriptive",
      label: "Descriptive Writing",
      description: "Detailed descriptions",
    },
  ];

  const generatePrompt = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          topic: topic || undefined,
          exerciseType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate writing prompt");
      }

      const data = await response.json();
      setCurrentPrompt(data.exercise);
    } catch (error) {
      console.error("Error generating writing prompt:", error);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: "Could not generate writing prompt. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWritingComplete = async (
    wordCount: number,
    timeSpent: number,
    evaluationScore?: number
  ) => {
    if (!user || !currentPrompt) return;

    try {
      if (
        typeof evaluationScore !== "number" ||
        !Number.isFinite(evaluationScore)
      ) {
        // If no evaluation score is available, skip XP award
        return;
      }

      // XP based on evaluation overall score * 0.5
      const finalXP = Math.max(1, Math.round(evaluationScore * 0.5));

      await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalXP,
          reason: isDailyChallenge
            ? "Completed daily challenge writing task"
            : `Writing practice (score-based): ${currentPrompt.topic}`,
          category: isDailyChallenge ? "DAILY_CHALLENGE" : "EXERCISE",
        }),
      });

      if (isDailyChallenge) {
        const activeDailyChallenge = localStorage.getItem(
          "activeDailyChallenge"
        );
        if (activeDailyChallenge) {
          const challenge = JSON.parse(activeDailyChallenge);
          localStorage.setItem(
            "completedDailyChallenge",
            JSON.stringify({
              taskId: challenge.taskId,
              taskType: challenge.taskType,
              completed: true,
              timeSpent,
              isCorrect: (evaluationScore || 0) >= 60,
              xpEarned: finalXP,
            })
          );
        }

        addToast({
          type: "success",
          title: "Daily Challenge Complete! 🎉",
          message: "Returning to Daily Challenges...",
          duration: 3000,
        });

        setTimeout(() => onNavigate?.("daily-challenge"), 2000);
      } else {
        addToast({
          type: "success",
          title: "Writing Complete!",
          message: `You earned ${finalXP} XP! Overall score: ${evaluationScore}/100`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Writing Practice</h1>
        <p className="text-muted-foreground text-lg">
          {isDailyChallenge
            ? "Complete this writing exercise to finish your daily challenge!"
            : "Develop your German writing skills with AI-generated prompts"}
        </p>
      </div>

      {/* Prompt Generator */}
      {!currentPrompt && (
        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">✏️</span>
              <span>Generate Writing Prompt</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-1 gap-2">
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
                        p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left
                        ${
                          difficulty === level
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-card hover:border-primary hover:bg-pink-50"
                        }
                      `}
                    >
                      {level.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Writing Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {exerciseTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setExerciseType(type.value)}
                      className={`
                        p-3 rounded-lg border-2 text-sm transition-colors text-left
                        ${
                          exerciseType === type.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-card hover:border-primary hover:bg-pink-50"
                        }
                      `}
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Topic (Optional)
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Any Topic</option>
                  {topics.map((topicOption) => (
                    <option key={topicOption} value={topicOption}>
                      {topicOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="min-w-40"
                onClick={() => router.push("/writing/history")}
              >
                View History
              </Button>
              <Button
                onClick={generatePrompt}
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
                  "Generate Writing Prompt"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Writing Exercise */}
      {currentPrompt && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-sm">
              AI-Generated Writing Prompt
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/writing/history")}
              >
                View History
              </Button>
              <Button variant="outline" onClick={() => setCurrentPrompt(null)}>
                Generate New Prompt
              </Button>
            </div>
          </div>

          <WritingExercise
            prompt={currentPrompt}
            onComplete={handleWritingComplete}
            onNewPrompt={generatePrompt}
          />
        </div>
      )}

      {/* Tips and Information */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <span className="text-xl">💡</span>
            <span>Writing Practice Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-600">
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span>📝</span>
                <span>Start with simple sentences and build complexity</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>🧠</span>
                <span>Use vocabulary and grammar from your current level</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>🔍</span>
                <span>
                  Review your writing for common errors before submitting
                </span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span>⏰</span>
                <span>
                  Take your time - quality is more important than speed
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span>⭐</span>
                <span>XP increases with difficulty and word count</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>🎯</span>
                <span>
                  Follow the guidelines to structure your writing effectively
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
