import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth'

export const POST = withAuth(async (request: NextRequest, params: any, userId: string) => {
  try {
    // Get current streak data
    const dailyStreak = await prisma.dailyStreak.findUnique({
      where: { userId }
    })

    if (!dailyStreak) {
      return NextResponse.json({ error: 'Daily streak not found' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastActiveDate = new Date(dailyStreak.lastActiveDate)
    lastActiveDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))

    let newCurrentStreak = dailyStreak.currentStreak
    let newLongestStreak = dailyStreak.longestStreak

    if (daysDiff === 0) {
      // Already completed today
      return NextResponse.json({
        message: 'Streak already updated for today',
        streak: dailyStreak
      })
    } else if (daysDiff === 1) {
      // Consecutive day - increment streak
      newCurrentStreak = dailyStreak.currentStreak + 1
      newLongestStreak = Math.max(newCurrentStreak, dailyStreak.longestStreak)
    } else if (daysDiff > 1) {
      // Streak broken - reset to 1
      newCurrentStreak = 1
    }

    // Update streak
    const updatedStreak = await prisma.dailyStreak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: new Date()
      }
    })

    // Check for streak achievements
    const streakAchievements = await prisma.achievement.findMany({
      where: {
        category: 'STREAK'
      }
    })

    let newAchievements = []
    for (const achievement of streakAchievements) {
      // Check if this achievement should be awarded based on current streak
      const condition = achievement.condition as any
      if (condition.streakDays && newCurrentStreak >= condition.streakDays) {
        const existingUserAchievement = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          }
        })

        if (!existingUserAchievement) {
          const userAchievement = await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id
            },
            include: {
              achievement: true
            }
          })
          newAchievements.push(userAchievement)

          // Award XP for achievement
          await prisma.userProgress.update({
            where: { userId },
            data: {
              totalXP: {
                increment: achievement.xpReward
              },
              weeklyXP: {
                increment: achievement.xpReward
              }
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      streak: updatedStreak,
      streakIncreased: newCurrentStreak > dailyStreak.currentStreak,
      newAchievements,
      streakBroken: daysDiff > 1 && dailyStreak.currentStreak > 0
    })

  } catch (error) {
    console.error('Update streak error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})