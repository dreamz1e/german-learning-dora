"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TipsPanel } from "@/components/ui/TipsPanel";
import { Badge } from "@/components/ui/Badge";
import { ReadingExercise } from "@/components/exercises/ReadingExercise";
import { useToast } from "@/components/ui/Toast";

interface ReadingExerciseData {
  title: string;
  text: string;
  difficulty: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

interface ReadingComprehensionProps {
  onNavigate?: (page: string) => void;
}

export function ReadingComprehension({
  onNavigate,
}: ReadingComprehensionProps = {}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentExercise, setCurrentExercise] =
    useState<ReadingExerciseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("A2_BASIC");
  const [topic, setTopic] = useState("");
  const [isGeneratingNewExercise, setIsGeneratingNewExercise] = useState(false);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  // Daily Challenge auto-start
  useEffect(() => {
    const activeDailyChallenge = localStorage.getItem("activeDailyChallenge");
    if (activeDailyChallenge) {
      const challenge = JSON.parse(activeDailyChallenge);
      if (challenge.taskType === "reading") {
        setIsDailyChallenge(true);
        setDifficulty(
          challenge.difficulty === "Easy"
            ? "A2_BASIC"
            : challenge.difficulty === "Medium"
            ? "B1_BASIC"
            : "B1_ADVANCED"
        );
        if (challenge.content?.theme) {
          setTopic(challenge.content.theme);
        }
        generateExercise();
      }
    }
  }, []);

  const readingTopics = [
    "Daily Life",
    "Travel & Tourism",
    "German Culture",
    "Food & Restaurants",
    "Work & Career",
    "Education & School",
    "Health & Lifestyle",
    "Environment & Nature",
    "Technology & Media",
    "History & Traditions",
    "Sports & Recreation",
    "Shopping & Services",
  ];

  const generateExercise = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          topic: topic || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate reading exercise");
      }

      const data = await response.json();
      setCurrentExercise(data.exercise);
    } catch (error) {
      console.error("Error generating reading exercise:", error);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: "Could not generate reading exercise. Please try again.",
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
        message: "A fresh reading exercise has been created!",
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

  const handleExerciseComplete = async (score: number, timeSpent: number) => {
    if (!user || !currentExercise) return;

    try {
      // Calculate XP based on score
      let xpAmount = 30; // Base XP for completion
      if (score >= 90) xpAmount = 50; // Excellent
      else if (score >= 70) xpAmount = 40; // Good
      else if (score >= 50) xpAmount = 30; // Average
      else xpAmount = 20; // Needs improvement

      await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: xpAmount,
          reason: isDailyChallenge
            ? "Completed daily challenge reading task"
            : `Reading comprehension: ${score}% score`,
          category: isDailyChallenge ? "DAILY_CHALLENGE" : "EXERCISE",
        }),
      });

      let message = "";
      if (score >= 90) message = "Excellent reading comprehension!";
      else if (score >= 70) message = "Good job! Keep practicing!";
      else if (score >= 50) message = "Not bad! Try reading more German texts.";
      else message = "Keep practicing - you'll improve!";

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
              isCorrect: score >= 70, // treat >=70% as correct
              xpEarned: xpAmount,
            })
          );
        }

        addToast({
          type: "success",
          title: "Daily Challenge Complete! 🎉",
          message: "Returning to Daily Challenges...",
          duration: 3000,
        });

        setTimeout(() => {
          onNavigate?.("daily-challenge");
        }, 2000);
      } else {
        addToast({
          type: score >= 70 ? "success" : score >= 50 ? "warning" : "info",
          title: "Reading Exercise Complete!",
          message: `${message} You earned ${xpAmount} XP!`,
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
        <h1 className="text-3xl font-bold tracking-tight">
          Reading Comprehension
        </h1>
        <p className="text-muted-foreground text-lg">
          {isDailyChallenge
            ? "Complete this reading exercise to finish your daily challenge!"
            : "Improve your German reading skills with AI-generated texts and questions"}
        </p>
      </div>

      {/* Exercise Generator */}
      {!currentExercise && (
        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">📖</span>
              <span>Generate Reading Exercise</span>
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
                            : "border-input bg-card hover:border-primary hover:bg-pink-50"
                        }
                      `}
                    >
                      {level.replace("_", " ")}
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
                  {readingTopics.map((topicOption) => (
                    <option key={topicOption} value={topicOption}>
                      {topicOption}
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
                  "Generate Reading Exercise"
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
              AI-Generated Reading Exercise
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

          <ReadingExercise
            title={currentExercise.title}
            text={currentExercise.text}
            difficulty={currentExercise.difficulty}
            questions={currentExercise.questions}
            onComplete={handleExerciseComplete}
          />
        </div>
      )}

      <TipsPanel
        title="Reading Comprehension Tips"
        tone="purple"
        sections={[
          {
            items: [
              "Read the text completely before answering questions",
              "Look for keywords that match the questions",
              "Don't worry about understanding every word",
            ],
          },
          {
            items: [
              "Use context clues to understand new vocabulary",
              "XP based on score: 90%+ = 50 XP, 70%+ = 40 XP",
              "Regular reading improves overall German skills",
            ],
          },
        ]}
      />
    </div>
  );
}
