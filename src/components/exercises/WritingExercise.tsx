"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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

interface RealtimeError {
  start: number;
  end: number;
  originalText: string;
  correctedText: string;
  errorType: "grammar" | "spelling" | "punctuation";
  severity: "minor" | "moderate" | "major";
  shortExplanation: string;
  hint: string;
  sentenceIndex: number; // Track which sentence this error belongs to
}

interface SentenceCheckResult {
  hasErrors: boolean;
  errors: Omit<RealtimeError, "sentenceIndex">[];
  overallFeedback: string;
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

  // Real-time checking state
  const [realtimeErrors, setRealtimeErrors] = useState<RealtimeError[]>([]);
  const [isCheckingSentence, setIsCheckingSentence] = useState(false);
  const [checkedSentences, setCheckedSentences] = useState<Set<string>>(
    new Set()
  );
  const [selectedError, setSelectedError] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingContentRef = useRef(false);

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const isWithinSuggestedRange =
    wordCount >= prompt.minWords && wordCount <= prompt.maxWords;
  const meetsMinimum = wordCount >= 5 && text.trim().length >= 10; // align with API

  /**
   * Extract sentences from text based on sentence-ending punctuation
   */
  const extractSentences = useCallback((text: string) => {
    // Split by sentence-ending punctuation (. ! ?)
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const matches = text.match(sentenceRegex);
    return matches || [];
  }, []);

