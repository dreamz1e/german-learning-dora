"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TipsPanel } from "@/components/ui/TipsPanel";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/Toast";

interface DailyTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  difficulty: string;
  estimatedTime: string;
  type: string;
  aiGenerated?: boolean;
  content?: any;
  completed?: boolean;
  redirectTo?: string;
}

interface DailyChallengeProps {
  onNavigate?: (page: string) => void;
}

export function DailyChallenge({ onNavigate }: DailyChallengeProps) {
  console.log("DailyChallenge component - onNavigate received:", !!onNavigate);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completionsLoading, setCompletionsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!user) return null;

  const currentStreak = user.dailyStreak?.currentStreak || 0;
  const userLevel = user.progress?.currentLevel || 1;

  // Generate AI-powered daily tasks based on user level
  const generateDailyTasks = async (): Promise<DailyTask[]> => {
    const baseTaskTypes = [
      {
        type: "vocabulary",
        icon: "📚",
        title: "Vocabulary Builder",
        baseXP: 20,
        difficulty:
          userLevel <= 3 ? "Easy" : userLevel <= 6 ? "Medium" : "Hard",
      },
      {
        type: "grammar",
        icon: "📝",
        title: "Grammar Practice",
        baseXP: 25,
        difficulty:
          userLevel <= 2 ? "Easy" : userLevel <= 5 ? "Medium" : "Hard",
      },
      {
        type: "reading",
        icon: "📖",
        title: "Reading Comprehension",
        baseXP: 30,
        difficulty:
          userLevel <= 4 ? "Easy" : userLevel <= 7 ? "Medium" : "Hard",
      },
      {
        type: "writing",
        icon: "✍️",
        title: "Writing Challenge",
        baseXP: 35,
        difficulty:
          userLevel <= 3 ? "Easy" : userLevel <= 6 ? "Medium" : "Hard",
      },
      {
        type: "sentence_construction",
        icon: "🧩",
        title: "Sentence Building",
        baseXP: 28,
        difficulty:
          userLevel <= 3 ? "Easy" : userLevel <= 6 ? "Medium" : "Hard",
      },
    ];

    // Select 3-4 tasks based on user level
    const taskCount = userLevel <= 2 ? 3 : 4;
    const selectedTypes = baseTaskTypes
      .sort(() => Math.random() - 0.5)
      .slice(0, taskCount);

    const tasks: DailyTask[] = selectedTypes.map((taskType, index) => {
      const redirectTo = getRedirectPage(taskType.type);
      const meaningful = getMeaningfulTaskDetails(
        taskType.type,
        taskType.difficulty,
        userLevel
      );

      return {
        id: `daily-${taskType.type}-${Date.now()}-${index}`,
        title: taskType.title,
        description: meaningful.description,
        icon: taskType.icon,
        xp: taskType.baseXP + userLevel * 2, // Scale XP with level
        difficulty: taskType.difficulty,
        estimatedTime: getEstimatedTime(taskType.type, taskType.difficulty),
        type: taskType.type,
        aiGenerated: true,
        content: meaningful.content,
        completed: false,
        redirectTo: redirectTo,
      };
    });

    console.log(
      "Generated tasks:",
      tasks.map((t) => ({ type: t.type, redirectTo: t.redirectTo }))
    );
    return tasks;
  };

  const getEstimatedTime = (type: string, difficulty: string): string => {
    const baseMinutes =
      {
        vocabulary: 5,
        grammar: 8,
        reading: 10,
        writing: 12,
        sentence_construction: 6,
      }[type] || 8;

    const difficultyMultiplier =
      {
        Easy: 1,
        Medium: 1.3,
        Hard: 1.6,
      }[difficulty] || 1;

    return `${Math.round(baseMinutes * difficultyMultiplier)} min`;
  };

  const getRedirectPage = (type: string): string => {
    const pageMapping: Record<string, string> = {
      vocabulary: "vocabulary",
      grammar: "grammar",
      reading: "reading",
      writing: "writing",
      sentence_construction: "advanced", // Sentence construction is in advanced exercises
    };
    return pageMapping[type] || "dashboard";
  };

  // More meaningful, motivational micro-goals per task type
  const getMeaningfulTaskDetails = (
    type: string,
    difficulty: string,
    level: number
  ): { description: string; content?: any } => {
    const levelTag = level <= 3 ? "A2" : "B1";

    if (type === "vocabulary") {
      const themes = [
        "Reisen (Travel)",
        "Essen & Trinken (Food)",
        "Arbeit & Büro (Work)",
        "Gefühle (Emotions)",
        "Einkaufen (Shopping)",
      ];
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const targetWords = level <= 3 ? 8 : 12;
      return {
        description: `Learn ${targetWords} ${levelTag}-level words on “${theme}” with examples, then a quick recall test.`,
        content: { theme, targetWords, mode: "spaced_recall" },
      };
    }

    if (type === "grammar") {
      const topics = [
        "Trennbare Verben (separable verbs)",
        "Akkusativ vs. Dativ",
        "Wortstellung: Zeit – Art – Ort",
        "Modalverben im Präsens",
        "Komparativ & Superlativ",
        "Präteritum vs. Perfekt (Alltag)",
      ];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      return {
        description: `Master ${topic} with 5 targeted examples and instant feedback. Focus: ${difficulty}.`,
        content: { topic, examples: 5 },
      };
    }

    if (type === "reading") {
      const themes = [
        "Alltag in Deutschland",
        "Kultur & Traditionen",
        "Gesundheit & Fitness",
        "Arbeit & Studium",
        "Umwelt & Nachhaltigkeit",
      ];
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const words = level <= 3 ? 150 : 220;
      return {
        description: `Read a ${words}-word text about “${theme}” and answer 3 comprehension questions.`,
        content: { theme, targetWords: words, questions: 3 },
      };
    }

    if (type === "writing") {
      const prompts = [
        "Beschreibe deinen Tagesablauf (Describe your daily routine)",
        "Erzähle von einer Reise (Tell about a trip)",
        "Schreibe eine kurze E-Mail (Write a short email)",
        "Was motiviert dich beim Deutschlernen?",
        "Plane ein Wochenende in Berlin",
      ];
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      const minWords = level <= 3 ? 60 : 100;
      return {
        description: `Write ${minWords}-${
          minWords + 40
        } words: ${prompt}. Get AI feedback on grammar, vocab and structure.`,
        content: { prompt, minWords, maxWords: minWords + 40 },
      };
    }

    if (type === "sentence_construction") {
      const focuses = [
        "Position von ‘nicht’",
        "Fragesätze ohne Fragewort",
        "Verbzweitstellung",
        "Nebensätze mit ‘weil’",
        "Trennbare Verben – richtige Reihenfolge",
      ];
      const focus = focuses[Math.floor(Math.random() * focuses.length)];
      return {
        description: `Build 5 sentences focusing on: ${focus}. Unlock the solution after each attempt.`,
        content: { focus, items: 5 },
      };
    }

    return {
      description: `AI-generated ${type} exercise tailored to your level`,
    };
  };

  // Fetch user's daily challenge completions for today
  const fetchCompletions = async () => {
    try {
      setCompletionsLoading(true);
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const response = await fetch(
        `/api/daily-challenges/completions?date=${today}`
      );

      if (response.ok) {
        const data = await response.json();
        const completedTaskIds = data.completions.map((c: any) => c.taskId);
        setCompletedTasks(completedTaskIds);

        // Update progress
        const totalTasks = dailyTasks.length || 4; // fallback to 4 if tasks not loaded yet
        setChallengeProgress((completedTaskIds.length / totalTasks) * 100);
      }
    } catch (error) {
      console.error("Error fetching completions:", error);
    } finally {
      setCompletionsLoading(false);
    }
  };

  // Save completion to database
  const saveCompletion = async (
    taskId: string,
    taskType: string,
    isCorrect: boolean,
    timeSpent: number,
    xpEarned: number
  ) => {
    try {
      const response = await fetch("/api/daily-challenges/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          taskType,
          isCorrect,
          timeSpent,
          xpEarned,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save completion");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving completion:", error);
      throw error;
    }
  };

  // Load daily tasks on component mount
  useEffect(() => {
    const loadDailyTasks = async () => {
      setIsLoading(true);
      try {
        // Check if we have today's tasks cached (still cache tasks, but not completions)
        const today = new Date().toDateString();
        const cachedTasks = localStorage.getItem(`dailyTasks-${today}`);

        if (cachedTasks) {
          const parsedTasks = JSON.parse(cachedTasks);
          // Check if cached tasks have the redirectTo property (for backward compatibility)
          if (
            parsedTasks.length > 0 &&
            parsedTasks[0].redirectTo !== undefined
          ) {
            console.log("Using cached tasks with redirectTo property");
            setDailyTasks(parsedTasks);
          } else {
            console.log(
              "Cached tasks missing redirectTo property, regenerating..."
            );
            const newTasks = await generateDailyTasks();
            setDailyTasks(newTasks);
            localStorage.setItem(
              `dailyTasks-${today}`,
              JSON.stringify(newTasks)
            );
          }
        } else {
          console.log("No cached tasks found, generating new tasks...");
          const newTasks = await generateDailyTasks();
          setDailyTasks(newTasks);
          localStorage.setItem(`dailyTasks-${today}`, JSON.stringify(newTasks));
        }
      } catch (error) {
        console.error("Error loading daily tasks:", error);
        addToast({
          type: "error",
          title: "Loading Error",
          message: "Failed to load daily tasks. Please try again.",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyTasks();
  }, [addToast, userLevel]);

  // Load user's completions separately
  useEffect(() => {
    if (user) {
      fetchCompletions();
    }
  }, [user]);

  // Update progress when tasks or completions change
  useEffect(() => {
    if (dailyTasks.length > 0) {
      setChallengeProgress((completedTasks.length / dailyTasks.length) * 100);
    }
  }, [dailyTasks, completedTasks]);

  // Check for completed daily challenge when coming back from exercises
  useEffect(() => {
    const checkCompletedChallenge = async () => {
      const completedDailyChallenge = localStorage.getItem(
        "completedDailyChallenge"
      );

      if (completedDailyChallenge) {
        const completed = JSON.parse(completedDailyChallenge);

        // Save completion to database if it's not already completed
        if (!completedTasks.includes(completed.taskId)) {
          try {
            await saveCompletion(
              completed.taskId,
              completed.taskType || "unknown",
              completed.isCorrect || false,
              completed.timeSpent || 0,
              completed.xpEarned || 0
            );

            // Refresh completions from database
            await fetchCompletions();

            addToast({
              type: "success",
              title: "Daily Challenge Complete! 🎉",
              message: `Task completed successfully!`,
              duration: 4000,
            });
          } catch (error) {
            console.error("Error saving completion:", error);
            addToast({
              type: "error",
              title: "Error",
              message: "Failed to save task completion. Please try again.",
              duration: 3000,
            });
          }
        }

        // Clean up the local storage
        localStorage.removeItem("completedDailyChallenge");
        localStorage.removeItem("activeDailyChallenge");
      }
    };

    checkCompletedChallenge();
  }, []);

  // Auto-hide confetti after a short celebration
  useEffect(() => {
    if (!showConfetti) return;
    const timer = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(timer);
  }, [showConfetti]);

  const handleStartTask = async (task: DailyTask) => {
    if (completedTasks.includes(task.id)) {
      addToast({
        type: "info",
        title: "Already Completed",
        message: "You've already completed this task today!",
        duration: 3000,
      });
      return;
    }

    // Store the current daily challenge task in localStorage
    localStorage.setItem(
      "activeDailyChallenge",
      JSON.stringify({
        taskId: task.id,
        taskType: task.type,
        taskTitle: task.title,
        xp: task.xp,
        difficulty: task.difficulty,
        content: task.content || null,
        startTime: Date.now(),
      })
    );

    addToast({
      type: "info",
      title: "Redirecting to Exercise",
      message: `Opening ${task.title}...`,
      duration: 2000,
    });

    // Navigate to the appropriate exercise page
    console.log(
      "Debug - onNavigate:",
      !!onNavigate,
      "task.redirectTo:",
      task.redirectTo,
      "task.type:",
      task.type
    );

    if (onNavigate && task.redirectTo) {
      console.log("Navigating to:", task.redirectTo);
      onNavigate(task.redirectTo);
    } else {
      console.error(
        "Navigation failed - onNavigate:",
        !!onNavigate,
        "redirectTo:",
        task.redirectTo
      );
      addToast({
        type: "error",
        title: "Navigation Error",
        message: "Could not navigate to exercise. Please try again.",
        duration: 3000,
      });
    }
  };

  const handleCompleteTask = async (
    taskId: string,
    taskType: string,
    isCorrect: boolean,
    timeSpent: number
  ) => {
    if (completedTasks.includes(taskId)) {
      return; // Already completed
    }

    const task = dailyTasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      // Award XP for the task
      const xpResponse = await fetch("/api/gamification/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: task.xp,
          reason: `Completed daily task: ${task.title}`,
          category: "DAILY_CHALLENGE",
        }),
      });

      if (xpResponse.ok) {
        const xpData = await xpResponse.json();

        // Save completion to database
        await saveCompletion(taskId, taskType, isCorrect, timeSpent, task.xp);

        // Update local state
        const newCompleted = [...completedTasks, taskId];
        setCompletedTasks(newCompleted);

        addToast({
          type: "success",
          title: "Task Completed! 🎉",
          message: `You earned ${task.xp} XP for "${task.title}"`,
          duration: 4000,
        });

        // Show level up notification if applicable
        if (xpData.leveledUp) {
          addToast({
            type: "success",
            title: `🎉 Level Up! You're now Level ${xpData.newLevel}!`,
            message: `Congratulations on reaching Level ${xpData.newLevel}!`,
            duration: 5000,
          });
        }

        // Check if all tasks completed
        if (newCompleted.length === dailyTasks.length) {
          const totalXP = dailyTasks.reduce((sum, t) => sum + t.xp, 0);
          const bonusXP = Math.max(50, currentStreak * 5);

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
              title: "Daily Challenge Complete! 🏆",
              message: `Amazing! You earned ${
                totalXP + bonusXP
              } total XP and maintained your ${
                streakData.streak?.currentStreak || currentStreak + 1
              }-day streak!`,
              duration: 8000,
            });

            // Trigger celebration confetti
            setShowConfetti(true);

            // Show achievement notifications
            if (
              streakData.newAchievements &&
              streakData.newAchievements.length > 0
            ) {
              setTimeout(() => {
                streakData.newAchievements.forEach(
                  (achievement: any, index: number) => {
                    setTimeout(() => {
                      addToast({
                        type: "success",
                        title: `🏆 Achievement Unlocked!`,
                        message: `"${achievement.name}" - ${achievement.description}`,
                        duration: 6000,
                      });
                    }, index * 1000);
                  }
                );
              }, 2000);
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
  };

  if (isLoading || completionsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">
            {isLoading
              ? "Generating your personalized daily challenges..."
              : "Loading your progress..."}
          </p>
        </div>
      </div>
    );
  }

  const totalXP = dailyTasks.reduce((sum, task) => sum + task.xp, 0);
  const bonusXP = Math.max(50, currentStreak * 5);
  const allTasksCompleted = completedTasks.length === dailyTasks.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 space-y-6">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => {
            const left = Math.random() * 100;
            const size = Math.floor(Math.random() * 8) + 6; // 6-14px
            const duration = 2.5 + Math.random(); // 2.5-3.5s
            const delay = Math.random() * 0.7; // 0-0.7s
            const rotate = Math.floor(Math.random() * 360);
            const colors = [
              "#F43F5E",
              "#F97316",
              "#F59E0B",
              "#10B981",
              "#3B82F6",
              "#8B5CF6",
              "#EC4899",
            ];
            const color = colors[i % colors.length];
            return (
              <span
                key={i}
                className="absolute -top-10 rounded-[1px] opacity-90"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${Math.max(3, Math.floor(size * 0.4))}px`,
                  backgroundColor: color,
                  transform: `rotate(${rotate}deg)`,
                  animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
                }}
              />
            );
          })}
          <style jsx>{`
            @keyframes confetti-fall {
              0% {
                transform: translate3d(0, -80px, 0) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translate3d(0, 110vh, 0) rotate(720deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}
      {/* Hero Header */}
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-white border-pink-200 ring-1 ring-pink-200/60">
        <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl" />
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground bg-background/60">
              <span>🎯 Daily Challenge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Learn smart. Keep the streak alive.
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Complete AI-generated tasks tailored to your level. Small wins,
              every day.
            </p>
            {allTasksCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-green-700 font-semibold">
                  🎉 All challenges completed! Come back tomorrow for new tasks.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card className="relative overflow-hidden bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur-xl ring-1 ring-border">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400" />
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Today's Progress
                </h2>
                <p className="text-muted-foreground">
                  Level {userLevel} •{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {completedTasks.length}/{dailyTasks.length}
                </div>
                <div className="text-muted-foreground text-sm">
                  Tasks Complete
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(challengeProgress)}%</span>
              </div>
              <Progress value={challengeProgress} className="h-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="rounded-lg p-3 ring-1 ring-border bg-card">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {currentStreak}
                </div>
                <div className="text-muted-foreground text-sm">
                  🔥 Day Streak
                </div>
              </div>
              <div className="rounded-lg p-3 ring-1 ring-border bg-card">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {totalXP}
                </div>
                <div className="text-muted-foreground text-sm">
                  ⭐ XP Available
                </div>
              </div>
              <div className="rounded-lg p-3 ring-1 ring-border bg-card">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  +{bonusXP}
                </div>
                <div className="text-muted-foreground text-sm">🎁 Bonus XP</div>
              </div>
            </div>

            {allTasksCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-semibold">
                  All challenges completed! Come back tomorrow for new tasks!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Today's Challenges
          </h2>
          <Badge variant="outline" className="text-sm">
            {dailyTasks.filter((t) => t.aiGenerated).length} AI-Generated
          </Badge>
        </div>

        <div className="grid gap-4">
          {dailyTasks.map((task, index) => {
            const isCompleted = completedTasks.includes(task.id);
            const activeDailyChallenge = localStorage.getItem(
              "activeDailyChallenge"
            );
            const isActive = activeDailyChallenge
              ? JSON.parse(activeDailyChallenge).taskId === task.id
              : false;

            return (
              <Card
                key={task.id}
                className={`transition-all duration-300 border-2 ${
                  isCompleted
                    ? "bg-green-50 border-green-300 shadow-md"
                    : isActive
                    ? "bg-pink-50 border-pink-300 shadow-lg"
                    : "hover:shadow-lg border-gray-200 hover:border-gray-300"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="relative">
                      <div
                        className={`text-4xl sm:text-5xl ${
                          isCompleted ? "grayscale" : ""
                        }`}
                      >
                        {task.icon}
                      </div>
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                      {!isCompleted && (
                        <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {task.title}
                        </h3>
                        <Badge
                          variant={
                            task.difficulty === "Easy"
                              ? "success"
                              : task.difficulty === "Medium"
                              ? "warning"
                              : "destructive"
                          }
                          className="font-medium"
                        >
                          {task.difficulty}
                        </Badge>
                        {task.aiGenerated && (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-300"
                          >
                            🤖 AI-Generated
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge
                            variant="success"
                            className="bg-green-100 text-green-800"
                          >
                            ✅ Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 text-base leading-relaxed">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-700">
                            {task.xp} XP
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-pink-500">⏱️</span>
                          <span className="text-gray-600">
                            {task.estimatedTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-purple-500">📚</span>
                          <span className="text-gray-600 capitalize">
                            {task.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-lg">
                          <span className="text-2xl">🎉</span>
                          <span className="font-bold">Complete!</span>
                        </div>
                      ) : isActive ? (
                        <Button
                          onClick={() => handleStartTask(task)}
                          size="lg"
                          className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          aria-label={`Resume ${task.title}`}
                        >
                          Resume
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleStartTask(task)}
                          size="lg"
                          className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          aria-label={`Start ${task.title}`}
                        >
                          Start Challenge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <TipsPanel
        title="Daily Challenge Tips"
        tone="indigo"
        sections={[
          {
            items: [
              "Complete all tasks to maximize your XP and earn bonus rewards",
              "Daily completion maintains your learning streak",
            ],
          },
          {
            items: [
              "Longer streaks unlock higher XP multipliers",
              "Consistent practice unlocks achievements and badges",
            ],
          },
        ]}
      />
    </div>
  );
}
