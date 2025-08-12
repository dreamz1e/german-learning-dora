import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";

const schema = z.object({
  userTranscript: z.string().min(1),
  referenceTranscript: z.string().min(1),
  difficulty: z.enum([
    "A2_BASIC",
    "A2_INTERMEDIATE",
    "B1_BASIC",
    "B1_INTERMEDIATE",
    "B1_ADVANCED",
  ]),
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userTranscript, referenceTranscript, difficulty } =
      schema.parse(body);
    const evaluation = simpleEvaluateListening(
      userTranscript,
      referenceTranscript,
      difficulty
    );
    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Evaluate listening error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate listening exercise" },
      { status: 500 }
    );
  }
});

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFC")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const norm = normalizeForComparison(text);
  return norm.length ? norm.split(" ") : [];
}

function wordEditDistance(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function simpleEvaluateListening(
  userTranscript: string,
  referenceTranscript: string,
  difficulty: string
) {
  const refTokens = tokenize(referenceTranscript);
  const userTokens = tokenize(userTranscript);
  const refNorm = normalizeForComparison(referenceTranscript);
  const userNorm = normalizeForComparison(userTranscript);

  const exactMatch = userNorm === refNorm && refNorm.length > 0;

  let wordErrorRate = 1.0;
  if (refTokens.length === 0) {
    wordErrorRate = userTokens.length === 0 ? 0 : 1;
  } else {
    const distance = wordEditDistance(refTokens, userTokens);
    wordErrorRate = Math.min(1, Math.max(0, distance / refTokens.length));
  }

  const similarity = Math.round((1 - wordErrorRate) * 100);
  const score = similarity;

  return {
    score,
    similarity,
    wordErrorRate,
    exactMatch,
    correctedText: referenceTranscript.trim(),
    feedback: exactMatch
      ? "Perfect match!"
      : "Compare your transcription to the reference and focus on missing or extra words.",
    errors: [],
    difficulty: difficulty as any,
  };
}
