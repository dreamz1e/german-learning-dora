import prisma from './db'

export const defaultAchievements = [
  // Streak Achievements
  {
    name: "First Steps",
    description: "Complete your first day of learning",
    category: "STREAK" as const,
    icon: "🚀",
    xpReward: 10,
    condition: { streakDays: 1 }
  },
  {
    name: "Getting Started",
    description: "Maintain a 3-day learning streak",
    category: "STREAK" as const,
    icon: "🔥",
    xpReward: 25,
    condition: { streakDays: 3 }
  },
  {
    name: "Consistent Learner",
    description: "Maintain a 7-day learning streak",
    category: "STREAK" as const,
    icon: "💪",
    xpReward: 50,
    condition: { streakDays: 7 }
  },
  {
    name: "Dedicated Student",
    description: "Maintain a 14-day learning streak",
    category: "STREAK" as const,
    icon: "🎯",
    xpReward: 100,
    condition: { streakDays: 14 }
  },
  {
    name: "Learning Machine",
    description: "Maintain a 30-day learning streak",
    category: "STREAK" as const,
    icon: "🤖",
    xpReward: 200,
    condition: { streakDays: 30 }
  },

  // XP Milestones
  {
    name: "Level 2 Reached",
    description: "Reach Level 2 in your German learning journey",
    category: "XP_MILESTONE" as const,
    icon: "⭐",
    xpReward: 20,
    condition: { level: 2 }
  },
  {
    name: "Level 3 Reached",
    description: "Reach Level 3 in your German learning journey",
    category: "XP_MILESTONE" as const,
    icon: "⭐⭐",
    xpReward: 30,
    condition: { level: 3 }
  },
  {
    name: "Level 5 Reached",
    description: "Reach Level 5 in your German learning journey",
    category: "XP_MILESTONE" as const,
    icon: "🌟",
    xpReward: 50,
    condition: { level: 5 }
  },
  {
    name: "Level 10 Reached",
    description: "Reach Level 10 in your German learning journey",
    category: "XP_MILESTONE" as const,
    icon: "💎",
    xpReward: 100,
    condition: { level: 10 }
  },

  // Exercise Count Achievements
  {
    name: "First Exercise",
    description: "Complete your first exercise",
    category: "EXERCISE_COUNT" as const,
    icon: "📝",
    xpReward: 10,
    condition: { exerciseCount: 1 }
  },
  {
    name: "Practice Makes Perfect",
    description: "Complete 10 exercises",
    category: "EXERCISE_COUNT" as const,
    icon: "🎓",
    xpReward: 50,
    condition: { exerciseCount: 10 }
  },
  {
    name: "Exercise Enthusiast",
    description: "Complete 25 exercises",
    category: "EXERCISE_COUNT" as const,
    icon: "🏃",
    xpReward: 100,
    condition: { exerciseCount: 25 }
  },
  {
    name: "Exercise Master",
    description: "Complete 50 exercises",
    category: "EXERCISE_COUNT" as const,
    icon: "👑",
    xpReward: 200,
    condition: { exerciseCount: 50 }
  },

  // Perfect Score Achievements
  {
    name: "Perfect Start",
    description: "Get 100% on your first exercise",
    category: "PERFECT_SCORE" as const,
    icon: "💯",
    xpReward: 25,
    condition: { perfectScores: 1 }
  },
  {
    name: "Accuracy Expert",
    description: "Get 100% on 5 exercises",
    category: "PERFECT_SCORE" as const,
    icon: "🎯",
    xpReward: 75,
    condition: { perfectScores: 5 }
  },
  {
    name: "Perfectionist",
    description: "Get 100% on 10 exercises",
    category: "PERFECT_SCORE" as const,
    icon: "🏆",
    xpReward: 150,
    condition: { perfectScores: 10 }
  },

  // Daily Challenge Achievements
  {
    name: "Challenge Accepted",
    description: "Complete your first daily challenge",
    category: "DAILY_CHALLENGE" as const,
    icon: "✅",
    xpReward: 30,
    condition: { dailyChallenges: 1 }
  },
  {
    name: "Challenge Champion",
    description: "Complete 5 daily challenges",
    category: "DAILY_CHALLENGE" as const,
    icon: "🏅",
    xpReward: 100,
    condition: { dailyChallenges: 5 }
  },
  {
    name: "Challenge Legend",
    description: "Complete 10 daily challenges",
    category: "DAILY_CHALLENGE" as const,
    icon: "👑",
    xpReward: 200,
    condition: { dailyChallenges: 10 }
  },

  // Special Achievements
  {
    name: "Welcome to Dora",
    description: "Welcome to your German learning journey!",
    category: "SPECIAL" as const,
    icon: "🎉",
    xpReward: 5,
    condition: { special: "welcome" }
  },
  {
    name: "Grammar Guru",
    description: "Complete 10 grammar exercises with perfect scores",
    category: "SPECIAL" as const,
    icon: "📚",
    xpReward: 150,
    condition: { grammarPerfect: 10 }
  },
  {
    name: "Vocabulary Virtuoso",
    description: "Learn 100 new German words",
    category: "SPECIAL" as const,
    icon: "🧠",
    xpReward: 200,
    condition: { wordsLearned: 100 }
  }
]

export async function seedAchievements() {
  console.log('Seeding achievements...')
  
  for (const achievement of defaultAchievements) {
    try {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement
      })
      console.log(`✓ Created/updated achievement: ${achievement.name}`)
    } catch (error) {
      console.error(`Failed to create achievement ${achievement.name}:`, error)
    }
  }
  
  console.log('✅ Achievements seeding completed!')
}

// Function to award welcome achievement to new users
export async function awardWelcomeAchievement(userId: string) {
  try {
    const welcomeAchievement = await prisma.achievement.findFirst({
      where: { name: "Welcome to Dora" }
    })

    if (welcomeAchievement) {
      const existingUserAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: welcomeAchievement.id
          }
        }
      })

      if (!existingUserAchievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: welcomeAchievement.id
          }
        })

        // Award welcome XP
        await prisma.userProgress.update({
          where: { userId },
          data: {
            totalXP: { increment: welcomeAchievement.xpReward },
            weeklyXP: { increment: welcomeAchievement.xpReward }
          }
        })

        return welcomeAchievement
      }
    }
  } catch (error) {
    console.error('Failed to award welcome achievement:', error)
  }
  return null
}