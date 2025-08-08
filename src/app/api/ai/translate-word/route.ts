import OpenAI from "openai";
import { NextResponse } from "next/server";

// Simple translation endpoint for single-word lookups using Gemini Flash Lite via OpenRouter
export async function POST(request: Request) {
  try {
    const { word, sentence } = await request.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { error: "Missing 'word' in request body" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const modelId =
      process.env.TRANSLATION_MODEL || "google/gemini-2.5-flash-lite";

    const prompt =
      `Translate the following German token to English. Reply with ONLY the translation, no quotes or extra text. If it is a proper noun, return the same token. If ambiguous, choose the most common everyday meaning.

Token: ${word}
${sentence ? `Context: ${sentence}` : ""}`.trim();

    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 50,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "No translation returned from model" },
        { status: 502 }
      );
    }

    // Sanitize to a single short line
    const firstLine = content.split(/\r?\n/)[0].replace(/^"|"$/g, "").trim();

    return NextResponse.json({ translation: firstLine });
  } catch (error: any) {
    console.error("/api/ai/translate-word error:", error);
    return NextResponse.json(
      { error: "Failed to translate word" },
      { status: 500 }
    );
  }
}
