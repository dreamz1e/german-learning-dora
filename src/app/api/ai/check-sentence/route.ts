import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { checkSentenceRealtime } from "@/lib/aiClient";

/**
 * Real-time sentence checking endpoint for guided writing
 * Provides immediate feedback on grammar and spelling as user types
 */

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { sentence, difficulty, context } = body;

      // Validation
      if (!sentence || typeof sentence !== "string") {
        return NextResponse.json(
          { error: "Sentence is required" },
          { status: 400 }
        );
      }

      // Trim the sentence
      const trimmedSentence = sentence.trim();

      // Skip empty or very short sentences (< 3 chars)
      if (trimmedSentence.length < 3) {
        return NextResponse.json({
          hasErrors: false,
          errors: [],
          overallFeedback: "",
        });
      }

      // Call AI to check the sentence
      const result = await checkSentenceRealtime(
        trimmedSentence,
        difficulty || "intermediate",
        context
      );

      return NextResponse.json(result);
    } catch (error) {
      console.error("Sentence check error:", error);
      return NextResponse.json(
        { error: "Failed to check sentence" },
        { status: 500 }
      );
    }
  }
);
