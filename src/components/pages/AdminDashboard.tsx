"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface UserMetrics {
  successRate: string;
  averageTimeSpent: number;
  daysSinceActive: number;
  totalExercises: number;
  totalAchievements: number;
  totalDailyChallenges: number;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    displayName?: string;
    avatar?: string;
    nativeLanguage: string;
    targetLanguage: string;
    timezone: string;
  };
  progress?: {
    currentLevel: number;
    totalXP: number;
    weeklyXP: number;
    lastActive: string;
  };
  dailyStreak?: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
  };
  achievements: Array<{
    unlockedAt: string;
    achievement: {
      name: string;
      category: string;
      xpReward: number;
    };
  }>;
  exerciseResults: Array<{
    isCorrect: boolean;
    completedAt: string;
    timeSpent: number;
  }>;
  dailyChallengeCompletions: Array<{
    date: string;
    taskType: string;
    isCorrect: boolean;
    xpEarned: number;
    completedAt: string;
  }>;
  metrics: UserMetrics;
}

interface Activity {
  id: string;
  type: "exercise" | "achievement" | "daily_challenge";
  timestamp: string;
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
  };
  data: any;
}

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({
  className = "",
}: AdminDashboardProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "activity">("users");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<
    "all" | "exercise" | "achievement" | "daily_challenge"
  >("all");

  useEffect(() => {
    loadUsers();
    loadActivities();
  }, []);

  useEffect(() => {
    if (activeTab === "activity") {
      loadActivities();
    }
  }, [selectedUserId, activityFilter, activeTab]);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadActivities = async () => {
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
        type: activityFilter,
      });

      if (selectedUserId) {
        params.append("userId", selectedUserId);
      }

      const response = await fetch(`/api/admin/activity?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      } else {
        console.error("Failed to load activities");
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDaysAgo = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "exercise":
        return "bg-blue-100 text-blue-800";
      case "achievement":
        return "bg-yellow-100 text-yellow-800";
      case "daily_challenge":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderUserTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Activity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {(user.profile?.displayName ||
                          user.username)[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.profile?.displayName || user.username}
                      {user.isAdmin && (
                        <Badge className="ml-2 bg-red-100 text-red-800">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Level {user.progress?.currentLevel || 1}
                </div>
                <div className="text-sm text-gray-500">
                  {user.progress?.totalXP || 0} XP total
                </div>
                <div className="text-sm text-gray-500">
                  {user.progress?.weeklyXP || 0} XP this week
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  🔥 {user.dailyStreak?.currentStreak || 0} day streak
                </div>
                <div className="text-sm text-gray-500">
                  Best: {user.dailyStreak?.longestStreak || 0} days
                </div>
                <div className="text-sm text-gray-500">
                  Last active: {formatDaysAgo(user.metrics.daysSinceActive)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Success rate: {user.metrics.successRate}
                </div>
                <div className="text-sm text-gray-500">
                  {user.metrics.totalExercises} exercises completed
                </div>
                <div className="text-sm text-gray-500">
                  {user.metrics.totalAchievements} achievements
                </div>
                <div className="text-sm text-gray-500">
                  Avg time: {user.metrics.averageTimeSpent}s
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  className={
                    user.metrics.daysSinceActive === 0
                      ? "bg-green-100 text-green-800"
                      : user.metrics.daysSinceActive <= 3
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {user.metrics.daysSinceActive === 0
                    ? "Active"
                    : user.metrics.daysSinceActive <= 3
                    ? "Recent"
                    : "Inactive"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderActivityFeed = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedUserId || ""}
          onChange={(e) => setSelectedUserId(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.profile?.displayName || user.username}
            </option>
          ))}
        </select>

        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Activities</option>
          <option value="exercise">Exercises</option>
          <option value="achievement">Achievements</option>
          <option value="daily_challenge">Daily Challenges</option>
        </select>
      </div>

      {/* Activity Items */}
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {activity.user.displayName[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {activity.user.displayName}
                  </span>
                  <Badge className={getActivityTypeColor(activity.type)}>
                    {activity.type.replace("_", " ")}
                  </Badge>
                </div>

                {activity.type === "exercise" && (
                  <div className="text-sm text-gray-600">
                    <p>Completed {activity.data.exerciseType} exercise</p>
                    <p>
                      Topic: {activity.data.topic} | Difficulty:{" "}
                      {activity.data.difficulty}
                    </p>
                    <p>
                      Result:{" "}
                      {activity.data.isCorrect ? "✅ Correct" : "❌ Incorrect"}{" "}
                      | Time: {activity.data.timeSpent}s
                    </p>
                  </div>
                )}

                {activity.type === "achievement" && (
                  <div className="text-sm text-gray-600">
                    <p>🏆 Unlocked "{activity.data.achievementName}"</p>
                    <p>{activity.data.description}</p>
                    <p>Earned {activity.data.xpReward} XP</p>
                  </div>
                )}

                {activity.type === "daily_challenge" && (
                  <div className="text-sm text-gray-600">
                    <p>Completed daily challenge: {activity.data.taskType}</p>
                    <p>
                      Result:{" "}
                      {activity.data.isCorrect ? "✅ Correct" : "❌ Incorrect"}{" "}
                      | Earned {activity.data.xpEarned} XP
                    </p>
                    <p>Time: {activity.data.timeSpent}s</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-gray-500">
                {formatDate(activity.timestamp)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-64`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Monitor user progress and activity across the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.metrics.daysSinceActive <= 7).length}
          </div>
          <div className="text-sm text-gray-600">Active This Week</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">
            {users.reduce((sum, u) => sum + u.metrics.totalExercises, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Exercises</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">
            {users.reduce((sum, u) => sum + u.metrics.totalAchievements, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Achievements</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Users Overview
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "activity"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Activity Feed
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && (
        <Card className="overflow-hidden">{renderUserTable()}</Card>
      )}

      {activeTab === "activity" && renderActivityFeed()}
    </div>
  );
}
