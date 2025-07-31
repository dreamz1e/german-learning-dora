import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import {
  generateBatchVocabularyExercises,
  generateBatchGrammarExercises,
  getCurrentBatchInfo,
} from "@/lib/aiClient";

const generateBatchSchema = z.object({
  type: z.enum(["vocabulary", "grammar"]),
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  topic: z.string().optional(),
  grammarTopic: z.string().optional(),
});

const getBatchInfoSchema = z.object({
  type: z.enum(["vocabulary", "grammar"]),
});

// Generate a new batch of exercises
export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { type, difficulty, topic, grammarTopic } =
        generateBatchSchema.parse(body);

      let batch;

      switch (type) {
        case "vocabulary":
          batch = await generateBatchVocabularyExercises(
            difficulty,
            userId,
            topic
          );
          break;
        case "grammar":
          batch = await generateBatchGrammarExercises(
            difficulty,
            userId,
            grammarTopic
          );
          break;
        default:
          return NextResponse.json(
            { error: "Invalid exercise type" },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        batch,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }

      console.error("Generate batch error:", error);
      return NextResponse.json(
        { error: "Failed to generate batch. Please try again." },
        { status: 500 }
      );
    }
  }
);

// Get current batch information
export const GET = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get("type");

      if (!type || !["vocabulary", "grammar"].includes(type)) {
        return NextResponse.json(
          { error: "Valid type parameter required (vocabulary or grammar)" },
          { status: 400 }
        );
      }

      const batchInfo = getCurrentBatchInfo(
        type as "vocabulary" | "grammar",
        userId
      );

      return NextResponse.json({
        success: true,
        batchInfo,
      });
    } catch (error) {
      console.error("Get batch info error:", error);
      return NextResponse.json(
        { error: "Failed to get batch information." },
        { status: 500 }
      );
    }
  }
);
