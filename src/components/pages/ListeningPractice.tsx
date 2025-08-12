"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import ListeningExercise from "@/components/exercises/ListeningExercise";

interface ListeningPracticeProps {
  onNavigate?: (page: string) => void;
}

export function ListeningPractice({ onNavigate }: ListeningPracticeProps = {}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [difficulty, setDifficulty] = useState(
    (user?.profile?.preferredLevel as any) || "A2_BASIC"
  );
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [exercise, setExercise] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDailyChallenge] = useState(false);

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
        body: JSON.stringify({ difficulty, topic }),
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

  useEffect(() => {
    generateExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async (score: number, timeSpent: number) => {
    if (!user || !exercise) return;
    try {
      // XP based on score, similar to reading
      let xpAmount = 30;
      if (score >= 90) xpAmount = 50;
      else if (score >= 70) xpAmount = 40;
      else if (score >= 50) xpAmount = 30;
      else xpAmount = 20;

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Listening Practice</h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={generateExercise}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "New Exercise"}
          </Button>
        </div>
      </div>

      {!exercise ? (
        <Card>
          <CardHeader>
            <CardTitle>Generating Exercise...</CardTitle>
          </CardHeader>
          <CardContent>One moment, please.</CardContent>
        </Card>
      ) : (
        <ListeningExercise
          key={exerciseKey}
          exercise={exercise}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
