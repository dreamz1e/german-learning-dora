"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/Toast";

export function DailyChallenge() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  if (!user) return null;

  const currentStreak = user.dailyStreak?.currentStreak || 0;

  const dailyTasks = [
    {
      id: "vocabulary-5",
      title: "Learn 5 New Words",
      description: "Study 5 new German vocabulary words with examples",
      icon: "📚",
      xp: 20,
      difficulty: "Easy",
      estimatedTime: "5 min",
      type: "vocabulary",
    },
    {
      id: "grammar-exercise",
      title: "Grammar Practice",
      description: "Complete a German grammar exercise on cases",
      icon: "📝",
      xp: 25,
      difficulty: "Medium",
      estimatedTime: "10 min",
      type: "grammar",
    },
    {
      id: "reading-short",
      title: "Quick Reading",
      description: "Read a short German text and answer questions",
      icon: "📖",
      xp: 30,
      difficulty: "Medium",
      estimatedTime: "8 min",
      type: "reading",
    },
    {
      id: "listening-audio",
      title: "Listening Exercise",
      description: "Listen to a German audio clip and comprehend",
      icon: "🎧",
      xp: 25,
      difficulty: "Medium",
      estimatedTime: "7 min",
      type: "listening",
    },
  ];

  const totalXP = dailyTasks.reduce((sum, task) => sum + task.xp, 0);
  const bonusXP = Math.max(50, currentStreak * 5); // Bonus increases with streak

  const handleCompleteTask = async (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      const task = dailyTasks.find((t) => t.id === taskId);

      try {
        // Award XP for the task
        const xpResponse = await fetch("/api/gamification/award-xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: task?.xp || 0,
            reason: `Completed task: ${task?.title}`,
            category: "DAILY_CHALLENGE",
          }),
        });

        if (xpResponse.ok) {
          const xpData = await xpResponse.json();

          const newCompleted = [...completedTasks, taskId];
          setCompletedTasks(newCompleted);
          setChallengeProgress((newCompleted.length / dailyTasks.length) * 100);

          addToast({
            type: "success",
            title: "Task Completed!",
            message: `You earned ${task?.xp} XP for "${task?.title}"`,
            duration: 3000,
          });

          // Show level up notification if applicable
          if (xpData.leveledUp) {
            addToast({
              type: "success",
              title: `🎉 Level Up! You're now Level ${xpData.newLevel}!`,
              message: `Keep up the great work!`,
              duration: 5000,
            });
          }

          // Check if all tasks completed
          if (newCompleted.length === dailyTasks.length) {
            // Update streak and award bonus XP
            const streakResponse = await fetch(
              "/api/gamification/update-streak",
              {
                method: "POST",
              }
            );

            if (streakResponse.ok) {
              const streakData = await streakResponse.json();

              // Award bonus XP for completing all tasks
              await fetch("/api/gamification/award-xp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  amount: bonusXP,
                  reason: "Daily Challenge completion bonus",
                  category: "DAILY_CHALLENGE",
                }),
              });

              addToast({
                type: "success",
                title: "Daily Challenge Complete! 🎉",
                message: `You earned ${
                  totalXP + bonusXP
                } total XP and maintained your streak!`,
                duration: 5000,
              });

              // Show streak notifications
              if (streakData.streakIncreased) {
                addToast({
                  type: "success",
                  title: `🔥 Streak Updated!`,
                  message: `Your streak is now ${streakData.streak.currentStreak} days!`,
                  duration: 4000,
                });
              }

              // Show achievement notifications
              if (streakData.newAchievements?.length > 0) {
                streakData.newAchievements.forEach((achievement: any) => {
                  addToast({
                    type: "success",
                    title: `🏆 Achievement Unlocked!`,
                    message: `${achievement.achievement.name}: ${achievement.achievement.description}`,
                    duration: 6000,
                  });
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error completing task:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to complete task. Please try again.",
          duration: 3000,
        });
      }
    }
  };

  const isTaskCompleted = (taskId: string) => completedTasks.includes(taskId);
  const isAllCompleted = completedTasks.length === dailyTasks.length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold tracking-tight">Daily Challenge</h1>
          <Badge variant="success" className="text-sm">
            Day {new Date().getDate()}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Complete today's tasks to maintain your streak and earn bonus XP
        </p>
      </div>

      {/* Challenge Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {completedTasks.length}/{dailyTasks.length}
              </div>
              <Progress
                value={challengeProgress}
                max={100}
                size="md"
                variant="default"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(challengeProgress)}% Complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Potential XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-yellow-600">
                {totalXP + bonusXP}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Tasks:</span>
                  <span>{totalXP} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus:</span>
                  <span>+{bonusXP} XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-orange-600">
                  {currentStreak}
                </span>
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentStreak === 0
                  ? "Start your first streak!"
                  : `${currentStreak} days strong`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {isAllCompleted && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-green-700">
                Congratulations!
              </h2>
              <p className="text-green-600">
                You've completed today's challenge and earned{" "}
                {totalXP + bonusXP} XP! Your streak is now {currentStreak + 1}{" "}
                days.
              </p>
              <Badge variant="success" className="text-lg px-4 py-2">
                Challenge Complete!
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Tasks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Today's Tasks</h2>

        <div className="grid gap-4">
          {dailyTasks.map((task, index) => {
            const isCompleted = isTaskCompleted(task.id);
            return (
              <Card
                key={task.id}
                className={`transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-50 border-green-200 opacity-75"
                    : "hover:shadow-md cursor-pointer"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Task Number & Icon */}
                    <div
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                      ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-blue-100 text-blue-600"
                      }
                    `}
                    >
                      {isCompleted ? "✓" : task.icon}
                    </div>

                    {/* Task Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3
                          className={`font-semibold ${
                            isCompleted
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        <Badge variant={isCompleted ? "success" : "outline"}>
                          +{task.xp} XP
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {task.difficulty}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>⏱️ {task.estimatedTime}</span>
                        <span>📚 {task.type}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        variant={isCompleted ? "secondary" : "default"}
                        disabled={isCompleted}
                        className="min-w-[100px]"
                      >
                        {isCompleted ? "Completed" : "Start Task"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tips & Motivation */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <span className="text-xl">💡</span>
            <span>Daily Challenge Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-600">
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Complete all tasks to maximize your XP</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🔥</span>
                <span>Daily completion maintains your streak</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Longer streaks give higher bonuses</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Consistent practice leads to faster progress</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
