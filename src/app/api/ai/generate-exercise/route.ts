import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import {
  generateVocabularyExercise,
  generateGrammarExercise,
  generateTranslationExercise,
} from "@/lib/aiClient";

const generateExerciseSchema = z.object({
  type: z.enum(["vocabulary", "grammar", "translation"]),
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
  topic: z.string().optional(),
  grammarTopic: z.string().optional(),
  translationDirection: z
    .enum(["german-to-english", "english-to-german"])
    .optional(),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { type, difficulty, topic, grammarTopic, translationDirection } =
        generateExerciseSchema.parse(body);

      let exercise;

      switch (type) {
        case "vocabulary":
          exercise = await generateVocabularyExercise(
            difficulty,
            topic,
            userId
          );
          break;
        case "grammar":
          exercise = await generateGrammarExercise(
            difficulty,
            grammarTopic,
            userId
          );
          break;
        case "translation":
          exercise = await generateTranslationExercise(
            difficulty,
            translationDirection,
            userId
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
        exercise,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }

      console.error("Generate exercise error:", error);
      return NextResponse.json(
        { error: "Failed to generate exercise. Please try again." },
        { status: 500 }
      );
    }
  }
);
