"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MdRefresh, MdCheckCircle, MdCancel } from "react-icons/md"

// Chord definitions
const chordTypes = [
  { name: "Major", intervals: [0, 4, 7], symbol: "" },
  { name: "Minor", intervals: [0, 3, 7], symbol: "m" },
  { name: "Diminished", intervals: [0, 3, 6], symbol: "°" },
  { name: "Augmented", intervals: [0, 4, 8], symbol: "+" },
  { name: "Major 7th", intervals: [0, 4, 7, 11], symbol: "maj7" },
  { name: "Minor 7th", intervals: [0, 3, 7, 10], symbol: "m7" },
  { name: "Dominant 7th", intervals: [0, 4, 7, 10], symbol: "7" },
]

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

interface Question {
  type: "identify" | "build"
  chordNotes?: string[]
  correctAnswer: string
  rootNote?: string
  chordType?: string
}

export function ChordQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)

  // Generate chord notes from root and type
  const generateChordNotes = (rootNote: string, chordType: (typeof chordTypes)[0]): string[] => {
    const rootIndex = noteNames.indexOf(rootNote)
    return chordType.intervals.map((interval) => noteNames[(rootIndex + interval) % 12])
  }

  // Generate a random question
  const generateQuestion = (): Question => {
    const questionType = Math.random() > 0.5 ? "identify" : "build"
    const randomChordType = chordTypes[Math.floor(Math.random() * chordTypes.length)]
    const randomRoot = noteNames[Math.floor(Math.random() * noteNames.length)]

    if (questionType === "identify") {
      const chordNotes = generateChordNotes(randomRoot, randomChordType)
      return {
        type: "identify",
        chordNotes,
        correctAnswer: randomChordType.name,
      }
    } else {
      return {
        type: "build",
        rootNote: randomRoot,
        chordType: randomChordType.name,
        correctAnswer: generateChordNotes(randomRoot, randomChordType).join(", "),
      }
    }
  }

  // Initialize quiz
  const initializeQuiz = () => {
    const newQuestions: Question[] = []
    for (let i = 0; i < 15; i++) {
      newQuestions.push(generateQuestion())
    }
    setQuestions(newQuestions)
    setCurrentQuestion(0)
    setScore(0)
    setQuizComplete(false)
    setSelectedAnswer("")
    setShowResult(null)
    setIsAnswered(false)
  }

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return

    setSelectedAnswer(answer)
    setIsAnswered(true)

    const currentQ = questions[currentQuestion]
    const isCorrect = answer === currentQ.correctAnswer

    setShowResult(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setScore(score + 1)
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < 14) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer("")
        setShowResult(null)
        setIsAnswered(false)
      } else {
        setQuizComplete(true)
      }
    }, 2000)
  }

  // Initialize quiz on component mount
  useEffect(() => {
    initializeQuiz()
  }, [])

  if (questions.length === 0) {
    return (
      <Card className="w-96 p-6">
        <CardContent>
          <div className="text-center">Loading quiz...</div>
        </CardContent>
      </Card>
    )
  }

  const currentQ = questions[currentQuestion]
  const borderColor =
    showResult === "correct" ? "border-green-500" : showResult === "incorrect" ? "border-red-500" : "border-gray-800"

  return (
    <Card className={`w-96 p-6 transition-colors duration-300 ${borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Chord Quiz</CardTitle>
          <Button onClick={initializeQuiz} size="sm" variant="outline" className="border-gray-600">
            <MdRefresh className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Question {currentQuestion + 1} of 15</span>
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            Score: {score}/15
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!quizComplete ? (
          <>
            {/* Question */}
            <div className="text-center space-y-4">
              {currentQ.type === "identify" ? (
                <>
                  <h3 className="text-white font-semibold">What type of chord is this?</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-lg font-mono text-orange-500">{currentQ.chordNotes?.join(" - ")}</div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-white font-semibold">Build this chord:</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-lg font-mono text-orange-500">
                      {currentQ.rootNote} {currentQ.chordType}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Answer Selection */}
            <div className="space-y-4">
              {currentQ.type === "identify" ? (
                <Select value={selectedAnswer} onValueChange={handleAnswerSelect} disabled={isAnswered}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select chord type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {chordTypes.map((chord) => (
                      <SelectItem key={chord.name} value={chord.name} className="text-white hover:bg-gray-800">
                        {chord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Enter the notes (separated by commas):</label>
                  <input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnswerSelect(selectedAnswer)}
                    disabled={isAnswered}
                    placeholder="e.g., C, E, G"
                    className="w-full p-2 bg-gray-900/50 border border-gray-800 rounded text-white placeholder-gray-500"
                  />
                  <Button
                    onClick={() => handleAnswerSelect(selectedAnswer)}
                    disabled={isAnswered || !selectedAnswer.trim()}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Submit Answer
                  </Button>
                </div>
              )}

              {/* Result Feedback */}
              {showResult && (
                <div
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${
                    showResult === "correct"
                      ? "bg-green-900/20 border border-green-500/30"
                      : "bg-red-900/20 border border-red-500/30"
                  }`}
                >
                  {showResult === "correct" ? (
                    <MdCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <MdCancel className="h-5 w-5 text-red-500" />
                  )}
                  <span className={showResult === "correct" ? "text-green-400" : "text-red-400"}>
                    {showResult === "correct" ? "Correct!" : `Incorrect. The answer was: ${currentQ.correctAnswer}`}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Quiz Complete */
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">Quiz Complete!</h3>
            <div className="text-4xl font-bold text-orange-500">{score}/15</div>
            <div className="text-gray-300">
              {score >= 12
                ? "Excellent work!"
                : score >= 9
                  ? "Good job!"
                  : score >= 6
                    ? "Keep practicing!"
                    : "Study more and try again!"}
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Accuracy: {Math.round((score / 15) * 100)}%</div>
              <Button onClick={initializeQuiz} className="w-full bg-orange-600 hover:bg-orange-700">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
