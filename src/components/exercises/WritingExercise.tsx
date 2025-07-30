'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

interface WritingPrompt {
  prompt: string
  difficulty: string
  topic: string
  guidelines: string[]
  minWords: number
  maxWords: number
}

interface WritingExerciseProps {
  prompt: WritingPrompt
  onComplete: (wordCount: number, timeSpent: number) => void
  onNewPrompt: () => void
}

export function WritingExercise({ prompt, onComplete, onNewPrompt }: WritingExerciseProps) {
  const [text, setText] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime] = useState(Date.now())
  const { addToast } = useToast()

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
  const isValidLength = wordCount >= prompt.minWords && wordCount <= prompt.maxWords

  const handleSubmit = () => {
    if (!isValidLength) {
      addToast({
        type: 'warning',
        title: 'Word Count',
        message: `Please write between ${prompt.minWords} and ${prompt.maxWords} words.`,
        duration: 3000
      })
      return
    }

    if (text.trim().length < 10) {
      addToast({
        type: 'warning',
        title: 'Too Short',
        message: 'Please write more content before submitting.',
        duration: 3000
      })
      return
    }

    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    setIsSubmitted(true)
    onComplete(wordCount, timeSpent)

    addToast({
      type: 'success',
      title: 'Writing Submitted!',
      message: `Great work! You wrote ${wordCount} words.`,
      duration: 4000
    })
  }

  const handleNewPrompt = () => {
    setText('')
    setIsSubmitted(false)
    onNewPrompt()
  }

  const getDifficultyText = (diff: string) => {
    return diff.replace('_', ' ')
  }

  const getWordCountColor = () => {
    if (wordCount < prompt.minWords) return 'text-red-600'
    if (wordCount > prompt.maxWords) return 'text-red-600'
    if (wordCount >= prompt.minWords && wordCount <= prompt.maxWords) return 'text-green-600'
    return 'text-gray-600'
  }

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
              <Badge variant="secondary">
                Writing Practice
              </Badge>
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
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800 font-medium leading-relaxed">
              {prompt.prompt}
            </p>
          </div>

          {/* Guidelines */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Guidelines:</h3>
            <ul className="space-y-2">
              {prompt.guidelines.map((guideline, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Word Count Requirements */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Required word count:</span>
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
              {!isValidLength && wordCount > 0 && (
                <span className="text-xs text-red-600">
                  {wordCount < prompt.minWords ? 'Too short' : 'Too long'}
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
                w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary
                ${isSubmitted ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                font-mono text-sm leading-relaxed
              `}
            />

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isValidLength ? 'bg-green-500' : wordCount === 0 ? 'bg-gray-300' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min((wordCount / prompt.maxWords) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{prompt.minWords} min</span>
                <span>{prompt.maxWords} max</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-4">
              {!isSubmitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isValidLength || text.trim().length < 10}
                  size="lg"
                  className="min-w-32"
                >
                  Submit Writing
                </Button>
              ) : (
                <div className="flex space-x-4">
                  <Button
                    onClick={handleNewPrompt}
                    size="lg"
                    className="min-w-32"
                  >
                    New Writing Task
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback (shown after submission) */}
      {isSubmitted && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-900 flex items-center space-x-2">
                <span className="text-xl">🎉</span>
                <span>Writing Completed!</span>
              </h3>
              <div className="text-green-800 space-y-2">
                <p>Great job on completing your German writing exercise!</p>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Word count:</span> {wordCount}
                    </div>
                    <div>
                      <span className="font-medium">Time spent:</span> {Math.round((Date.now() - startTime) / 60000)} minutes
                    </div>
                    <div>
                      <span className="font-medium">Topic:</span> {prompt.topic}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {getDifficultyText(prompt.difficulty)}
                    </div>
                  </div>
                </div>
                <p className="text-sm">
                  <strong>Tip:</strong> Try reading your text aloud to practice pronunciation and identify areas for improvement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}