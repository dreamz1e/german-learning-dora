import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/auth";
import prisma from "@/lib/db";

async function getUsersHandler(
  request: NextRequest,
  params: { params: Promise<{}> },
  userId: string
) {
  try {
    // Await params for Next.js 15 compatibility (even though we don't use them here)
    await params.params;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            displayName: true,
            avatar: true,
            nativeLanguage: true,
            targetLanguage: true,
            timezone: true,
          },
        },
        progress: {
          select: {
            currentLevel: true,
            totalXP: true,
            weeklyXP: true,
            lastActive: true,
          },
        },
        dailyStreak: {
          select: {
            currentStreak: true,
            longestStreak: true,
            lastActiveDate: true,
          },
        },
        achievements: {
          select: {
            unlockedAt: true,
            achievement: {
              select: {
                name: true,
                category: true,
                xpReward: true,
              },
            },
          },
          orderBy: {
            unlockedAt: "desc",
          },
          take: 5, // Latest 5 achievements per user
        },
        exerciseResults: {
          select: {
            isCorrect: true,
            completedAt: true,
            timeSpent: true,
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 10, // Latest 10 exercise results
        },

        _count: {
          select: {
            exerciseResults: true,
            achievements: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add calculated metrics for each user
    const usersWithMetrics = users.map((user: any) => {
      const correctExercises = user.exerciseResults.filter(
        (r: any) => r.isCorrect
      ).length;
      const totalExercises = user.exerciseResults.length;
      const successRate =
        totalExercises > 0
          ? ((correctExercises / totalExercises) * 100).toFixed(1)
          : "0";

      const averageTimeSpent =
        totalExercises > 0
          ? Math.round(
              user.exerciseResults.reduce(
                (sum: any, r: any) => sum + r.timeSpent,
                0
              ) / totalExercises
            )
          : 0;

      const lastActivity = user.progress?.lastActive || user.createdAt;
      const daysSinceActive = Math.floor(
        (new Date().getTime() - new Date(lastActivity).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        ...user,
        metrics: {
          successRate: `${successRate}%`,
          averageTimeSpent,
          daysSinceActive,
          totalExercises: user._count.exerciseResults,
          totalAchievements: user._count.achievements,
          totalDailyChallenges: 0, // TODO: Fix dailyChallengeCompletions query
        },
      };
    });

    return Response.json({
      users: usersWithMetrics,
      totalUsers: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export const GET = withAdminAuth(getUsersHandler);