  /**
   * Check a single sentence for real-time errors
   */
  const checkSentence = useCallback(
    async (
      sentence: string,
      sentenceIndex: number,
      sentenceStartPos: number
    ) => {
      // Skip if already checked or too short
      if (checkedSentences.has(sentence) || sentence.trim().length < 3) {
        return;
      }

      setIsCheckingSentence(true);
      try {
        const response = await fetch("/api/ai/check-sentence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sentence: sentence.trim(),
            difficulty: prompt.difficulty,
            context: `${prompt.promptDe}\n${prompt.promptEn}`,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to check sentence");
        }

        const result: SentenceCheckResult = await response.json();

        // Mark sentence as checked
        setCheckedSentences((prev) => new Set([...prev, sentence]));

        if (result.hasErrors && result.errors.length > 0) {
          // Map errors using positions from API (accurate for all cases including commas/spaces)
          const newErrors: RealtimeError[] = [];

          // Calculate the trim offset (spaces before the trimmed sentence)
          const trimmedSentence = sentence.trim();
          const trimOffset = sentence.indexOf(trimmedSentence);

          for (const error of result.errors) {
            // FALLBACK FIX: Ignore errors where originalText === correctedText
            if (error.originalText.trim() === error.correctedText.trim()) {
              console.warn(
                "Ignoring invalid error where original and corrected text are the same:",
                error
              );
              continue;
            }

            // Use positions from API response (relative to trimmed sentence)
            // Calculate absolute positions in the full text
            let absoluteStart = sentenceStartPos + trimOffset + error.start;
            let absoluteEnd = sentenceStartPos + trimOffset + error.end;

            // Handle insertion points (missing punctuation) where start === end
            // In this case, we need to find what character to highlight
            if (absoluteStart === absoluteEnd) {
              // For insertion points, check if originalText is a space (missing comma case)
              if (error.originalText === " ") {
                // Look for a space near the insertion point (before or after)
                if (absoluteStart > 0 && text[absoluteStart - 1] === " ") {
                  // Space is before the insertion point
                  absoluteStart = absoluteStart - 1;
                } else if (
                  absoluteStart < text.length &&
                  text[absoluteStart] === " "
                ) {
                  // Space is at the insertion point
                  absoluteEnd = absoluteStart + 1;
                } else {
                  // Can't find the space, skip this error
                  console.warn(
                    `Cannot find space for insertion point at position ${absoluteStart}`
                  );
                  continue;
                }
              } else {
                // For other insertion points, expand to include the next character
                if (absoluteStart < text.length) {
                  absoluteEnd = absoluteStart + 1;
                } else {
                  continue;
                }
              }
            }

            // Validate the positions are within bounds
            if (
              absoluteStart >= 0 &&
              absoluteEnd <= text.length &&
              absoluteStart < absoluteEnd
            ) {
              // Verify the extracted text matches what we expect (for debugging)
              const extractedText = text.substring(absoluteStart, absoluteEnd);

              if (extractedText !== error.originalText) {
                // Position mismatch - try to find the correct position
                console.warn(
                  `Position mismatch for error. Expected: "${error.originalText}", Got: "${extractedText}". Searching for correct position...`
                );

                // Special handling for space errors (missing commas)
                // AI might return originalText as " " (space) or "" (empty) for comma errors
                if (
                  (error.originalText === " " || error.originalText === "") &&
                  error.errorType === "punctuation"
                ) {
                  // For comma errors, search for common subordinating conjunctions
                  // and find the space before them
                  const conjunctions = [
                    "weil",
                    "dass",
                    "wenn",
                    "ob",
                    "als",
                    "während",
                    "bevor",
                    "nachdem",
                    "obwohl",
                  ];

                  for (const conj of conjunctions) {
                    const conjIndex = sentence.indexOf(conj);
                    if (conjIndex > 0 && sentence[conjIndex - 1] === " ") {
                      // Found the space before the conjunction
                      newErrors.push({
                        ...error,
                        start: sentenceStartPos + conjIndex - 1,
                        end: sentenceStartPos + conjIndex,
                        sentenceIndex,
                      });
                      continue;
                    }
                  }

                  console.warn(
                    `Could not find subordinating conjunction for comma error`
                  );
                  continue;
                }

                // For non-space errors, try to find the correct position
                if (error.originalText.trim().length > 0) {
                  const errorTextPosition = sentence.indexOf(
                    error.originalText
                  );

                  if (errorTextPosition !== -1) {
                    newErrors.push({
                      ...error,
                      start: sentenceStartPos + errorTextPosition,
                      end:
                        sentenceStartPos +
                        errorTextPosition +
                        error.originalText.length,
                      sentenceIndex,
                    });
                    continue;
                  }
                }

                // If we can't find it, skip this error
                console.warn(`Skipping error for: "${error.originalText}"`);
                continue;
              }

              // Positions are correct, use them
              newErrors.push({
                ...error,
                start: absoluteStart,
                end: absoluteEnd,
                sentenceIndex,
              });
            } else {
              console.warn(
                `Invalid error positions for "${error.originalText}": start=${error.start}, end=${error.end} (sentence pos: ${sentenceStartPos}, trim offset: ${trimOffset}) => absolute: ${absoluteStart}-${absoluteEnd}, text.length=${text.length}`
              );
            }
          }

          if (newErrors.length > 0) {
            setRealtimeErrors((prev) => {
              // Remove old errors from this sentence
              const filtered = prev.filter(
                (e) => e.sentenceIndex !== sentenceIndex
              );
              return [...filtered, ...newErrors];
            });
          } else {
            // No valid errors found, clear any existing errors for this sentence
            setRealtimeErrors((prev) =>
              prev.filter((e) => e.sentenceIndex !== sentenceIndex)
            );
          }
        } else {
          // Remove any previous errors from this sentence
          setRealtimeErrors((prev) =>
            prev.filter((e) => e.sentenceIndex !== sentenceIndex)
          );
        }
      } catch (error) {
        console.error("Sentence check error:", error);
        // Fail silently for real-time checks to not disrupt writing flow
      } finally {
        setIsCheckingSentence(false);
      }
    },
    [checkedSentences, prompt.difficulty, prompt.promptDe, prompt.promptEn]
  );

