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

type AlignmentOp =
  | { type: "match"; expected: string; actual: string }
  | { type: "substitution"; expected: string; actual: string }
  | { type: "omission"; expected: string; actual: string }
  | { type: "insertion"; expected: string; actual: string };

function alignTokens(refTokens: string[], userTokens: string[]): AlignmentOp[] {
  const m = refTokens.length;
  const n = userTokens.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = refTokens[i - 1] === userTokens[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion (omission)
        dp[i][j - 1] + 1, // insertion (extra)
        dp[i - 1][j - 1] + cost // match/substitution
      );
    }
  }

  const ops: AlignmentOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    // Match
    if (
      i > 0 &&
      j > 0 &&
      dp[i][j] === dp[i - 1][j - 1] &&
      refTokens[i - 1] === userTokens[j - 1]
    ) {
      ops.push({
        type: "match",
        expected: refTokens[i - 1],
        actual: userTokens[j - 1],
      });
      i--;
      j--;
      continue;
    }

    // Substitution
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({
        type: "substitution",
        expected: refTokens[i - 1],
        actual: userTokens[j - 1],
      });
      i--;
      j--;
      continue;
    }

    // Deletion (omission)
    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ type: "omission", expected: refTokens[i - 1], actual: "" });
      i--;
      continue;
    }

    // Insertion (extra)
    if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      ops.push({ type: "insertion", expected: "", actual: userTokens[j - 1] });
      j--;
      continue;
    }

    // Fallback decisions if equal costs (should be rare)
    if (i > 0 && j > 0) {
      const isSame = refTokens[i - 1] === userTokens[j - 1];
      ops.push({
        type: isSame ? "match" : "substitution",
        expected: refTokens[i - 1],
        actual: userTokens[j - 1],
      });
      i--;
      j--;
    } else if (i > 0) {
      ops.push({ type: "omission", expected: refTokens[i - 1], actual: "" });
      i--;
    } else if (j > 0) {
      ops.push({ type: "insertion", expected: "", actual: userTokens[j - 1] });
      j--;
    }
  }

  return ops.reverse();
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

  const ops = alignTokens(refTokens, userTokens);
  const substitutions = ops.filter((o) => o.type === "substitution").length;
  const omissions = ops.filter((o) => o.type === "omission").length;
  const insertions = ops.filter((o) => o.type === "insertion").length;

  let wordErrorRate = 1.0;
  if (refTokens.length === 0) {
    wordErrorRate = userTokens.length === 0 ? 0 : 1;
  } else {
    wordErrorRate = Math.min(
      1,
      Math.max(0, (substitutions + omissions + insertions) / refTokens.length)
    );
  }

  const similarity = Math.round((1 - wordErrorRate) * 100);
  const score = similarity;

  const errors = ops
    .filter((o) => o.type !== "match")
    .slice(0, 20)
    .map((o) => {
      if (o.type === "substitution") {
        return {
          type: "substitution",
          expected: o.expected,
          actual: o.actual,
          explanation: `Expected "${o.expected}", but heard "${o.actual}"`,
        };
      }
      if (o.type === "omission") {
        return {
          type: "omission",
          expected: o.expected,
          actual: "",
          explanation: `Missing word "${o.expected}"`,
        };
      }
      // insertion
      return {
        type: "insertion",
        expected: "",
        actual: (o as any).actual,
        explanation: `Extra word "${(o as any).actual}"`,
      };
    });

  const feedback = exactMatch
    ? "Perfect match!"
    : `You had ${substitutions} substitutions, ${omissions} missing, and ${insertions} extra ${
        insertions === 1 ? "word" : "words"
      }.`;

  return {
    score,
    similarity,
    wordErrorRate,
    exactMatch,
    correctedText: referenceTranscript.trim(),
    feedback,
    errors,
    difficulty: difficulty as any,
  };
}
