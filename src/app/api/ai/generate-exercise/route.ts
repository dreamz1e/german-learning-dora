import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import {
  generateVocabularyExercise,
  generateGrammarExercise,
  generateTranslationExercise,
  getNextExercise,
  getCurrentBatchInfo,
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
  vocabularyDirection: z
    .enum(["german-to-english", "english-to-german"])
    .default("german-to-english"),
  translationDirection: z
    .enum(["german-to-english", "english-to-german"])
    .optional(),
  useBatchSystem: z.boolean().default(true), // Enable batch system by default
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const {
        type,
        difficulty,
        topic,
        grammarTopic,
        vocabularyDirection,
        translationDirection,
        useBatchSystem,
      } = generateExerciseSchema.parse(body);

      let exercise;
      let batchInfo = null;

      switch (type) {
        case "vocabulary":
          if (useBatchSystem) {
            exercise = await getNextExercise(
              "vocabulary",
              userId,
              difficulty,
              topic,
              vocabularyDirection
            );
            batchInfo = getCurrentBatchInfo("vocabulary", userId);
          } else {
            exercise = await generateVocabularyExercise(
              difficulty,
              topic,
              userId,
              vocabularyDirection
            );
          }
          break;
        case "grammar":
          if (useBatchSystem) {
            exercise = await getNextExercise(
              "grammar",
              userId,
              difficulty,
              grammarTopic
            );
            batchInfo = getCurrentBatchInfo("grammar", userId);
          } else {
            exercise = await generateGrammarExercise(
              difficulty,
              grammarTopic,
              userId
            );
          }
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

      const response: any = {
        success: true,
        exercise,
      };

      // Include batch information for batch-generated exercises
      if (batchInfo) {
        response.batchInfo = batchInfo;
      }

      return NextResponse.json(response);
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
