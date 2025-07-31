import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { resetExerciseBatch } from "@/lib/aiClient";

const resetBatchSchema = z.object({
  type: z.enum(["vocabulary", "grammar"]),
});

export const POST = withAuth(
  async (request: NextRequest, params: any, userId: string) => {
    try {
      const body = await request.json();
      const { type } = resetBatchSchema.parse(body);

      resetExerciseBatch(type, userId);

      return NextResponse.json({
        success: true,
        message: `${type} batch reset successfully`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }

      console.error("Reset batch error:", error);
      return NextResponse.json(
        { error: "Failed to reset batch. Please try again." },
        { status: 500 }
      );
    }
  }
);
