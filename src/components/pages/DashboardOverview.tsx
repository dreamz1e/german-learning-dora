"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and continue your German learning journey
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <span className="text-2xl">🎯</span>
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

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <span className="text-2xl">⭐</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{totalXP}</div>
            <p className="text-xs text-gray-600 mt-1">+{weeklyXP} this week</p>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">
                All-time total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {currentStreak}
            </div>
            <p className="text-xs text-gray-600 mt-1">
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

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <span className="text-2xl">🏆</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {longestStreak}
            </div>
            <p className="text-xs text-gray-600 mt-1">Personal record</p>
            <div className="flex items-center mt-2">
              <Badge variant="info" className="text-xs">
                Personal best
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenge Highlight */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pink-700">
            <span className="text-2xl">🎯</span>
            <span>Today's Challenge</span>
            <Badge variant="success">+50 XP Bonus</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-pink-600">
              Complete your daily German learning challenge to maintain your
              streak and make you Chrisy proud! :D
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1 sm:flex-none">
                Start Daily Challenge
              </Button>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>⏱️ ~20 minutes</span>
                <span>🎯 Mixed difficulty</span>
                <span>🏆 Streak bonus</span>
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
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/70 backdrop-blur-sm hover:bg-white hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${activity.color} flex items-center justify-center text-2xl text-white mb-3 shadow-lg`}
                >
                  {activity.icon}
                </div>
                <CardTitle className="text-lg text-gray-900 group-hover:text-primary transition-colors">
                  {activity.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{activity.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline">{activity.difficulty}</Badge>
                  <span className="text-gray-600 font-medium">
                    +{activity.xpReward} XP
                  </span>
                </div>

                <div className="flex items-center text-xs text-gray-600">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">🏅</span>
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.achievements.slice(0, 3).map((userAchievement) => (
                <div
                  key={userAchievement.id}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  <span className="text-3xl">
                    {userAchievement.achievement.icon}
                  </span>
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      {userAchievement.achievement.name}
                    </h4>
                    <p className="text-xs text-yellow-600">
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
