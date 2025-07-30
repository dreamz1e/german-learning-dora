"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/Toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  xpReward: number;
  condition: any;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
  progressText?: string;
}

interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  achievements: Achievement[];
}

export function Achievements() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!user) return null;

  const userLevel = user.progress?.currentLevel || 1;
  const currentStreak = user.dailyStreak?.currentStreak || 0;

  useEffect(() => {
    const loadAchievements = async () => {
      setIsLoading(true);
      try {
        // For demo purposes, we'll use mock data
        // In a real app, this would fetch from the API
        const mockAchievements = generateMockAchievements();
        setAchievements(mockAchievements);
      } catch (error) {
        console.error("Error loading achievements:", error);
        addToast({
          type: "error",
          title: "Loading Error",
          message: "Failed to load achievements. Please try again.",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [addToast]);

  const generateMockAchievements = (): Achievement[] => {
    const mockAchievements: Achievement[] = [
      // Streak Achievements
      {
        id: "1",
        name: "First Steps",
        description: "Complete your first day of learning",
        category: "STREAK",
        icon: "🚀",
        xpReward: 10,
        condition: { streakDays: 1 },
        isUnlocked: currentStreak >= 1,
        progress: currentStreak >= 1 ? 100 : 0,
        progressText:
          currentStreak >= 1 ? "Completed!" : "Complete 1 day of learning",
      },
      {
        id: "2",
        name: "Getting Started",
        description: "Maintain a 3-day learning streak",
        category: "STREAK",
        icon: "🔥",
        xpReward: 25,
        condition: { streakDays: 3 },
        isUnlocked: currentStreak >= 3,
        progress: Math.min((currentStreak / 3) * 100, 100),
        progressText:
          currentStreak >= 3 ? "Completed!" : `${currentStreak}/3 days`,
      },
      {
        id: "3",
        name: "Consistent Learner",
        description: "Maintain a 7-day learning streak",
        category: "STREAK",
        icon: "💪",
        xpReward: 50,
        condition: { streakDays: 7 },
        isUnlocked: currentStreak >= 7,
        progress: Math.min((currentStreak / 7) * 100, 100),
        progressText:
          currentStreak >= 7 ? "Completed!" : `${currentStreak}/7 days`,
      },
      {
        id: "4",
        name: "Dedicated Student",
        description: "Maintain a 14-day learning streak",
        category: "STREAK",
        icon: "🎯",
        xpReward: 100,
        condition: { streakDays: 14 },
        isUnlocked: currentStreak >= 14,
        progress: Math.min((currentStreak / 14) * 100, 100),
        progressText:
          currentStreak >= 14 ? "Completed!" : `${currentStreak}/14 days`,
      },
      {
        id: "5",
        name: "Learning Machine",
        description: "Maintain a 30-day learning streak",
        category: "STREAK",
        icon: "🤖",
        xpReward: 200,
        condition: { streakDays: 30 },
        isUnlocked: currentStreak >= 30,
        progress: Math.min((currentStreak / 30) * 100, 100),
        progressText:
          currentStreak >= 30 ? "Completed!" : `${currentStreak}/30 days`,
      },

      // Level Achievements
      {
        id: "6",
        name: "Level 2 Reached",
        description: "Reach Level 2 in your German learning journey",
        category: "XP_MILESTONE",
        icon: "⭐",
        xpReward: 20,
        condition: { level: 2 },
        isUnlocked: userLevel >= 2,
        progress: userLevel >= 2 ? 100 : (userLevel / 2) * 100,
        progressText: userLevel >= 2 ? "Completed!" : `Level ${userLevel}/2`,
      },
      {
        id: "7",
        name: "Level 5 Reached",
        description: "Reach Level 5 in your German learning journey",
        category: "XP_MILESTONE",
        icon: "🌟",
        xpReward: 50,
        condition: { level: 5 },
        isUnlocked: userLevel >= 5,
        progress: Math.min((userLevel / 5) * 100, 100),
        progressText: userLevel >= 5 ? "Completed!" : `Level ${userLevel}/5`,
      },
      {
        id: "8",
        name: "Level 10 Reached",
        description: "Reach Level 10 in your German learning journey",
        category: "XP_MILESTONE",
        icon: "💎",
        xpReward: 100,
        condition: { level: 10 },
        isUnlocked: userLevel >= 10,
        progress: Math.min((userLevel / 10) * 100, 100),
        progressText: userLevel >= 10 ? "Completed!" : `Level ${userLevel}/10`,
      },

      // Exercise Achievements
      {
        id: "9",
        name: "First Exercise",
        description: "Complete your first exercise",
        category: "EXERCISE_COUNT",
        icon: "📝",
        xpReward: 10,
        condition: { exerciseCount: 1 },
        isUnlocked: true, // Mock as completed
        progress: 100,
        progressText: "Completed!",
      },
      {
        id: "10",
        name: "Practice Makes Perfect",
        description: "Complete 10 exercises",
        category: "EXERCISE_COUNT",
        icon: "🎓",
        xpReward: 50,
        condition: { exerciseCount: 10 },
        isUnlocked: false,
        progress: 60, // Mock progress
        progressText: "6/10 exercises",
      },
      {
        id: "11",
        name: "Exercise Enthusiast",
        description: "Complete 25 exercises",
        category: "EXERCISE_COUNT",
        icon: "🏃",
        xpReward: 100,
        condition: { exerciseCount: 25 },
        isUnlocked: false,
        progress: 24, // Mock progress
        progressText: "6/25 exercises",
      },

      // Daily Challenge Achievements
      {
        id: "12",
        name: "Challenge Accepted",
        description: "Complete your first daily challenge",
        category: "DAILY_CHALLENGE",
        icon: "✅",
        xpReward: 30,
        condition: { dailyChallenges: 1 },
        isUnlocked: false,
        progress: 0,
        progressText: "Complete your first daily challenge",
      },
      {
        id: "13",
        name: "Challenge Champion",
        description: "Complete 5 daily challenges",
        category: "DAILY_CHALLENGE",
        icon: "🏅",
        xpReward: 100,
        condition: { dailyChallenges: 5 },
        isUnlocked: false,
        progress: 0,
        progressText: "0/5 daily challenges",
      },

      // Special Achievements
      {
        id: "14",
        name: "Welcome to Dora",
        description: "Welcome to your German learning journey!",
        category: "SPECIAL",
        icon: "🎉",
        xpReward: 5,
        condition: { special: "welcome" },
        isUnlocked: true,
        progress: 100,
        progressText: "Completed!",
      },
      {
        id: "15",
        name: "Grammar Guru",
        description: "Complete 10 grammar exercises with perfect scores",
        category: "SPECIAL",
        icon: "📚",
        xpReward: 150,
        condition: { grammarPerfect: 10 },
        isUnlocked: false,
        progress: 30,
        progressText: "3/10 perfect grammar exercises",
      },
      {
        id: "16",
        name: "Vocabulary Virtuoso",
        description: "Learn 100 new German words",
        category: "SPECIAL",
        icon: "🧠",
        xpReward: 200,
        condition: { wordsLearned: 100 },
        isUnlocked: false,
        progress: 45,
        progressText: "45/100 words learned",
      },
    ];

    return mockAchievements;
  };

  const categories: AchievementCategory[] = [
    {
      id: "all",
      name: "All Achievements",
      description: "View all your achievements",
      achievements: achievements,
    },
    {
      id: "STREAK",
      name: "Streak Masters",
      description: "Daily learning consistency achievements",
      achievements: achievements.filter((a) => a.category === "STREAK"),
    },
    {
      id: "XP_MILESTONE",
      name: "Level Milestones",
      description: "Level progression achievements",
      achievements: achievements.filter((a) => a.category === "XP_MILESTONE"),
    },
    {
      id: "EXERCISE_COUNT",
      name: "Exercise Completion",
      description: "Exercise count achievements",
      achievements: achievements.filter((a) => a.category === "EXERCISE_COUNT"),
    },
    {
      id: "DAILY_CHALLENGE",
      name: "Daily Challenges",
      description: "Daily challenge completion achievements",
      achievements: achievements.filter(
        (a) => a.category === "DAILY_CHALLENGE"
      ),
    },
    {
      id: "SPECIAL",
      name: "Special Badges",
      description: "Unique and special achievements",
      achievements: achievements.filter((a) => a.category === "SPECIAL"),
    },
  ];

  const selectedCategoryData =
    categories.find((c) => c.id === selectedCategory) || categories[0];
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-4xl">🏆</span>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Track your progress and unlock badges as you master German
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Your Achievement Progress
                </h2>
                <p className="text-yellow-100">
                  Level {userLevel} • {currentStreak} day streak
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {unlockedCount}/{totalCount}
                </div>
                <div className="text-yellow-100 text-sm">
                  Achievements Unlocked
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xl font-bold">{unlockedCount}</div>
                <div className="text-yellow-100 text-sm">🔓 Unlocked</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xl font-bold">
                  {totalCount - unlockedCount}
                </div>
                <div className="text-yellow-100 text-sm">🔒 Locked</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xl font-bold">
                  {achievements.reduce(
                    (sum, a) => sum + (a.isUnlocked ? a.xpReward : 0),
                    0
                  )}
                </div>
                <div className="text-yellow-100 text-sm">⭐ XP Earned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id
                      ? "bg-pink-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-200 text-gray-700"
                  >
                    {category.achievements.length}
                  </Badge>
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {selectedCategoryData.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          {selectedCategoryData.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCategoryData.achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all duration-300 border-2 ${
                achievement.isUnlocked
                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Achievement Header */}
                  <div className="flex items-start space-x-4">
                    <div
                      className={`text-4xl ${
                        achievement.isUnlocked ? "" : "grayscale opacity-50"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3
                          className={`font-bold ${
                            achievement.isUnlocked
                              ? "text-yellow-800"
                              : "text-gray-600"
                          }`}
                        >
                          {achievement.name}
                        </h3>
                        {achievement.isUnlocked && (
                          <Badge
                            variant="success"
                            className="bg-green-100 text-green-800"
                          >
                            ✓ Unlocked
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          achievement.isUnlocked
                            ? "text-yellow-700"
                            : "text-gray-500"
                        }`}
                      >
                        {achievement.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  {!achievement.isUnlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress || 0)}%</span>
                      </div>
                      <Progress
                        value={achievement.progress || 0}
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {achievement.progressText}
                      </p>
                    </div>
                  )}

                  {/* XP Reward */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span
                        className={`text-sm font-semibold ${
                          achievement.isUnlocked
                            ? "text-yellow-700"
                            : "text-gray-600"
                        }`}
                      >
                        {achievement.xpReward} XP
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        achievement.isUnlocked
                          ? "border-yellow-300 text-yellow-700"
                          : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {achievement.category.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Unlock Date */}
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-yellow-600">
                      Unlocked on{" "}
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Achievement Hint */}
      {selectedCategory === "all" && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-indigo-700">
              <span className="text-2xl">🎯</span>
              <span>Next Achievement Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-indigo-700">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🔥</span>
                  <span className="font-medium">
                    Continue your daily streak to unlock "Getting Started" (3
                    days)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📝</span>
                  <span className="font-medium">
                    Complete more exercises to reach "Practice Makes Perfect"
                    (10 exercises)
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">✅</span>
                  <span className="font-medium">
                    Start completing daily challenges to earn challenge badges
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⭐</span>
                  <span className="font-medium">
                    Level up to unlock milestone achievements and earn more XP
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
