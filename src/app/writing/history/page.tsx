"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SubmissionListItem {
  id: string;
  createdAt: string;
  difficulty: string;
  topic: string | null;
  promptText: string;
  userText: string;
  wordCount: number;
  evaluation: {
    overallScore?: number;
  };
}

export default function WritingHistoryPage() {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/writing/submissions", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load submissions");
        const data = await res.json();
        if (!isMounted) return;
        setSubmissions(data.submissions ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Writing History</h1>
          <p className="text-muted-foreground">
            Review your past writing tasks and AI evaluations
          </p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground text-sm">
            No submissions yet. Complete a writing task to see it here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">
                    {s.topic || "Untitled Topic"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {s.difficulty.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary">{formatDate(s.createdAt)}</Badge>
                    <Badge variant="info">{s.wordCount} words</Badge>
                    {typeof s?.evaluation?.overallScore === "number" && (
                      <Badge variant="success">
                        Score {s.evaluation.overallScore}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">Prompt</div>
                  <div className="bg-secondary p-3 rounded whitespace-pre-wrap max-h-28 overflow-hidden">
                    {s.promptText}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">Your Writing</div>
                  <div className="bg-card border p-3 rounded whitespace-pre-wrap max-h-40 overflow-hidden">
                    {s.userText}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/writing/submissions/${s.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
