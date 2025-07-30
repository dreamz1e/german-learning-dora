import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/lib/auth'
import { generateVocabularyWords } from '@/lib/aiClient'

const generateVocabularySchema = z.object({
  count: z.number().min(1).max(10).default(5),
  difficulty: z.enum(['A2_BASIC', 'A2_INTERMEDIATE', 'B1_BASIC', 'B1_INTERMEDIATE', 'B1_ADVANCED']),
  category: z.string().optional()
})

export const POST = withAuth(async (request: NextRequest, params: any, userId: string) => {
  try {
    const body = await request.json()
    const { count, difficulty, category } = generateVocabularySchema.parse(body)

    const words = await generateVocabularyWords(count, difficulty, category)

    return NextResponse.json({
      success: true,
      words
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Generate vocabulary error:', error)
    return NextResponse.json(
      { error: 'Failed to generate vocabulary. Please try again.' },
      { status: 500 }
    )
  }
})