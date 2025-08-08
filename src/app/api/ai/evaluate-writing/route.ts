import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { evaluateWriting } from "@/lib/aiClient";

const evaluateWritingSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters long"),
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  originalPrompt: z.string().optional(),
  topic: z.string().optional(),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { text, difficulty, originalPrompt, topic } =
        evaluateWritingSchema.parse(body);

      // Validate text length (minimum meaningful content)
      const wordCount = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      if (wordCount < 5) {
        return NextResponse.json(
          { error: "Text must contain at least 5 words for evaluation" },
          { status: 400 }
        );
      }

      const evaluation = await evaluateWriting(
        text,
        difficulty,
        originalPrompt,
        userId
      );

      const submission = await prisma.writingSubmission.create({
        data: {
          userId,
          difficulty: difficulty as any,
          topic: topic ?? null,
          promptText: originalPrompt ?? "",
          userText: text,
          wordCount,
          evaluation: evaluation as any,
        },
        select: { id: true },
      });

      return NextResponse.json({
        success: true,
        evaluation,
        submissionId: submission.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }

      console.error("Evaluate writing error:", error);
      return NextResponse.json(
        { error: "Failed to evaluate writing. Please try again." },
        { status: 500 }
      );
    }
  }
);
