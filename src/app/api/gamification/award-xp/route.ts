import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth'

const awardXPSchema = z.object({
  amount: z.number().min(1).max(1000),
  reason: z.string().min(1).max(100),
  category: z.enum(['EXERCISE', 'DAILY_CHALLENGE', 'STREAK_BONUS', 'ACHIEVEMENT']).optional()
})

export const POST = withAuth(async (request: NextRequest, params: any, userId: string) => {
  try {
    const body = await request.json()
    const { amount, reason, category = 'EXERCISE' } = awardXPSchema.parse(body)

    // Get current user progress
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    })

    if (!userProgress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    const currentTotalXP = userProgress.totalXP
    const currentWeeklyXP = userProgress.weeklyXP
    const currentLevel = userProgress.currentLevel

    // Calculate new totals
    const newTotalXP = currentTotalXP + amount
    const newWeeklyXP = currentWeeklyXP + amount

    // Calculate new level (simple formula: level = floor(totalXP / 100) + 1)
    const newLevel = Math.floor(newTotalXP / 100) + 1
    const leveledUp = newLevel > currentLevel

    // Update user progress
    const updatedProgress = await prisma.userProgress.update({
      where: { userId },
      data: {
        totalXP: newTotalXP,
        weeklyXP: newWeeklyXP,
        currentLevel: newLevel,
        lastActive: new Date()
      }
    })

    // Check for level-up achievements
    let newAchievements = []
    if (leveledUp) {
      // Award level achievement if it exists
      const levelAchievement = await prisma.achievement.findFirst({
        where: {
          category: 'XP_MILESTONE',
          name: `Level ${newLevel} Reached`
        }
      })

      if (levelAchievement) {
        const existingUserAchievement = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: levelAchievement.id
            }
          }
        })

        if (!existingUserAchievement) {
          const userAchievement = await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: levelAchievement.id
            },
            include: {
              achievement: true
            }
          })
          newAchievements.push(userAchievement)
        }
      }
    }

    return NextResponse.json({
      success: true,
      xpAwarded: amount,
      reason,
      progress: updatedProgress,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      newAchievements
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Award XP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})