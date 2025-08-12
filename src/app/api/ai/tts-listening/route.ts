import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { synthesizeListeningAudio } from "@/lib/aiClient";

const schema = z.object({ transcript: z.string().min(3).max(500) });

export const POST = withAuth(async (request: NextRequest) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }
    const body = await request.json();
    const { transcript } = schema.parse(body);

    const audioBytes = await synthesizeListeningAudio(transcript);

    return new NextResponse(Buffer.from(audioBytes), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("TTS listening error:", error);
    return NextResponse.json(
      { error: "Failed to synthesize audio" },
      { status: 500 }
    );
  }
});
