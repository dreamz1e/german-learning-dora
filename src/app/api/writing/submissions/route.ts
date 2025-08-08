import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import prisma from "@/lib/db";

export const GET = withAuth(
  async (_req: NextRequest, _params: any, userId: string) => {
    try {
      const submissions = await prisma.writingSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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

      return NextResponse.json({ submissions });
    } catch (error) {
      console.error("List writing submissions error:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }
  }
);
