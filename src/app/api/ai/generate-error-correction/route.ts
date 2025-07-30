import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { generateErrorCorrectionExercise } from "@/lib/aiClient";

const generateErrorCorrectionSchema = z.object({
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  errorType: z.enum(["grammar", "vocabulary", "mixed"]).default("mixed"),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { difficulty, errorType } =
        generateErrorCorrectionSchema.parse(body);

      const exercise = await generateErrorCorrectionExercise(
        difficulty,
        errorType,
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

      console.error("Generate error correction error:", error);
      return NextResponse.json(
        {
          error:
            "Failed to generate error correction exercise. Please try again.",
        },
        { status: 500 }
      );
    }
  }
);
