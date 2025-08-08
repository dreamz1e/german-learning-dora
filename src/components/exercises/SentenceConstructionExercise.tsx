"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface WordBlock {
  id: string;
  word: string;
  isUsed: boolean;
}

interface SentenceConstructionProps {
  instruction: string;
  correctSentence: string;
  wordBlocks: string[];
  difficulty: string;
  topic: string;
  explanation: string;
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
  isLoadingNext?: boolean;
}

export function SentenceConstructionExercise({
  instruction,
  correctSentence,
  wordBlocks,
  difficulty,
  topic,
  explanation,
  onComplete,
  onNext,
  isLoadingNext = false,
}: SentenceConstructionProps) {
  const [availableWords, setAvailableWords] = useState<WordBlock[]>([]);
  const [constructedSentence, setConstructedSentence] = useState<WordBlock[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const { addToast } = useToast();

  useEffect(() => {
    // Shuffle the word blocks and create objects with IDs
    const shuffled = [...wordBlocks]
      .sort(() => Math.random() - 0.5)
      .map((word, index) => ({
        id: `word-${index}`,
        word,
        isUsed: false,
      }));
    setAvailableWords(shuffled);
  }, [wordBlocks]);

  const addWordToSentence = (wordBlock: WordBlock) => {
    setAvailableWords((prev) =>
      prev.map((w) => (w.id === wordBlock.id ? { ...w, isUsed: true } : w))
    );
    setConstructedSentence((prev) => [...prev, wordBlock]);
  };

  const removeWordFromSentence = (wordBlock: WordBlock, index: number) => {
    setAvailableWords((prev) =>
      prev.map((w) => (w.id === wordBlock.id ? { ...w, isUsed: false } : w))
    );
    setConstructedSentence((prev) => prev.filter((_, i) => i !== index));
  };

  const resetSentence = () => {
    setAvailableWords((prev) => prev.map((w) => ({ ...w, isUsed: false })));
    setConstructedSentence([]);
  };

  const checkAnswer = () => {
    const userSentence = constructedSentence.map((w) => w.word).join(" ");
    const normalizedUser = userSentence.toLowerCase().trim();
    const normalizedCorrect = correctSentence.toLowerCase().trim();

    const correct = normalizedUser === normalizedCorrect;
    setIsCorrect(correct);
    setIsSubmitted(true);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onComplete(correct, timeSpent);

    addToast({
      type: correct ? "success" : "error",
      title: correct ? "Correct!" : "Incorrect",
      message: correct
        ? "Perfect sentence construction!"
        : "Not quite right. Check the explanation below.",
      duration: 4000,
    });
  };

  const handleNext = () => {
    resetSentence();
    setIsSubmitted(false);
    setIsCorrect(false);
    onNext();
  };

  const getDifficultyText = (diff: string) => {
    return diff.replace("_", " ");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">Sentence Construction</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="info">{getDifficultyText(difficulty)}</Badge>
              <Badge variant="outline" className="capitalize">
                {topic}
              </Badge>
              <Badge variant="secondary">Word Order</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instruction */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Task:</h3>
            <p className="text-lg text-foreground/80 leading-relaxed">
              {instruction}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sentence Construction Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Construct Your Sentence</CardTitle>
            {constructedSentence.length > 0 && !isSubmitted && (
              <Button variant="outline" size="sm" onClick={resetSentence}>
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Constructed Sentence Display */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground/80">Your Sentence:</h4>
            <div
              className={`
              min-h-16 p-4 border-2 border-dashed rounded-lg transition-colors
              ${
                constructedSentence.length === 0
                  ? "border-input bg-secondary"
                  : isSubmitted
                  ? isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : "border-pink-300 bg-pink-50"
              }
            `}
            >
              <div className="flex flex-wrap items-center gap-2">
                {constructedSentence.length === 0 ? (
                  <span className="text-muted-foreground italic">
                    Click word blocks below to build your sentence
                  </span>
                ) : (
                  constructedSentence.map((wordBlock, index) => (
                    <div
                      key={`${wordBlock.id}-${index}`}
                      className={`
                        px-3 py-2 rounded-lg border cursor-pointer transition-colors
                        ${
                          isSubmitted
                            ? "cursor-default bg-secondary text-foreground/80"
                            : "bg-pink-100 border-pink-300 hover:bg-pink-200 text-pink-900"
                        }
                      `}
                      onClick={() =>
                        !isSubmitted && removeWordFromSentence(wordBlock, index)
                      }
                    >
                      <span className="font-medium">{wordBlock.word}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Available Word Blocks */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground/80">Available Words:</h4>
            <div className="flex flex-wrap gap-3">
              {availableWords.map((wordBlock) => (
                <button
                  key={wordBlock.id}
                  onClick={() =>
                    !wordBlock.isUsed &&
                    !isSubmitted &&
                    addWordToSentence(wordBlock)
                  }
                  disabled={wordBlock.isUsed || isSubmitted}
                  className={`
                    px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200
                    ${
                      wordBlock.isUsed
                        ? "bg-secondary border-input text-muted-foreground cursor-not-allowed"
                        : isSubmitted
                        ? "bg-secondary border-input text-foreground/70 cursor-not-allowed"
                        : "bg-card border-input text-foreground hover:border-pink-400 hover:bg-pink-50 cursor-pointer active:scale-95"
                    }
                  `}
                >
                  {wordBlock.word}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center pt-4">
            {!isSubmitted ? (
              <Button
                onClick={checkAnswer}
                disabled={constructedSentence.length === 0}
                size="lg"
                className="min-w-32"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
                className="min-w-32"
                disabled={isLoadingNext}
              >
                {isLoadingNext ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Next Exercise"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result & Explanation */}
      {isSubmitted && (
        <Card
          className={`${
            isCorrect
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div
                className={`flex items-center space-x-2 ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                <span className="text-2xl">{isCorrect ? "✅" : "❌"}</span>
                <h3 className="font-semibold text-lg">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </h3>
              </div>

              {!isCorrect && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">Correct Answer:</h4>
                  <div className="p-3 bg-white rounded-lg border border-red-200">
                    <span className="font-medium text-gray-800">
                      {correctSentence}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4
                  className={`font-medium ${
                    isCorrect ? "text-green-800" : "text-red-800"
                  }`}
                >
                  Explanation:
                </h4>
                <p
                  className={`leading-relaxed ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {explanation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
