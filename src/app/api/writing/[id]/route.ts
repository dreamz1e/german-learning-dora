import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import prisma from "@/lib/db";

export const GET = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Promise<{ id: string }> },
    userId: string
  ) => {
    try {
      const { id } = await ctx.params;
      const submission = await (prisma as any).writingSubmission.findFirst({
        where: { id, userId },
        select: {
          id: true,
          createdAt: true,
          difficulty: true,
          topic: true,
          promptText: true,
          userText: true,
          wordCount: true,
          evaluation: true,
        },
      });

      if (!submission) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ submission });
    } catch (error) {
      console.error("Get writing submission error:", error);
      return NextResponse.json(
        { error: "Failed to fetch submission" },
        { status: 500 }
      );
    }
  }
);