  /**
   * Detect when a sentence ends and trigger checking
   */
  useEffect(() => {
    if (isSubmitted) return;

    // Clear any existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Check if the text ends with sentence-ending punctuation
    const trimmedText = text.trim();
    const endsWithPunctuation = /[.!?]$/.test(trimmedText);

    if (endsWithPunctuation && trimmedText.length > 3) {
      // Extract all sentences and calculate their positions
      const sentences = extractSentences(text);

      // Check the last sentence after a short delay
      checkTimeoutRef.current = setTimeout(() => {
        if (sentences.length > 0) {
          const lastSentence = sentences[sentences.length - 1];

          // Calculate the starting position of this sentence in the full text
          let sentenceStartPos = 0;
          for (let i = 0; i < sentences.length - 1; i++) {
            sentenceStartPos += sentences[i].length;
          }

          checkSentence(lastSentence, sentences.length - 1, sentenceStartPos);
        }
      }, 800); // 800ms delay to avoid checking while still typing
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [text, isSubmitted, extractSentences, checkSentence]);

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
    setRealtimeErrors([]);
    setCheckedSentences(new Set());
    setSelectedError(null);
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
    if (wordCount === 0) return "text-muted-foreground";
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
          topic: prompt.topic,
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

  /**
   * Update editor with error highlights when errors change
   */
  useEffect(() => {
    if (!editorRef.current || isSubmitted) return;

    const editor = editorRef.current;
    const currentText = editor.textContent || "";

    // Skip if text doesn't match (user is still typing)
    if (currentText !== text) {
      return;
    }

    // Check if editor currently has highlighted errors
    const hasHighlights = editor.querySelector("[data-error-start]") !== null;

    // If no errors and no highlights, nothing to do
    if (realtimeErrors.length === 0 && !hasHighlights) {
      return;
    }

    // Save cursor position
    const selection = window.getSelection();
    let cursorOffset = 0;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      cursorOffset = preCaretRange.toString().length;
    }

    // Render text with or without error highlights
    let highlightedText = text;

    if (realtimeErrors.length > 0) {
      // Sort errors by start position (DESCENDING) to process from end to start
      // This way, adding HTML tags at the end doesn't affect earlier positions
      const sortedErrors = [...realtimeErrors].sort(
        (a, b) => b.start - a.start
      );

      // Filter out any overlapping errors (keep the first occurrence)
      const nonOverlappingErrors: RealtimeError[] = [];
      sortedErrors.forEach((error) => {
        const hasOverlap = nonOverlappingErrors.some(
          (existing) =>
            (error.start >= existing.start && error.start < existing.end) ||
            (error.end > existing.start && error.end <= existing.end)
        );
        if (!hasOverlap && error.start >= 0 && error.end <= text.length) {
          nonOverlappingErrors.push(error);
        }
      });

      // Process errors from end to start of the text
      nonOverlappingErrors.forEach((error) => {
        const errorId = `rt-error-${error.start}`; // Use position as unique ID
        const severityClass = {
          minor: "bg-yellow-200/70 border-b-2 border-yellow-500",
          moderate: "bg-orange-200/70 border-b-2 border-orange-500",
          major: "bg-red-200/70 border-b-2 border-red-500",
        }[error.severity];

        // Extract the error text from the CURRENT highlightedText
        // (which may already have some errors wrapped)
        const beforeError = highlightedText.substring(0, error.start);
        const errorText = highlightedText.substring(error.start, error.end);
        const afterError = highlightedText.substring(error.end);

        // Skip if errorText is empty (invalid position)
        if (!errorText) {
          console.warn("Invalid error position:", error);
          return;
        }

        // Wrap the error in a span tag
        const spanTag = `<span class="${severityClass} cursor-pointer rounded px-0.5 transition-all duration-200 hover:shadow-sm" data-error-start="${error.start}" data-error-id="${errorId}">${errorText}</span>`;

        // Reconstruct the text with the wrapped error
        highlightedText = beforeError + spanTag + afterError;
      });
    }
    // If realtimeErrors.length === 0, highlightedText remains as plain text

    // Update editor content
    isUpdatingContentRef.current = true;
    editor.innerHTML = highlightedText;
    isUpdatingContentRef.current = false;

    // Restore cursor position
    if (cursorOffset > 0 && selection) {
      try {
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(
          editor,
          NodeFilter.SHOW_TEXT,
          null
        );
        let node;
        while ((node = walker.nextNode())) {
          textNodes.push(node as Text);
        }

        let currentOffset = 0;
        for (const textNode of textNodes) {
          const textLength = textNode.textContent?.length || 0;
          if (currentOffset + textLength >= cursorOffset) {
            const range = document.createRange();
            const offset = Math.min(cursorOffset - currentOffset, textLength);
            range.setStart(textNode, offset);
            range.setEnd(textNode, offset);
            selection.removeAllRanges();
            selection.addRange(range);
            break;
          }
          currentOffset += textLength;
        }
      } catch (error) {
        console.debug("Could not restore cursor position:", error);
      }
    }
  }, [realtimeErrors, text, isSubmitted]);

  /**
   * Handle contenteditable input changes
   */
  const handleContentChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      // Prevent processing if we're updating content programmatically
      if (isUpdatingContentRef.current) return;

      const newText = e.currentTarget.textContent || "";
      const oldText = text;
      setText(newText);

      // If user edits a sentence with errors, clear those errors and mark for recheck
      const sentences = extractSentences(newText);
      const oldSentences = extractSentences(oldText);
      const currentSentences = new Set(sentences);

      // Find which sentences have been modified or removed
      const modifiedOrRemovedSentences = new Set<string>();

      // Check old sentences to see if they still exist unchanged
      oldSentences.forEach((oldSent) => {
        if (!currentSentences.has(oldSent)) {
          modifiedOrRemovedSentences.add(oldSent);
        }
      });

      // Remove checked sentences that have been modified or removed
      setCheckedSentences((prev) => {
        const updated = new Set<string>();
        prev.forEach((s) => {
          // Keep only if sentence still exists and hasn't been modified
          if (currentSentences.has(s) && !modifiedOrRemovedSentences.has(s)) {
            updated.add(s);
          }
        });
        return updated;
      });

      // Clear errors for sentences that changed or no longer exist
      setRealtimeErrors((prev) =>
        prev.filter((error) => {
          const sentence = sentences[error.sentenceIndex];
          // Keep error only if sentence exists and hasn't been modified
          return (
            sentence &&
            currentSentences.has(sentence) &&
            !modifiedOrRemovedSentences.has(sentence)
          );
        })
      );
    },
    [extractSentences, text]
  );

  /**
   * Handle clicking on an error
   */
  const handleErrorClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const errorStartStr = target.getAttribute("data-error-start");

      if (errorStartStr !== null) {
        const errorStart = parseInt(errorStartStr, 10);
        // Find the error by its start position
        const errorIndex = realtimeErrors.findIndex(
          (err) => err.start === errorStart
        );

        if (errorIndex !== -1) {
          setSelectedError(errorIndex === selectedError ? null : errorIndex);
        }
      }
    },
    [selectedError, realtimeErrors]
  );

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
                  className="flex items-start space-x-2 text-sm bg-card ring-1 ring-border rounded-md p-2"
                >
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    <span className="block text-foreground font-medium">
                      {guideline.de}
                    </span>
                    <span className="block italic text-muted-foreground text-xs">
                      {guideline.en}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Word Count Guidance */}
          <div className="bg-secondary p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/80">Suggested word count:</span>
              <span className="font-medium text-foreground">
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
            {/* Real-time feedback indicator */}
            {isCheckingSentence && (
              <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
                <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span>AI is checking your sentence...</span>
              </div>
            )}

            {/* Error count badge */}
            {realtimeErrors.length > 0 && !isSubmitted && (
              <div className="flex items-center justify-between text-sm bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-700">
                    ⚠️ {realtimeErrors.length} error
                    {realtimeErrors.length > 1 ? "s" : ""} detected
                  </span>
                </div>
                <span className="text-xs text-yellow-600">
                  Click on underlined text for details
                </span>
              </div>
            )}

            {/* Contenteditable div for inline editing with error highlights */}
            <div className="relative">
              {/* Placeholder overlay */}
              {text.length === 0 && !isSubmitted && (
                <div className="absolute inset-0 p-4 pointer-events-none text-muted-foreground text-base leading-relaxed">
                  Start writing your German text here...
                </div>
              )}

              <div
                ref={editorRef}
                contentEditable={!isSubmitted}
                onInput={handleContentChange}
                onClick={handleErrorClick}
                suppressContentEditableWarning
                className={`
                  w-full min-h-[16rem] max-h-[24rem] overflow-y-auto p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none
                  ${
                    isSubmitted
                      ? "bg-secondary cursor-not-allowed text-foreground/70 border-input"
                      : "bg-card text-foreground border-input hover:border-primary/40"
                  }
                  font-sans text-base leading-relaxed
                  transition-all duration-200
                `}
              />

              {/* Mobile-friendly error tooltip */}
              {selectedError !== null &&
                realtimeErrors[selectedError] &&
                !isSubmitted && (
                  <div className="mt-2 p-4 bg-white border-2 border-blue-300 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            realtimeErrors[selectedError].severity === "major"
                              ? "bg-red-500"
                              : realtimeErrors[selectedError].severity ===
                                "moderate"
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <Badge variant="outline" className="text-xs capitalize">
                          {realtimeErrors[selectedError].errorType}
                        </Badge>
                      </div>
                      <button
                        onClick={() => setSelectedError(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-red-50 p-2 rounded border border-red-200">
                          <div className="text-xs font-medium text-red-700 mb-1">
                            ❌ Your text:
                          </div>
                          <div className="text-sm text-red-900 font-mono">
                            "{realtimeErrors[selectedError].originalText}"
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <div className="text-xs font-medium text-green-700 mb-1">
                            ✅ Correct:
                          </div>
                          <div className="text-sm text-green-900 font-mono">
                            "{realtimeErrors[selectedError].correctedText}"
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="text-xs font-medium text-blue-700 mb-1">
                          💡 Explanation:
                        </div>
                        <div className="text-sm text-blue-900">
                          {realtimeErrors[selectedError].shortExplanation}
                        </div>
                      </div>

                      {realtimeErrors[selectedError].hint && (
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                          <div className="text-xs font-medium text-purple-700 mb-1">
                            📚 Learning Tip:
                          </div>
                          <div className="text-sm text-purple-900">
                            {realtimeErrors[selectedError].hint}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isWithinSuggestedRange
                      ? "bg-green-500"
                      : wordCount === 0
                      ? "bg-muted"
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
              <div className="flex justify-between text-xs text-muted-foreground">
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

      {/* Real-time Errors Summary (Mobile-friendly list) */}
      {realtimeErrors.length > 0 && !isSubmitted && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900 flex items-center space-x-2">
              <span className="text-xl">📝</span>
              <span>Detected Issues ({realtimeErrors.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-amber-800 mb-3">
                The AI has detected some issues in your writing. Tap any issue
                below to see details:
              </p>
              {realtimeErrors.map((error, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setSelectedError(index === selectedError ? null : index)
                  }
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedError === index
                      ? "border-blue-400 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        error.severity === "major"
                          ? "bg-red-500"
                          : error.severity === "moderate"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {error.errorType}
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
                          {error.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700 font-medium mb-1">
                        "{error.originalText}" → "{error.correctedText}"
                      </div>
                      <div className="text-xs text-gray-600">
                        {error.shortExplanation}
                      </div>
                      {selectedError === index && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded">
                            💡 <strong>Tip:</strong> {error.hint}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
          <Card className="relative overflow-hidden ring-1 ring-border/80 bg-card/70">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400" />
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
                <div className="text-center p-3 bg-card rounded-lg ring-1 ring-border shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">
                    WORDS
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {evaluation.wordCount}
                  </div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg ring-1 ring-border shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">
                    ERRORS
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    {evaluation.errors?.length || 0}
                  </div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg ring-1 ring-border shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">
                    LEVEL
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    {evaluation.difficulty?.replace("_", " ")}
                  </div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg ring-1 ring-border shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">
                    GRADE
                  </div>
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
