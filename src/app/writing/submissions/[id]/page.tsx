"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface EvaluationError {
  start: number;
  end: number;
  originalText: string;
  correctedText: string;
  errorType: string;
  severity: "minor" | "moderate" | "major";
  explanation: string;
  suggestion: string;
}

interface SubmissionDetail {
  id: string;
  createdAt: string;
  difficulty: string;
  topic: string | null;
  promptText: string;
  userText: string;
  wordCount: number;
  evaluation: {
    overallScore: number;
    grammarScore: number;
    vocabularyScore: number;
    structureScore: number;
    correctedText: string;
    errors: EvaluationError[];
    positiveAspects?: string[];
    improvementSuggestions?: string[];
  };
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/writing/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load submission");
        const data = await res.json();
        if (!isMounted) return;
        setSubmission(data.submission);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  if (loading)
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!submission)
    return <div className="text-sm text-muted-foreground">Not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Writing Submission</h1>
          <div className="text-sm text-muted-foreground">
            {formatDate(submission.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {submission.difficulty.replace("_", " ")}
          </Badge>
          <Badge variant="secondary">{submission.wordCount} words</Badge>
          <Badge variant="success">
            Score {submission.evaluation.overallScore}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary p-4 rounded whitespace-pre-wrap">
            {submission.promptText}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Writing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-card border p-4 rounded whitespace-pre-wrap">
            {submission.userText}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evaluation Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Overall</div>
            <div className="text-xl font-bold">
              {submission.evaluation.overallScore}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Grammar</div>
            <div className="text-xl font-bold">
              {submission.evaluation.grammarScore}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Vocabulary</div>
            <div className="text-xl font-bold">
              {submission.evaluation.vocabularyScore}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Structure</div>
            <div className="text-xl font-bold">
              {submission.evaluation.structureScore}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Corrected Version</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 p-4 rounded whitespace-pre-wrap">
            {submission.evaluation.correctedText}
          </div>
        </CardContent>
      </Card>

      {submission.evaluation.errors?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Errors ({submission.evaluation.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submission.evaluation.errors.map((err, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Badge className="capitalize" variant="outline">
                    {err.errorType}
                  </Badge>
                  <Badge
                    variant={
                      err.severity === "major"
                        ? "destructive"
                        : err.severity === "moderate"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {err.severity}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Your text</div>
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      {err.originalText}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Corrected</div>
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      {err.correctedText}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-muted-foreground">Explanation</div>
                  <div>{err.explanation}</div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-muted-foreground">Suggestion</div>
                  <div>{err.suggestion}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/writing/history")}
        >
          Back to History
        </Button>
      </div>
    </div>
  );
}
