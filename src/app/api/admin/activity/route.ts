import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/auth";
import prisma from "@/lib/db";

async function getActivityHandler(
  request: NextRequest,
  params: {},
  userId: string
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const userIdFilter = searchParams.get("userId");
    const activityType = searchParams.get("type"); // 'exercise', 'achievement', 'daily_challenge', 'all'

    // Get exercise results with user info
    const exerciseActivities =
      activityType === "all" || activityType === "exercise"
        ? await prisma.exerciseResult.findMany({
            where: userIdFilter ? { userId: userIdFilter } : {},
            select: {
              id: true,
              userAnswer: true,
              isCorrect: true,
              timeSpent: true,
              completedAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  profile: {
                    select: {
                      displayName: true,
                    },
                  },
                },
              },
              exercise: {
                select: {
                  type: true,
                  difficulty: true,
                  topic: true,
                  question: true,
                },
              },
            },
            orderBy: {
              completedAt: "desc",
            },
            take: limit,
            skip: offset,
          })
        : [];

    // Get achievement unlocks
    const achievementActivities =
      activityType === "all" || activityType === "achievement"
        ? await prisma.userAchievement.findMany({
            where: userIdFilter ? { userId: userIdFilter } : {},
            select: {
              id: true,
              unlockedAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  profile: {
                    select: {
                      displayName: true,
                    },
                  },
                },
              },
              achievement: {
                select: {
                  name: true,
                  description: true,
                  category: true,
                  icon: true,
                  xpReward: true,
                },
              },
            },
            orderBy: {
              unlockedAt: "desc",
            },
            take: limit,
            skip: offset,
          })
        : [];

    // Get daily challenge completions
    const dailyChallengeActivities =
      activityType === "all" || activityType === "daily_challenge"
        ? await (prisma as any).userDailyChallengeCompletion.findMany({
            where: userIdFilter ? { userId: userIdFilter } : {},
            select: {
              id: true,
              date: true,
              taskId: true,
              taskType: true,
              isCorrect: true,
              timeSpent: true,
              xpEarned: true,
              completedAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  profile: {
                    select: {
                      displayName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              completedAt: "desc",
            },
            take: limit,
            skip: offset,
          })
        : [];

    // Transform and combine activities
    const activities = [
      ...exerciseActivities.map((activity) => ({
        id: activity.id,
        type: "exercise" as const,
        timestamp: activity.completedAt,
        user: {
          id: activity.user.id,
          username: activity.user.username,
          email: activity.user.email,
          displayName:
            activity.user.profile?.displayName || activity.user.username,
        },
        data: {
          exerciseType: activity.exercise.type,
          difficulty: activity.exercise.difficulty,
          topic: activity.exercise.topic,
          question: activity.exercise.question.substring(0, 100) + "...",
          userAnswer: activity.userAnswer,
          isCorrect: activity.isCorrect,
          timeSpent: activity.timeSpent,
        },
      })),
      ...achievementActivities.map((activity) => ({
        id: activity.id,
        type: "achievement" as const,
        timestamp: activity.unlockedAt,
        user: {
          id: activity.user.id,
          username: activity.user.username,
          email: activity.user.email,
          displayName:
            activity.user.profile?.displayName || activity.user.username,
        },
        data: {
          achievementName: activity.achievement.name,
          description: activity.achievement.description,
          category: activity.achievement.category,
          icon: activity.achievement.icon,
          xpReward: activity.achievement.xpReward,
        },
      })),
      ...dailyChallengeActivities.map((activity: any) => ({
        id: activity.id,
        type: "daily_challenge" as const,
        timestamp: activity.completedAt,
        user: {
          id: activity.user.id,
          username: activity.user.username,
          email: activity.user.email,
          displayName:
            activity.user.profile?.displayName || activity.user.username,
        },
        data: {
          date: activity.date,
          taskId: activity.taskId,
          taskType: activity.taskType,
          isCorrect: activity.isCorrect,
          timeSpent: activity.timeSpent,
          xpEarned: activity.xpEarned,
        },
      })),
    ];

    // Sort by timestamp (most recent first)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination if we're getting all types
    const paginatedActivities =
      activityType === "all"
        ? activities.slice(offset, offset + limit)
        : activities;

    return Response.json({
      activities: paginatedActivities,
      pagination: {
        limit,
        offset,
        total: activities.length,
        hasMore: activities.length > offset + limit,
      },
      filters: {
        userId: userIdFilter,
        type: activityType || "all",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return Response.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getActivityHandler);
