"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Flame, Star, Trophy, Target, Clock, Sparkles } from "lucide-react";

interface DashboardOverviewProps {
  onNavigate?: (page: string) => void;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps = {}) {
  const { user } = useAuth();

  if (!user) return null;

  const currentLevel = user.progress?.currentLevel || 1;
  const totalXP = user.progress?.totalXP || 0;
  const weeklyXP = user.progress?.weeklyXP || 0;
  const currentStreak = user.dailyStreak?.currentStreak || 0;
  const longestStreak = user.dailyStreak?.longestStreak || 0;
  const displayName = user.profile?.displayName || user.username;

  // Calculate XP progress for current level
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;

  const learningActivities = [
    {
      id: "grammar",
      title: "Grammar Practice",
      icon: "📝",
      description: "Master German grammar with AI-generated exercises",
      difficulty: "A2-B1",
      estimatedTime: "15-20 min",
      xpReward: 25,
      color: "from-pink-500 to-pink-600",
      available: true,
    },
    {
      id: "vocabulary",
      title: "Vocabulary Builder",
      icon: "📚",
      description: "Learn new words with AI-generated content",
      difficulty: "A2-B1",
      estimatedTime: "10-15 min",
      xpReward: 20,
      color: "from-green-500 to-green-600",
      available: true,
    },
    {
      id: "reading",
      title: "Reading Comprehension",
      icon: "📖",
      description: "AI-generated German texts with questions",
      difficulty: "A2-B1",
      estimatedTime: "20-25 min",
      xpReward: 30,
      color: "from-purple-500 to-purple-600",
      available: true,
    },
    {
      id: "listening",
      title: "Listening Practice",
      icon: "🎧",
      description: "Improve your German listening skills",
      difficulty: "A2-B1",
      estimatedTime: "15-20 min",
      xpReward: 25,
      color: "from-orange-500 to-orange-600",
      available: false,
    },
    {
      id: "writing",
      title: "Writing Practice",
      icon: "✏️",
      description: "AI-guided German writing exercises",
      difficulty: "A2-B1",
      estimatedTime: "20-30 min",
      xpReward: 35,
      color: "from-rose-500 to-pink-600",
      available: true,
    },
    {
      id: "advanced",
      title: "Advanced Exercises",
      icon: "🎯",
      description: "Sentence construction & error correction",
      difficulty: "A2-B1",
      estimatedTime: "15-25 min",
      xpReward: 40,
      color: "from-pink-600 to-rose-700",
      available: true,
    },
    {
      id: "quiz",
      title: "Quick Quiz",
      icon: "🎲",
      description: "Test your knowledge",
      difficulty: "Mixed",
      estimatedTime: "5-10 min",
      xpReward: 15,
      color: "from-indigo-500 to-indigo-600",
      available: false,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur-xl ring-1 ring-border shadow-xl">
        <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground bg-background/60">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Welcome back, {displayName}!
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
                Your German learning overview
              </h1>
              <p className="mt-2 text-muted-foreground">
                Keep your streak alive and level up with focused activities.
              </p>
            </div>
            <div className="w-full md:w-auto min-w-[260px]">
              <Card className="relative overflow-hidden bg-card/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Level {currentLevel} progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={xpProgress} max={xpNeeded} size="sm" />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{xpProgress} XP</span>
                    <span>
                      {xpNeeded} to level {currentLevel + 1}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-rose-400 to-primary" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {currentLevel}
            </div>
            <Progress
              value={xpProgress}
              max={xpNeeded}
              size="sm"
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{xpProgress} XP</span>
              <span>
                {xpNeeded} XP to level {currentLevel + 1}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600">
              <Star className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{totalXP}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{weeklyXP} this week
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">
                All-time total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-400 via-rose-400 to-orange-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Flame className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {currentStreak}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentStreak === 0
                ? "Start your streak today!"
                : "days in a row"}
            </p>
            <div className="flex items-center mt-2">
              <Badge
                variant={currentStreak > 0 ? "success" : "secondary"}
                className="text-xs"
              >
                {currentStreak > 0 ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Trophy className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {longestStreak}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal record
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="info" className="text-xs">
                Personal best
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenge Highlight */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-white border-pink-200 ring-1 ring-pink-200/60">
        <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Target className="h-5 w-5" />
            <span>Today's Challenge</span>
            <Badge variant="success">+50 XP Bonus</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-pink-700/90">
              Complete your daily German learning challenge to maintain your
              streak and make you Chrisy proud! :D
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1 sm:flex-none">
                Start Daily Challenge
              </Button>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" /> ~20 minutes
                </span>
                <span className="inline-flex items-center gap-1">
                  <Target className="h-4 w-4" /> Mixed difficulty
                </span>
                <span className="inline-flex items-center gap-1">
                  <Trophy className="h-4 w-4" /> Streak bonus
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Learning Activities
          </h2>
          <Badge variant="outline">A2-B1 Level</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningActivities.map((activity) => (
            <Card
              key={activity.id}
              className="group relative overflow-hidden cursor-pointer ring-1 ring-border bg-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${activity.color}`}
              />
              <CardHeader className="pb-3">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${activity.color} flex items-center justify-center text-2xl text-white mb-3 shadow-lg`}
                >
                  {activity.icon}
                </div>
                <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                  {activity.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline">{activity.difficulty}</Badge>
                  <span className="text-foreground/80 font-medium">
                    +{activity.xpReward} XP
                  </span>
                </div>

                <div className="flex items-center text-xs text-muted-foreground">
                  <span>⏱️ {activity.estimatedTime}</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => onNavigate?.(activity.id)}
                  disabled={!activity.available}
                >
                  {activity.available ? "Start Practice" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {user.achievements && user.achievements.length > 0 && (
        <Card className="relative overflow-hidden ring-1 ring-border/80">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.achievements.slice(0, 3).map((userAchievement) => (
                <div
                  key={userAchievement.id}
                  className="flex items-center gap-3 p-4 rounded-lg ring-1 ring-amber-200/60 bg-gradient-to-r from-yellow-50 to-orange-50"
                >
                  <span className="text-3xl">
                    {userAchievement.achievement.icon}
                  </span>
                  <div>
                    <h4 className="font-medium text-amber-800">
                      {userAchievement.achievement.name}
                    </h4>
                    <p className="text-xs text-amber-700">
                      +{userAchievement.achievement.xpReward} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
