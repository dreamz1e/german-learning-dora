import { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUsersHandler(request: NextRequest, params: {}, userId: string) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            displayName: true,
            avatar: true,
            nativeLanguage: true,
            targetLanguage: true,
            timezone: true
          }
        },
        progress: {
          select: {
            currentLevel: true,
            totalXP: true,
            weeklyXP: true,
            lastActive: true
          }
        },
        dailyStreak: {
          select: {
            currentStreak: true,
            longestStreak: true,
            lastActiveDate: true
          }
        },
        achievements: {
          select: {
            unlockedAt: true,
            achievement: {
              select: {
                name: true,
                category: true,
                xpReward: true
              }
            }
          },
          orderBy: {
            unlockedAt: 'desc'
          },
          take: 5 // Latest 5 achievements per user
        },
        exerciseResults: {
          select: {
            isCorrect: true,
            completedAt: true,
            timeSpent: true
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 10 // Latest 10 exercise results
        },
        dailyChallengeCompletions: {
          select: {
            date: true,
            taskType: true,
            isCorrect: true,
            xpEarned: true,
            completedAt: true
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 5 // Latest 5 daily challenge completions
        },
        _count: {
          select: {
            exerciseResults: true,
            achievements: true,
            dailyChallengeCompletions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add calculated metrics for each user
    const usersWithMetrics = users.map(user => {
      const correctExercises = user.exerciseResults.filter(r => r.isCorrect).length
      const totalExercises = user.exerciseResults.length
      const successRate = totalExercises > 0 ? (correctExercises / totalExercises * 100).toFixed(1) : '0'
      
      const averageTimeSpent = totalExercises > 0 
        ? Math.round(user.exerciseResults.reduce((sum, r) => sum + r.timeSpent, 0) / totalExercises)
        : 0

      const lastActivity = user.progress?.lastActive || user.createdAt
      const daysSinceActive = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...user,
        metrics: {
          successRate: `${successRate}%`,
          averageTimeSpent,
          daysSinceActive,
          totalExercises: user._count.exerciseResults,
          totalAchievements: user._count.achievements,
          totalDailyChallenges: user._count.dailyChallengeCompletions
        }
      }
    })

    return Response.json({ 
      users: usersWithMetrics,
      totalUsers: users.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminAuth(getUsersHandler)