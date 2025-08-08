"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { Progress } from "@/components/ui/Progress";

interface BilingualGuideline {
  de: string;
  en: string;
}
interface WritingPrompt {
  promptDe: string;
  promptEn: string;
  difficulty: string;
  topic: string;
  guidelines: BilingualGuideline[];
  minWords: number;
  maxWords: number;
}

interface WritingEvaluationError {
  start: number;
  end: number;
  originalText: string;
  correctedText: string;
  errorType: string;
  severity: "minor" | "moderate" | "major";
  explanation: string;
  suggestion: string;
}

interface WritingEvaluation {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  structureScore: number;
  correctedText: string;
  errors: WritingEvaluationError[];
  positiveAspects: string[];
  improvementSuggestions: string[];
  difficulty: string;
  wordCount: number;
}

interface WritingExerciseProps {
  prompt: WritingPrompt;
  onComplete: (
    wordCount: number,
    timeSpent: number,
    evaluationScore?: number
  ) => void;
  onNewPrompt: () => Promise<void> | void;
}

export function WritingExercise({
  prompt,
  onComplete,
  onNewPrompt,
}: WritingExerciseProps) {
  const [text, setText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const { addToast } = useToast();

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const isWithinSuggestedRange =
    wordCount >= prompt.minWords && wordCount <= prompt.maxWords;
  const meetsMinimum = wordCount >= 5 && text.trim().length >= 10; // align with API

  const handleSubmit = async () => {
    if (!meetsMinimum) {
      addToast({
        type: "warning",
        title: "Keep Going",
        message:
          "Try to write at least 5 words (10+ characters). The range is just a suggestion.",
        duration: 3000,
      });
      return;
    }

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    setIsSubmitted(true);
    // Trigger evaluation (or reuse existing) and pass score to onComplete
    let evalResult = evaluation;
    if (!evalResult) {
      evalResult = await handleEvaluate();
    } else {
      setShowEvaluation(true);
    }

    onComplete(wordCount, timeSpent, evalResult?.overallScore);

    addToast({
      type: "success",
      title: "Writing Submitted!",
      message: `Great work! You wrote ${wordCount} words.`,
      duration: 4000,
    });
  };

  const handleNewPrompt = async () => {
    if (isEvaluating || isLoadingNext) return; // prevent navigating while evaluating or already loading
    setText("");
    setIsSubmitted(false);
    try {
      setIsLoadingNext(true);
      await onNewPrompt();
    } finally {
      setIsLoadingNext(false);
    }
  };

  const getDifficultyText = (diff: string) => {
    return diff.replace("_", " ");
  };

  const getWordCountColor = () => {
    if (wordCount === 0) return "text-gray-600";
    if (!isWithinSuggestedRange) return "text-yellow-600"; // below/above suggestion
    return "text-green-600";
  };

  const handleEvaluate = async (): Promise<WritingEvaluation | null> => {
    if (!meetsMinimum) {
      addToast({
        type: "warning",
        title: "Not Enough Text",
        message:
          "Please write at least 5 words (10+ characters) before evaluation.",
        duration: 3000,
      });
      return null;
    }

    setIsEvaluating(true);
    try {
      const response = await fetch("/api/ai/evaluate-writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          difficulty: prompt.difficulty,
          originalPrompt: `DE: ${prompt.promptDe}\nEN: ${prompt.promptEn}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate writing");
      }

      const data = await response.json();
      setEvaluation(data.evaluation);
      setShowEvaluation(true);

      addToast({
        type: "success",
        title: "Evaluation Complete!",
        message: `Overall score: ${data.evaluation.overallScore}/100`,
        duration: 4000,
      });

      return data.evaluation as WritingEvaluation;
    } catch (error) {
      console.error("Evaluation error:", error);
      addToast({
        type: "error",
        title: "Evaluation Failed",
        message: "Unable to evaluate your writing. Please try again.",
        duration: 4000,
      });
      return null;
    } finally {
      setIsEvaluating(false);
    }
  };

  const highlightErrors = (text: string, errors: WritingEvaluationError[]) => {
    if (!errors || errors.length === 0) return text;

    // Sort errors by start position in descending order to avoid position shifts
    const sortedErrors = [...errors].sort((a, b) => b.start - a.start);
    let highlightedText = text;

    sortedErrors.forEach((error, index) => {
      const errorId = `error-${index}`;
      const severityClass = {
        minor: "bg-yellow-200 border-b-2 border-yellow-500 hover:bg-yellow-300",
        moderate:
          "bg-orange-200 border-b-2 border-orange-500 hover:bg-orange-300",
        major: "bg-red-200 border-b-2 border-red-500 hover:bg-red-300",
      }[error.severity];

      const beforeError = highlightedText.substring(0, error.start);
      const errorText = highlightedText.substring(error.start, error.end);
      const afterError = highlightedText.substring(error.end);

      highlightedText =
        beforeError +
        `<span class="${severityClass} cursor-pointer rounded px-1 py-0.5 transition-colors duration-200" title="${error.explanation} → ${error.correctedText}" data-error-id="${errorId}" onclick="document.getElementById('error-detail-${errorId}').scrollIntoView({behavior: 'smooth'})">${errorText}</span>` +
        afterError;
    });

    return highlightedText;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "moderate":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "major":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">German Writing Exercise</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="info">
                {getDifficultyText(prompt.difficulty)}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {prompt.topic}
              </Badge>
              <Badge variant="secondary">Writing Practice</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Writing Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Writing Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg space-y-1">
            <p className="text-pink-900 font-medium leading-relaxed">
              {prompt.promptDe}
            </p>
            <p className="text-pink-900/80 italic text-sm leading-relaxed">
              {prompt.promptEn}
            </p>
          </div>

          {/* Guidelines */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Guidelines:</h3>
            <ul className="space-y-2">
              {prompt.guidelines.map((guideline, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 text-sm bg-white/90 border border-gray-200 rounded-md p-2"
                >
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    <span className="block text-gray-900 font-medium">
                      {guideline.de}
                    </span>
                    <span className="block italic text-gray-600 text-xs">
                      {guideline.en}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Word Count Guidance */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Suggested word count:</span>
              <span className="font-medium text-gray-800">
                {prompt.minWords} - {prompt.maxWords} words
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Writing</CardTitle>
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${getWordCountColor()}`}>
                {wordCount} words
              </span>
              {!isWithinSuggestedRange && wordCount > 0 && (
                <span className="text-xs text-yellow-700">
                  {wordCount < prompt.minWords
                    ? "Below suggested range"
                    : "Above suggested range"}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSubmitted}
              placeholder="Start writing your German text here..."
              className={`
                w-full h-64 p-4 border-2 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary
                ${
                  isSubmitted
                    ? "bg-gray-50 cursor-not-allowed text-gray-600 border-gray-300"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-400"
                }
                font-sans text-base leading-relaxed placeholder:text-gray-500
                transition-all duration-200
              `}
            />

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isWithinSuggestedRange
                      ? "bg-green-500"
                      : wordCount === 0
                      ? "bg-gray-300"
                      : "bg-yellow-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (wordCount / prompt.maxWords) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{prompt.minWords} suggested min</span>
                <span>{prompt.maxWords} suggested max</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-4">
              {!isSubmitted ? (
                <>
                  <Button
                    onClick={handleEvaluate}
                    disabled={!meetsMinimum || isEvaluating}
                    size="lg"
                    variant="outline"
                    className="min-w-32 relative"
                  >
                    {isEvaluating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span>AI Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>🤖</span>
                        <span>Evaluate Writing</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!meetsMinimum || isEvaluating}
                    size="lg"
                    className="min-w-32"
                  >
                    Submit Writing
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  {(isEvaluating || isLoadingNext) && (
                    <div className="flex items-center text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                      <span>
                        {isEvaluating
                          ? "AI is evaluating your writing. Please wait..."
                          : "Loading next task..."}
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={handleNewPrompt}
                    size="lg"
                    className="min-w-32"
                    disabled={isEvaluating || isLoadingNext}
                  >
                    {isLoadingNext
                      ? "Loading..."
                      : isEvaluating
                      ? "Evaluating..."
                      : "Next Task"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback (shown after submission) */}
      {isSubmitted && (
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              {isEvaluating && (
                <div className="flex items-center text-blue-800 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                  <span>
                    Evaluating your writing with AI. This may take a few
                    seconds…
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-pink-900 flex items-center space-x-2">
                <span className="text-xl">🎉</span>
                <span>Writing Completed!</span>
              </h3>
              <div className="text-pink-800 space-y-2">
                <p>Great job on completing your German writing exercise!</p>
                <div className="bg-white p-3 rounded-lg border border-pink-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Word count:</span>{" "}
                      {wordCount}
                    </div>
                    <div>
                      <span className="font-medium">Time spent:</span>{" "}
                      {Math.round((Date.now() - startTime) / 60000)} minutes
                    </div>
                    <div>
                      <span className="font-medium">Topic:</span> {prompt.topic}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span>{" "}
                      {getDifficultyText(prompt.difficulty)}
                    </div>
                  </div>
                </div>
                <p className="text-sm">
                  <strong>Tip:</strong> Try reading your text aloud to practice
                  pronunciation and identify areas for improvement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Results */}
      {showEvaluation && evaluation && (
        <div className="space-y-6">
          {/* Comprehensive Evaluation Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900 flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <span>Writing Evaluation Results</span>
                <Badge variant="outline" className="ml-auto">
                  {evaluation.errors?.length || 0} errors found
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">WORDS</div>
                  <div className="text-xl font-bold text-gray-700">
                    {evaluation.wordCount}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">ERRORS</div>
                  <div className="text-xl font-bold text-red-600">
                    {evaluation.errors?.length || 0}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">LEVEL</div>
                  <div className="text-sm font-bold text-blue-600">
                    {evaluation.difficulty?.replace("_", " ")}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">GRADE</div>
                  <div
                    className={`text-xl font-bold ${getScoreColor(
                      evaluation.overallScore
                    )}`}
                  >
                    {evaluation.overallScore >= 90
                      ? "A"
                      : evaluation.overallScore >= 80
                      ? "B"
                      : evaluation.overallScore >= 70
                      ? "C"
                      : evaluation.overallScore >= 60
                      ? "D"
                      : "F"}
                  </div>
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      evaluation.overallScore
                    )}`}
                  >
                    {evaluation.overallScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">
                    Overall Score
                  </div>
                  <Progress value={evaluation.overallScore} className="mt-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {evaluation.overallScore >= 80
                      ? "Excellent"
                      : evaluation.overallScore >= 60
                      ? "Good"
                      : "Needs Work"}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                  <div
                    className={`text-2xl font-bold ${getScoreColor(
                      evaluation.grammarScore
                    )}`}
                  >
                    {evaluation.grammarScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">
                    Grammar
                  </div>
                  <Progress value={evaluation.grammarScore} className="mt-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {evaluation.grammarScore >= 80
                      ? "Strong"
                      : evaluation.grammarScore >= 60
                      ? "Fair"
                      : "Focus Area"}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                  <div
                    className={`text-2xl font-bold ${getScoreColor(
                      evaluation.vocabularyScore
                    )}`}
                  >
                    {evaluation.vocabularyScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">
                    Vocabulary
                  </div>
                  <Progress
                    value={evaluation.vocabularyScore}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {evaluation.vocabularyScore >= 80
                      ? "Rich"
                      : evaluation.vocabularyScore >= 60
                      ? "Adequate"
                      : "Limited"}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                  <div
                    className={`text-2xl font-bold ${getScoreColor(
                      evaluation.structureScore
                    )}`}
                  >
                    {evaluation.structureScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">
                    Structure
                  </div>
                  <Progress
                    value={evaluation.structureScore}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {evaluation.structureScore >= 80
                      ? "Clear"
                      : evaluation.structureScore >= 60
                      ? "Decent"
                      : "Confused"}
                  </div>
                </div>
              </div>

              {/* Error Breakdown */}
              {evaluation.errors && evaluation.errors.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Error Breakdown:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    {["major", "moderate", "minor"].map((severity) => {
                      const count = evaluation.errors.filter(
                        (e) => e.severity === severity
                      ).length;
                      return (
                        <div key={severity} className="text-center">
                          <div
                            className={`text-lg font-bold ${
                              severity === "major"
                                ? "text-red-600"
                                : severity === "moderate"
                                ? "text-orange-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {count}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {severity}
                          </div>
                        </div>
                      );
                    })}
                    {["grammar", "vocabulary"].map((type) => {
                      const count = evaluation.errors.filter(
                        (e) => e.errorType === type
                      ).length;
                      return (
                        <div key={type} className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {count}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {type}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Analysis */}
          {evaluation.errors && evaluation.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
                  <span className="text-xl">🔍</span>
                  <span>
                    Error Analysis ({evaluation.errors.length} errors found)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Error Legend */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-200 border-b-2 border-red-400 rounded"></div>
                      <span>Major errors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-200 border-b-2 border-orange-400 rounded"></div>
                      <span>Moderate errors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-200 border-b-2 border-yellow-400 rounded"></div>
                      <span>Minor errors</span>
                    </div>
                  </div>

                  {/* Highlighted Text */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Your text with errors highlighted:
                    </h4>
                    <div
                      className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: highlightErrors(text, evaluation.errors),
                      }}
                    />
                  </div>

                  {/* Error Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>🔍 Error Details:</span>
                      <span className="text-sm text-gray-500">
                        Click on highlighted text above to jump to details
                      </span>
                    </h4>
                    {evaluation.errors.map((error, index) => {
                      const errorId = `error-detail-error-${index}`;
                      return (
                        <div
                          key={index}
                          id={errorId}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${getSeverityColor(
                            error.severity
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  error.severity === "major"
                                    ? "bg-red-500"
                                    : error.severity === "moderate"
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <Badge
                                variant="outline"
                                className="capitalize text-xs font-medium"
                              >
                                {error.errorType.replace("-", " ")}
                              </Badge>
                              <Badge
                                variant={
                                  error.severity === "major"
                                    ? "destructive"
                                    : error.severity === "moderate"
                                    ? "warning"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {error.severity} error
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Position: {error.start}-{error.end}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                              <div className="text-sm font-medium text-red-800 mb-1">
                                ❌ Your text:
                              </div>
                              <div className="font-mono text-red-900 bg-white px-2 py-1 rounded border text-sm">
                                "{error.originalText}"
                              </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="text-sm font-medium text-green-800 mb-1">
                                ✅ Correct version:
                              </div>
                              <div className="font-mono text-green-900 bg-white px-2 py-1 rounded border text-sm">
                                "{error.correctedText}"
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="font-medium text-blue-800 mb-1">
                                📚 Explanation:
                              </div>
                              <div className="text-blue-900">
                                {error.explanation}
                              </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <div className="font-medium text-purple-800 mb-1">
                                💡 Learning Tip:
                              </div>
                              <div className="text-purple-900">
                                {error.suggestion}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Corrected Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
                <span className="text-xl">✅</span>
                <span>Corrected Version</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {evaluation.correctedText}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Positive Feedback */}
          {evaluation.positiveAspects &&
            evaluation.positiveAspects.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-900 flex items-center space-x-2">
                    <span className="text-xl">🌟</span>
                    <span>What You Did Well</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {evaluation.positiveAspects.map((aspect, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2 text-green-800"
                      >
                        <span className="text-green-500 mt-1">•</span>
                        <span>{aspect}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Improvement Suggestions */}
          {evaluation.improvementSuggestions &&
            evaluation.improvementSuggestions.length > 0 && (
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-900 flex items-center space-x-2">
                    <span className="text-xl">💡</span>
                    <span>Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {evaluation.improvementSuggestions.map(
                      (suggestion, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-amber-800"
                        >
                          <span className="text-amber-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Toggle Evaluation Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowEvaluation(false)}
              variant="outline"
              size="sm"
            >
              Hide Evaluation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
