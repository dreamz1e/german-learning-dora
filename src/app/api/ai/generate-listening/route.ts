import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { generateListeningExercise } from "@/lib/aiClient";

const generateListeningSchema = z.object({
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  topic: z.string().optional(),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { difficulty, topic } = generateListeningSchema.parse(body);

      const exercise = await generateListeningExercise(
        difficulty,
        topic,
        userId
      );

      return NextResponse.json({ success: true, exercise });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }

      console.error("Generate listening exercise error:", error);
      return NextResponse.json(
        { error: "Failed to generate listening exercise. Please try again." },
        { status: 500 }
      );
    }
  }
);
