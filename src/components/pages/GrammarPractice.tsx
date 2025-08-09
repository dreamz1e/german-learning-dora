"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExerciseContainer } from "@/components/exercises/ExerciseContainer";
import { useToast } from "@/components/ui/Toast";
import { ExerciseResult } from "@/components/exercises/ExerciseSummary";
import { TipsPanel } from "@/components/ui/TipsPanel";

interface GrammarExercise {
  type: string;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  germanText?: string;
  englishText?: string;
}

interface GrammarPracticeProps {
  onNavigate?: (page: string) => void;
}

export function GrammarPractice({ onNavigate }: GrammarPracticeProps = {}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentExercise, setCurrentExercise] =
    useState<GrammarExercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("A2_BASIC");
  const [grammarTopic, setGrammarTopic] = useState("");
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [batchInfo, setBatchInfo] = useState<{
    topic: string;
    remaining: number;
    total: number;
  } | null>(null);
  const [isGeneratingNewBatch, setIsGeneratingNewBatch] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalXp: 0,
    correctCount: 0,
    totalCount: 0,
    averageTime: 0,
  });
  const [exerciseKey, setExerciseKey] = useState(0);
  const [dailyTargetCount, setDailyTargetCount] = useState<number | null>(null);

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

  // Check for daily challenge mode
  useEffect(() => {
    const activeDailyChallenge = localStorage.getItem("activeDailyChallenge");
    if (activeDailyChallenge) {
      const challenge = JSON.parse(activeDailyChallenge);
      if (challenge.taskType === "grammar") {
        setIsDailyChallenge(true);
        setDifficulty(
          challenge.difficulty === "Easy"
            ? "A2_BASIC"
            : challenge.difficulty === "Medium"
            ? "B1_BASIC"
            : "B1_ADVANCED"
        );
        // If content from Daily Challenge exists, prefill topic and auto-generate
        if (challenge.content?.topic) {
          setGrammarTopic(challenge.content.topic);
        }
        if (typeof challenge.content?.examples === "number") {
          setDailyTargetCount(challenge.content.examples);
        } else {
          setDailyTargetCount(5);
        }
        generateExercise();
      }
    }
  }, []);

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

      // Update batch info if provided
      if (data.batchInfo) {
        setBatchInfo(data.batchInfo);
      }
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

  const generateNewBatch = async () => {
    if (!user) return;

    setIsGeneratingNewBatch(true);
    setIsLoading(true);

    // Clear current exercise and batch info immediately
    setCurrentExercise(null);
    setBatchInfo(null);
    setExerciseResults([]);
    setShowSummary(false);
    setSummaryStats({
      totalXp: 0,
      correctCount: 0,
      totalCount: 0,
      averageTime: 0,
    });
    setExerciseKey((prev) => prev + 1);

    try {
      console.log("Starting new batch generation for grammar...");

      // Generate a new exercise with forceNewBatch flag
      const response = await fetch("/api/ai/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "grammar",
          difficulty,
          grammarTopic: grammarTopic || undefined,
          forceNewBatch: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Generate new batch failed:", errorText);
        throw new Error(`Failed to generate new batch: ${errorText}`);
      }

      const data = await response.json();
      console.log("New batch generated:", data);
      setCurrentExercise(data.exercise);

      // Update batch info if provided
      if (data.batchInfo) {
        setBatchInfo(data.batchInfo);
        console.log("New batch info:", data.batchInfo);
      }

      addToast({
        type: "success",
        title: "New Batch Generated",
        message: "A fresh set of grammar exercises has been created!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating new batch:", error);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: "Could not generate new batch. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsGeneratingNewBatch(false);
      setIsLoading(false);
    }
  };

  const handleExerciseComplete = async (
    isCorrect: boolean,
    timeSpent: number,
    userAnswer?: string
  ) => {
    if (!user || !currentExercise) return;

    try {
      // Award XP for completing the exercise
      const baseXpAmount = isCorrect ? 25 : 10;
      const xpAmount = isDailyChallenge
        ? JSON.parse(localStorage.getItem("activeDailyChallenge") || "{}").xp ||
          baseXpAmount
        : baseXpAmount;

      await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: xpAmount,
          reason: isDailyChallenge
            ? "Completed daily challenge grammar task"
            : `Grammar exercise: ${currentExercise.topic}`,
          category: isDailyChallenge ? "DAILY_CHALLENGE" : "EXERCISE",
        }),
      });

      // Track exercise result
      const result: ExerciseResult = {
        isCorrect,
        timeSpent,
        xpEarned: xpAmount,
        question: currentExercise.question,
        correctAnswer: currentExercise.correctAnswer,
        userAnswer: userAnswer || "",
        topic: currentExercise.topic,
        difficulty: currentExercise.difficulty,
      };

      const newResults = [...exerciseResults, result];
      setExerciseResults(newResults);

      // Check if batch is complete
      let isBatchComplete = false;
      if (isDailyChallenge) {
        const target = dailyTargetCount ?? 5;
        isBatchComplete = newResults.length >= target;
      } else {
        // batchInfo.remaining reflects how many items are left AFTER the current one was served
        // If remaining is 0, this exercise is the last in the batch
        if (batchInfo) {
          isBatchComplete = batchInfo.remaining === 0;
        } else {
          // Fallback if batch info is unavailable
          isBatchComplete = newResults.length >= 10;
        }
      }

      if (isBatchComplete) {
        // Calculate summary statistics
        const totalXp = newResults.reduce((sum, r) => sum + r.xpEarned, 0);
        const correctCount = newResults.filter((r) => r.isCorrect).length;
        const totalCount = newResults.length;
        const averageTime =
          newResults.reduce((sum, r) => sum + r.timeSpent, 0) / totalCount;

        setSummaryStats({
          totalXp,
          correctCount,
          totalCount,
          averageTime,
        });

        setShowSummary(true);

        addToast({
          type: "success",
          title: "Batch Complete! 🎉",
          message: `You completed ${totalCount} exercises and earned ${totalXp} XP!`,
          duration: 5000,
        });
      } else {
        addToast({
          type: "success",
          title: "Exercise Complete!",
          message: `You earned ${xpAmount} XP! ${
            isCorrect ? "Perfect!" : "Keep practicing!"
          }`,
          duration: 4000,
        });
      }

      // Handle daily challenge completion ONLY when the daily target/batch is complete
      if (isDailyChallenge && isBatchComplete) {
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
              timeSpent: timeSpent,
              isCorrect: isCorrect,
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
          if (onNavigate) {
            onNavigate("daily-challenge");
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  const handleContinueAfterSummary = () => {
    setShowSummary(false);
    setExerciseResults([]);
    setSummaryStats({
      totalXp: 0,
      correctCount: 0,
      totalCount: 0,
      averageTime: 0,
    });
    setExerciseKey((prev) => prev + 1);
    // Reset batch info to ensure fresh start
    setBatchInfo(null);
    generateExercise();
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Grammar Practice
          </h1>
          {isDailyChallenge && (
            <Badge
              variant="success"
              className="bg-pink-100 text-pink-700 border-pink-300"
            >
              🎯 Daily Challenge
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-lg">
          {isDailyChallenge
            ? "Complete this grammar exercise to finish your daily challenge!"
            : "Master German grammar with AI-generated exercises"}
        </p>
      </div>

      {/* Batch Progress Info */}
      {batchInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <div>
                  <h3 className="font-medium text-blue-800">
                    Current Topic: {batchInfo.topic}
                  </h3>
                  <p className="text-sm text-blue-600">
                    Batch Progress: {batchInfo.total - batchInfo.remaining} of{" "}
                    {batchInfo.total} completed
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${
                        ((batchInfo.total - batchInfo.remaining) /
                          batchInfo.total) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-700">
                  {batchInfo.remaining} left
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Generator */}
      {!currentExercise && (
        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400" />
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
                            : "border-input bg-card hover:border-primary hover:bg-pink-50"
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
                  className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
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
            <Button
              variant="outline"
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={generateNewBatch}
              disabled={isGeneratingNewBatch}
            >
              {isGeneratingNewBatch ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating New Batch...</span>
                </div>
              ) : (
                "Generate New Batch"
              )}
            </Button>
          </div>

          <ExerciseContainer
            key={exerciseKey}
            title="Grammar Practice"
            question={currentExercise.question}
            options={currentExercise.options}
            correctAnswer={currentExercise.correctAnswer}
            explanation={currentExercise.explanation}
            type={currentExercise.type}
            difficulty={currentExercise.difficulty}
            topic={currentExercise.topic}
            germanText={currentExercise.germanText}
            englishText={currentExercise.englishText}
            onComplete={handleExerciseComplete}
            onNextExercise={generateExercise}
            isLoadingNext={isLoading}
            showSummary={showSummary}
            exerciseResults={exerciseResults}
            totalXp={summaryStats.totalXp}
            correctCount={summaryStats.correctCount}
            totalCount={summaryStats.totalCount}
            averageTime={summaryStats.averageTime}
            onContinue={handleContinueAfterSummary}
            isDailyChallenge={isDailyChallenge}
          />
        </div>
      )}

      {/* Tips and Information */}
      <TipsPanel
        title="Grammar Practice Tips"
        tone="pink"
        sections={[
          {
            items: [
              "Start with A2 Basic if you're new to German grammar",
              "Focus on one grammar topic at a time for better retention",
              "Practice regularly - even 10 minutes daily helps",
            ],
          },
          {
            items: [
              "Read explanations carefully to understand the rules",
              "You earn 25 XP for correct answers, 10 XP for attempts",
              "Track your progress in the achievements section",
            ],
          },
        ]}
      />
    </div>
  );
}
