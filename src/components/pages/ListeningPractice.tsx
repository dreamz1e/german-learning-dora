"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import ListeningExercise from "@/components/exercises/ListeningExercise";
import { listeningTopics } from "@/types/exerciseTypes";
import { Input } from "@/components/ui/Input";

interface ListeningPracticeProps {
  onNavigate?: (page: string) => void;
}

export function ListeningPractice({ onNavigate }: ListeningPracticeProps = {}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [difficulty, setDifficulty] = useState<
    | "A2_BASIC"
    | "A2_INTERMEDIATE"
    | "B1_BASIC"
    | "B1_INTERMEDIATE"
    | "B1_ADVANCED"
  >("A2_BASIC");
  const [topic, setTopic] = useState<string>("");
  const [exercise, setExercise] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDailyChallenge] = useState(false);

  const DIFFICULTIES = [
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ] as const;

  const difficultyLabels: Record<string, { title: string; hint: string }> = {
    A2_BASIC: {
      title: "Beginner (A2 Basic)",
      hint: "Very short, simple sentences on everyday topics.",
    },
    A2_INTERMEDIATE: {
      title: "Beginner+ (A2 Intermediate)",
      hint: "1–2 short sentences. Familiar, daily situations.",
    },
    B1_BASIC: {
      title: "Intermediate (B1 Basic)",
      hint: "Two sentences with more detail. Moderate pace.",
    },
    B1_INTERMEDIATE: {
      title: "Intermediate+ (B1 Intermediate)",
      hint: "2–3 sentences; may include a clause or time/price.",
    },
    B1_ADVANCED: {
      title: "Upper Intermediate (B1 Advanced)",
      hint: "Longer snippet with a subordinate clause.",
    },
  };

  const selectRandomTopic = () => {
    const random =
      listeningTopics[Math.floor(Math.random() * listeningTopics.length)];
    setTopic(random);
  };

  const sanitizeTopic = (value: string) =>
    value
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}\s\-&']/gu, "")
      .slice(0, 50)
      .trim();

  // Pick a sensible default level based on user progress (if available)
  useEffect(() => {
    const lvl = user?.progress?.currentLevel ?? 0;
    if (lvl > 0) {
      let d: typeof difficulty = "A2_BASIC";
      if (lvl >= 35) d = "B1_ADVANCED";
      else if (lvl >= 28) d = "B1_INTERMEDIATE";
      else if (lvl >= 20) d = "B1_BASIC";
      else if (lvl >= 10) d = "A2_INTERMEDIATE";
      setDifficulty(d);
    }
  }, [user]);

  const exerciseKey = useMemo(
    () =>
      exercise
        ? `${exercise.topic}-${exercise.transcript?.slice(0, 16)}`
        : "none",
    [exercise]
  );

  const generateExercise = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate-listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, topic: topic || undefined }),
      });
      if (!response.ok) throw new Error("Failed to generate");
      const data = await response.json();
      setExercise(data.exercise);
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        title: "Generation Failed",
        message: "Unable to generate listening exercise",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // No auto-generate to allow choosing difficulty/topic first

  const handleComplete = async (score: number, timeSpent: number) => {
    if (!user || !exercise) return;
    try {
      const points = Math.max(0, Math.round(score));
      if (points === 0) {
        addToast({
          type: "error",
          title: "No XP Awarded",
          message: "Score was 0. Try again!",
          duration: 4000,
        });
        // Load next exercise even on failure to keep flow consistent
        await generateExercise();
        return;
      }

      // XP: points * 0.2, ensure at least 1 for any non-zero score and integer for backend
      const xpAmount = Math.ceil(points * 0.2);

      await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: xpAmount,
          reason: isDailyChallenge
            ? "Completed daily challenge listening task"
            : `Listening practice: ${exercise.topic}`,
          category: isDailyChallenge ? "DAILY_CHALLENGE" : "EXERCISE",
        }),
      });

      addToast({
        type: "success",
        title: "XP Awarded",
        message: `You earned ${xpAmount} XP!`,
        duration: 3000,
      });

      // Load next exercise
      await generateExercise();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Listening Practice</h2>
        <p className="text-muted-foreground">
          Choose a level and topic, then start your exercise.
        </p>
      </div>

      {!exercise ? (
        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">🎧</span>
              <span>Set up your listening exercise</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Choose your level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIFFICULTIES.map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level as any)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left ${
                        difficulty === level
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-card hover:border-primary hover:bg-indigo-50"
                      }`}
                    >
                      <div>{difficultyLabels[level].title}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {difficultyLabels[difficulty]?.hint}
                </p>
              </div>

              {/* Topic Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Pick a topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {listeningTopics.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(sanitizeTopic(t))}
                      className={`px-3 py-2 rounded-full border text-sm transition-colors ${
                        topic === t
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:border-primary hover:bg-indigo-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    onClick={() => setTopic("")}
                    className={`px-3 py-2 rounded-full border text-sm transition-colors ${
                      topic === ""
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:border-primary hover:bg-indigo-50"
                    }`}
                  >
                    Any topic
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(sanitizeTopic(e.target.value))}
                    placeholder="Or type your own (e.g., Train station)"
                    maxLength={50}
                    inputMode="text"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={selectRandomTopic}
                  >
                    Random
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current topic: {topic || "Any"}
                </p>
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
                  "Start Listening Exercise"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="ring-1 ring-border/60 bg-card/60">
            <CardContent className="py-4">
              <div className="grid md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DIFFICULTIES.map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level as any)}
                        className={`p-2 rounded-md border text-xs font-medium transition-colors text-left ${
                          difficulty === level
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-card hover:border-primary/60 hover:bg-indigo-50"
                        }`}
                      >
                        {difficultyLabels[level].title}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {difficultyLabels[difficulty]?.hint}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {listeningTopics.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(sanitizeTopic(t))}
                        className={`px-2.5 py-1.5 rounded-full border text-xs transition-colors ${
                          topic === t
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input hover:border-primary/60 hover:bg-indigo-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                    <button
                      onClick={() => setTopic("")}
                      className={`px-2.5 py-1.5 rounded-full border text-xs transition-colors ${
                        topic === ""
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:border-primary/60 hover:bg-indigo-50"
                      }`}
                    >
                      Any
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(sanitizeTopic(e.target.value))}
                      placeholder="Type your own (optional)"
                      maxLength={20}
                      inputMode="text"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={selectRandomTopic}
                    >
                      Random
                    </Button>
                    <Button onClick={generateExercise} disabled={isLoading}>
                      {isLoading ? "Updating..." : "New exercise"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current topic: {topic || "Any"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ListeningExercise
            key={exerciseKey}
            exercise={exercise}
            onComplete={handleComplete}
          />
        </>
      )}
    </div>
  );
}
