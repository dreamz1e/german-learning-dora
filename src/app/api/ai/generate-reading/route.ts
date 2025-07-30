import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/lib/auth'
import { generateReadingExercise } from '@/lib/aiClient'

const generateReadingSchema = z.object({
  difficulty: z.enum(['A2_BASIC', 'A2_INTERMEDIATE', 'B1_BASIC', 'B1_INTERMEDIATE', 'B1_ADVANCED']),
  topic: z.string().optional()
})

export const POST = withAuth(async (request: NextRequest, params: any, userId: string) => {
  try {
    const body = await request.json()
    const { difficulty, topic } = generateReadingSchema.parse(body)

    const exercise = await generateReadingExercise(difficulty, topic)

    return NextResponse.json({
      success: true,
      exercise
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Generate reading exercise error:', error)
    return NextResponse.json(
      { error: 'Failed to generate reading exercise. Please try again.' },
      { status: 500 }
    )
  }
})