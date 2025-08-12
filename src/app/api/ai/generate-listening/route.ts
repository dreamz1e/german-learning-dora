import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { generateListeningExercise } from "@/lib/aiClient";

const sanitizedTopic = z
  .string()
  .trim()
  .max(50)
  .regex(/^[\p{L}\p{N}\s\-&']*$/u, "Invalid characters in topic");

const generateListeningSchema = z.object({
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  topic: sanitizedTopic.optional().nullable(),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { difficulty, topic } = generateListeningSchema.parse(body);
      const safeTopic = topic && topic.length > 0 ? topic : undefined;

      const exercise = await generateListeningExercise(
        difficulty,
        safeTopic,
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
