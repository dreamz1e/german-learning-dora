import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

const completionSchema = z.object({
  taskId: z.string(),
  taskType: z.string(),
  isCorrect: z.boolean(),
  timeSpent: z.number(),
  xpEarned: z.number(),
});

const getCompletionsSchema = z.object({
  date: z.string().optional(),
});

// GET - Get user's daily challenge completions for a specific date
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get("date");

    // Default to today if no date provided
    const targetDate = dateString ? new Date(dateString) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const completions = await prisma.userDailyChallengeCompletion.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        completedAt: "asc",
      },
    });

    return NextResponse.json({
      completions: completions.map((completion) => ({
        taskId: completion.taskId,
        taskType: completion.taskType,
        isCorrect: completion.isCorrect,
        timeSpent: completion.timeSpent,
        xpEarned: completion.xpEarned,
        completedAt: completion.completedAt,
      })),
    });
  } catch (error) {
    console.error("Get completions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Record a daily challenge completion
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, taskType, isCorrect, timeSpent, xpEarned } =
      completionSchema.parse(body);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if this task was already completed today
    const existingCompletion =
      await prisma.userDailyChallengeCompletion.findUnique({
        where: {
          userId_date_taskId: {
            userId,
            date: today,
            taskId,
          },
        },
      });

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Task already completed today" },
        { status: 400 }
      );
    }

    // Create the completion record
    const completion = await prisma.userDailyChallengeCompletion.create({
      data: {
        userId,
        date: today,
        taskId,
        taskType,
        isCorrect,
        timeSpent,
        xpEarned,
      },
    });

    return NextResponse.json({
      success: true,
      completion: {
        taskId: completion.taskId,
        taskType: completion.taskType,
        isCorrect: completion.isCorrect,
        timeSpent: completion.timeSpent,
        xpEarned: completion.xpEarned,
        completedAt: completion.completedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
