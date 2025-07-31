import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { generateWritingExercise } from "@/lib/aiClient";

const generateWritingSchema = z.object({
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  topic: z.string().optional(),
  exerciseType: z
    .enum(["guided", "creative", "formal", "descriptive"])
    .default("guided"),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { difficulty, topic, exerciseType } =
        generateWritingSchema.parse(body);

      const exercise = await generateWritingExercise(
        difficulty,
        topic,
        exerciseType,
        userId
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

      console.error("Generate writing exercise error:", error);
      return NextResponse.json(
        { error: "Failed to generate writing exercise. Please try again." },
        { status: 500 }
      );
    }
  }
);
