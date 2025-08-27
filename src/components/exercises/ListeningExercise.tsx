"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  ListeningExercise as ListeningExerciseType,
  ListeningEvaluation,
} from "@/types/exerciseTypes";

interface Props {
  exercise: ListeningExerciseType;
  onComplete: (score: number, timeSpent: number) => void;
}

export default function ListeningExercise({ exercise, onComplete }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [evaluation, setEvaluation] = useState<ListeningEvaluation | null>(
    null
  );
  const [evaluatedTimeSpent, setEvaluatedTimeSpent] = useState<number | null>(
    null
  );
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      setIsLoadingAudio(true);
      try {
        const response = await fetch("/api/ai/tts-listening", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: exercise.transcript }),
        });
        if (!response.ok) throw new Error("TTS failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Prepare waveform
        const arrayBuf = await blob.arrayBuffer();
        const ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
        setAudioCtx(ctx);
        setAudioBuffer(decoded);
        setDuration(decoded.duration);
        // Ensure <audio> sets duration too
        setTimeout(() => {
          if (audioRef.current && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }, 0);
      } catch (e) {
        console.error(e);
        addToast({
          type: "error",
          title: "Audio Error",
          message: "Could not load audio. Please try again.",
          duration: 4000,
        });
      } finally {
        setIsLoadingAudio(false);
      }
    };
    fetchAudio();
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [exercise.transcript]);

  // Draw static waveform once and size canvases
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;
    const canvas = canvasRef.current;
    // Fit to container size
    canvas.width = canvas.clientWidth;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const primary =
      getComputedStyle(canvas).getPropertyValue("--primary").trim() ||
      "#6366f1";
    ctx.fillStyle = primary;
    const channelData = audioBuffer.getChannelData(0);
    const sampleStep = Math.max(1, Math.floor(channelData.length / width));
    for (let x = 0; x < width; x++) {
      const start = x * sampleStep;
      let min = 1.0;
      let max = -1.0;
      for (let i = 0; i < sampleStep; i++) {
        const v = channelData[start + i] || 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const yMax = ((1 - max) * height) / 2;
      const yMin = ((1 - min) * height) / 2;
      ctx.fillRect(x, yMax, 1, Math.max(1, yMin - yMax));
    }

    if (progressCanvasRef.current) {
      progressCanvasRef.current.width = canvas.width;
      progressCanvasRef.current.height = canvas.height;
      const pctx = progressCanvasRef.current.getContext("2d");
      if (pctx) pctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [audioBuffer]);

  const drawProgress = () => {
    const pCanvas = progressCanvasRef.current;
    const audioEl = audioRef.current;
    if (!pCanvas || !audioEl) return;
    const pctx = pCanvas.getContext("2d");
    if (!pctx) return;
    const width = pCanvas.width;
    const height = pCanvas.height;
    pctx.clearRect(0, 0, width, height);
    const d = duration || audioEl.duration || 0;
    const t = Math.min(d, Math.max(0, audioEl.currentTime || 0));
    const ratio = d > 0 ? t / d : 0;
    const x = Math.round(ratio * width);
    // Completed fill
    pctx.fillStyle = "rgba(99,102,241,0.15)";
    pctx.fillRect(0, 0, x, height);
    // Playhead
    pctx.strokeStyle = "rgba(99,102,241,0.9)";
    pctx.lineWidth = 2;
    pctx.beginPath();
    pctx.moveTo(x + 0.5, 0);
    pctx.lineTo(x + 0.5, height);
    pctx.stroke();
  };

  const tick = () => {
    drawProgress();
    setCurrentTime(audioRef.current?.currentTime || 0);
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      drawProgress();
    };
    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime || 0);
      drawProgress();
    };
    const onLoaded = () => {
      setDuration(!isNaN(el.duration) ? el.duration : duration);
      drawProgress();
    };
    const onEnded = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      drawProgress();
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  const handleCanvasSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !audioBuffer || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    const duration = audioRef.current.duration || audioBuffer.duration;
    audioRef.current.currentTime = ratio * duration;
    setIsSeeking(false);
    audioRef.current.play();
    drawProgress();
  };

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      addToast({
        type: "warning",
        title: "Enter your transcription",
        message: "Please write what you heard.",
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ai/evaluate-listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTranscript: answer,
          referenceTranscript: exercise.transcript,
          difficulty: exercise.difficulty,
        }),
      });
      if (!response.ok) throw new Error("Evaluation failed");
      const data = await response.json();
      const score = data.evaluation?.score ?? 0;
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      setEvaluation(data.evaluation as ListeningEvaluation);
      setEvaluatedTimeSpent(timeSpent);
      addToast({
        type: "success",
        title: "Evaluated",
        message: `Score: ${score}/100`,
        duration: 4000,
      });
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        title: "Evaluation Error",
        message: "Could not evaluate your answer.",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Listening Practice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Topic: {exercise.topic} • Difficulty:{" "}
          {exercise.difficulty.replace("_", " ")}
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => audioRef.current?.play()}
            disabled={!audioUrl || isLoadingAudio}
          >
            {isLoadingAudio ? "Loading audio..." : "Play"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const el = audioRef.current;
              if (!el) return;
              el.currentTime = 0;
              el.play();
            }}
            disabled={!audioUrl || isLoadingAudio}
          >
            Repeat
          </Button>
          {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
        </div>
        {/* Waveform with click-to-seek */}
        <div className="rounded-md ring-1 ring-border p-2 bg-card">
          <div className="relative w-full" style={{ height: 120 }}>
            <canvas ref={canvasRef} className="w-full h-full block" />
            <canvas
              ref={progressCanvasRef}
              className="w-full h-full block absolute inset-0 cursor-pointer"
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={handleCanvasSeek}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>Click waveform to seek</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Hint: {exercise.hint}
        </div>
        {!evaluation ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type what you heard (German)
              </label>
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Ich höre ..."
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleEvaluate} disabled={isSubmitting}>
                {isSubmitting ? "Evaluating..." : "Submit"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-md border p-3 bg-card/60 space-y-2">
              <div className="text-sm font-medium">
                Result: {evaluation.score}/100 • Similarity{" "}
                {evaluation.similarity}%
              </div>
              <div className="text-xs text-muted-foreground">
                {evaluation.feedback}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Correct answer</div>
                <div className="text-sm bg-muted/50 rounded p-2">
                  {evaluation.correctedText}
                </div>
              </div>
              {evaluation.errors && evaluation.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Your mistakes</div>
                  <ul className="list-disc pl-5 text-sm">
                    {evaluation.errors.map((err: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        <span className="uppercase text-xs tracking-wide mr-2 text-muted-foreground">
                          {err.type}
                        </span>
                        {err.expected && (
                          <span>
                            Expected:{" "}
                            <span className="font-medium">{err.expected}</span>{" "}
                          </span>
                        )}
                        {err.actual && (
                          <span>
                            Got:{" "}
                            <span className="font-medium">{err.actual}</span>{" "}
                          </span>
                        )}
                        {err.explanation && (
                          <span className="text-muted-foreground">
                            – {err.explanation}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  const s = evaluation?.score ?? 0;
                  const t =
                    evaluatedTimeSpent ??
                    Math.round((Date.now() - startTime) / 1000);
                  onComplete(s, t);
                }}
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
