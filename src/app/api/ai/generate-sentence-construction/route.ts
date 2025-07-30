import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { generateSentenceConstructionExercise } from "@/lib/aiClient";

const generateSentenceSchema = z.object({
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  grammarFocus: z.string().optional(),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { difficulty, grammarFocus } = generateSentenceSchema.parse(body);

      const exercise = await generateSentenceConstructionExercise(
        difficulty,
        grammarFocus
      );

      return NextResponse.json({
        success: true,
        exercise,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }

      console.error("Generate sentence construction error:", error);
      return NextResponse.json(
        {
          error:
            "Failed to generate sentence construction exercise. Please try again.",
        },
        { status: 500 }
      );
    }
  }
);
