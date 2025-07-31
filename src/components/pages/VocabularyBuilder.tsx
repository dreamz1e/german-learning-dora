"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExerciseContainer } from "@/components/exercises/ExerciseContainer";
import { useToast } from "@/components/ui/Toast";

interface VocabularyWord {
  german: string;
  english: string;
  difficulty: string;
  category: string;
  exampleSentence: string;
}

interface VocabularyExercise {
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

interface VocabularyBuilderProps {
  onNavigate?: (page: string) => void;
  dailyChallengeContext?: any;
}

export function VocabularyBuilder({
  onNavigate,
  dailyChallengeContext,
}: VocabularyBuilderProps = {}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentExercise, setCurrentExercise] =
    useState<VocabularyExercise | null>(null);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("A2_BASIC");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState<"exercise" | "words">("exercise");
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);

  const vocabularyCategories = [
    "Daily Life",
    "Food & Drinks",
    "Family & Relationships",
    "Work & Profession",
    "Travel & Transportation",
    "Weather & Seasons",
    "House & Furniture",
    "Clothing & Appearance",
    "Hobbies & Activities",
    "Health & Body",
    "Education & School",
    "Technology",
  ];

  // Check for daily challenge mode on component mount
  useEffect(() => {
    const activeDailyChallenge = localStorage.getItem("activeDailyChallenge");
    if (activeDailyChallenge) {
      const challenge = JSON.parse(activeDailyChallenge);
      if (challenge.taskType === "vocabulary") {
        setIsDailyChallenge(true);
        setDifficulty(
          challenge.difficulty === "Easy"
            ? "A2_BASIC"
            : challenge.difficulty === "Medium"
            ? "B1_BASIC"
            : "B1_ADVANCED"
        );
        // Auto-generate exercise for daily challenge
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
          type: "vocabulary",
          difficulty,
          topic: category || undefined,
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
        message: "Could not generate vocabulary exercise. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateVocabularyWords = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate-vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: 5,
          difficulty,
          category: category || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate vocabulary");
      }

      const data = await response.json();
      setVocabularyWords(data.words);
    } catch (error) {
      console.error("Error generating vocabulary:", error);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: "Could not generate vocabulary words. Please try again.",
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
    if (!user) return;

    try {
      const baseXpAmount = isCorrect ? 20 : 8;
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
            ? "Completed daily challenge vocabulary task"
            : `Vocabulary exercise: ${currentExercise?.topic}`,
          category: isDailyChallenge ? "DAILY_CHALLENGE" : "EXERCISE",
        }),
      });

      addToast({
        type: "success",
        title: "Exercise Complete!",
        message: `You earned ${xpAmount} XP! ${
          isCorrect ? "Perfect!" : "Keep learning!"
        }`,
        duration: 4000,
      });

      // Handle daily challenge completion
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

        // Navigate back to daily challenge after a delay
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

  const handleWordStudied = async () => {
    if (!user) return;

    try {
      await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 5,
          reason: "Studied vocabulary words",
          category: "EXERCISE",
        }),
      });

      addToast({
        type: "success",
        title: "Words Studied!",
        message: "You earned 5 XP for studying vocabulary!",
        duration: 3000,
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
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Vocabulary Builder
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
            ? "Complete this vocabulary exercise to finish your daily challenge!"
            : "Expand your German vocabulary with AI-generated words and exercises"}
        </p>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={mode === "exercise" ? "default" : "outline"}
              onClick={() => {
                setMode("exercise");
                setCurrentExercise(null);
                setVocabularyWords([]);
              }}
            >
              📝 Practice Exercise
            </Button>
            <Button
              variant={mode === "words" ? "default" : "outline"}
              onClick={() => {
                setMode("words");
                setCurrentExercise(null);
                setVocabularyWords([]);
              }}
            >
              📚 Study Words
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generator Controls */}
      {(mode === "exercise" && !currentExercise) ||
      (mode === "words" && vocabularyWords.length === 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">
                {mode === "exercise" ? "🎯" : "📚"}
              </span>
              <span>
                Generate{" "}
                {mode === "exercise"
                  ? "Vocabulary Exercise"
                  : "Vocabulary Words"}
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

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Category (Optional)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Any Category</option>
                  {vocabularyCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={
                  mode === "exercise"
                    ? generateExercise
                    : generateVocabularyWords
                }
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
                  `Generate ${mode === "exercise" ? "Exercise" : "Words"}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Exercise Mode */}
      {mode === "exercise" && currentExercise && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-sm">
              AI-Generated Vocabulary Exercise
            </Badge>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setCurrentExercise(null)}
            >
              Generate New Exercise
            </Button>
          </div>

          <ExerciseContainer
            title="Vocabulary Practice"
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
          />
        </div>
      )}

      {/* Words Study Mode */}
      {mode === "words" && vocabularyWords.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-sm">
              AI-Generated Vocabulary Words
            </Badge>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleWordStudied}>
                Mark as Studied (+5 XP)
              </Button>
              <Button variant="outline" onClick={() => setVocabularyWords([])}>
                Generate New Words
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {vocabularyWords.map((word, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-primary">
                          {word.german}
                        </h3>
                        <p className="text-lg text-muted-foreground">
                          {word.english}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="info">
                          {word.difficulty.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">{word.category}</Badge>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm text-foreground mb-2">
                        Example:
                      </h4>
                      <p className="text-muted-foreground italic">
                        "{word.exampleSentence}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <span className="text-xl">💡</span>
            <span>Vocabulary Learning Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-green-600">
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span>📝</span>
                <span>Practice exercises test your recognition skills</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>📚</span>
                <span>Study mode helps you learn new words with context</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>🔄</span>
                <span>Review words regularly for better retention</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span>💭</span>
                <span>Create your own sentences with new words</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>⭐</span>
                <span>Exercise: 20 XP correct, 8 XP attempt</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>📖</span>
                <span>Study mode: 5 XP per session</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
