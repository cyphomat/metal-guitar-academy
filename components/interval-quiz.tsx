"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MdRefresh, MdCheckCircle, MdCancel } from "react-icons/md"

// Interval definitions
const intervals = [
  { name: "Prime (Unison)", semitones: 0 },
  { name: "Minor 2nd", semitones: 1 },
  { name: "Major 2nd", semitones: 2 },
  { name: "Minor 3rd", semitones: 3 },
  { name: "Major 3rd", semitones: 4 },
  { name: "Perfect 4th", semitones: 5 },
  { name: "Tritone", semitones: 6 },
  { name: "Perfect 5th", semitones: 7 },
  { name: "Minor 6th", semitones: 8 },
  { name: "Major 6th", semitones: 9 },
  { name: "Minor 7th", semitones: 10 },
  { name: "Major 7th", semitones: 11 },
  { name: "Octave", semitones: 12 },
]

// Note names
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// String tuning (standard tuning)
const stringTuning = [4, 11, 7, 2, 9, 4] // E, B, G, D, A, E (in semitones from C)

interface FretboardNote {
  string: number
  fret: number
  note: string
}

interface Question {
  note1: FretboardNote
  note2: FretboardNote
  correctInterval: string
  intervalSemitones: number
}

interface FretboardProps {
  notes: FretboardNote[]
  highlightColor?: string
}

function Fretboard({ notes, highlightColor = "#ea580c" }: FretboardProps) {
  const strings = 6
  const frets = 12
  const stringSpacing = 30
  const fretSpacing = 40

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
      <svg viewBox="0 0 520 200" className="w-full h-auto" style={{ minWidth: "400px" }}>
        {/* Fret lines */}
        {Array.from({ length: frets + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={i * fretSpacing + 40}
            y1={20}
            x2={i * fretSpacing + 40}
            y2={180}
            stroke="#4a5568"
            strokeWidth={i === 0 ? "3" : "1"}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: strings }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={40}
            y1={30 + i * stringSpacing}
            x2={520}
            y2={30 + i * stringSpacing}
            stroke="#6b7280"
            strokeWidth="2"
          />
        ))}

        {/* Fret markers */}
        {[3, 5, 7, 9].map((fret) => (
          <circle key={`marker-${fret}`} cx={fret * fretSpacing + 20} cy={105} r="3" fill="#6b7280" />
        ))}

        {/* Double dot marker for 12th fret */}
        <circle cx={12 * fretSpacing + 20} cy={85} r="3" fill="#6b7280" />
        <circle cx={12 * fretSpacing + 20} cy={125} r="3" fill="#6b7280" />

        {/* Fret numbers */}
        {Array.from({ length: frets }, (_, i) => (
          <text
            key={`fret-num-${i + 1}`}
            x={(i + 1) * fretSpacing + 20}
            y={15}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
            fontFamily="monospace"
          >
            {i + 1}
          </text>
        ))}

        {/* String names */}
        {["E", "B", "G", "D", "A", "E"].map((note, i) => (
          <text
            key={`string-name-${i}`}
            x={25}
            y={35 + i * stringSpacing}
            textAnchor="middle"
            fill="#f3f4f6"
            fontSize="12"
            fontWeight="bold"
          >
            {note}
          </text>
        ))}

        {/* Highlighted notes */}
        {notes.map((note, index) => (
          <g key={`note-${index}`}>
            <circle
              cx={note.fret * fretSpacing + 20}
              cy={30 + note.string * stringSpacing}
              r="10"
              fill={highlightColor}
              stroke={index === 0 ? "#fb923c" : "#60a5fa"}
              strokeWidth="2"
            />
            <text
              x={note.fret * fretSpacing + 20}
              y={35 + note.string * stringSpacing}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              {note.note}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function IntervalQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)

  // Generate a random note on the fretboard
  const generateRandomNote = (): FretboardNote => {
    const string = Math.floor(Math.random() * 6)
    const fret = Math.floor(Math.random() * 12) + 1 // Frets 1-12
    const noteIndex = (stringTuning[string] + fret) % 12
    const note = noteNames[noteIndex]

    return { string, fret, note }
  }

  // Calculate interval between two notes
  const calculateInterval = (note1: FretboardNote, note2: FretboardNote): number => {
    const note1Index = (stringTuning[note1.string] + note1.fret) % 12
    const note2Index = (stringTuning[note2.string] + note2.fret) % 12

    let intervalSemitones = note2Index - note1Index
    if (intervalSemitones < 0) intervalSemitones += 12
    if (intervalSemitones > 12) intervalSemitones = intervalSemitones % 12

    return intervalSemitones
  }

  // Generate a new question
  const generateQuestion = (): Question => {
    const note1 = generateRandomNote()
    let note2: FretboardNote
    let intervalSemitones: number

    // Keep generating until we get a valid interval (0-12 semitones)
    do {
      note2 = generateRandomNote()
      intervalSemitones = calculateInterval(note1, note2)
    } while (intervalSemitones > 12)

    const correctInterval = intervals.find((i) => i.semitones === intervalSemitones)?.name || "Prime (Unison)"

    return {
      note1,
      note2,
      correctInterval,
      intervalSemitones,
    }
  }

  // Initialize quiz
  const initializeQuiz = () => {
    const newQuestions: Question[] = []
    for (let i = 0; i < 10; i++) {
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
    const isCorrect = answer === currentQ.correctInterval

    setShowResult(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setScore(score + 1)
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < 9) {
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
          <CardTitle className="text-white">Interval Quiz</CardTitle>
          <Button onClick={initializeQuiz} size="sm" variant="outline" className="border-gray-600">
            <MdRefresh className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Question {currentQuestion + 1} of 10</span>
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            Score: {score}/10
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!quizComplete ? (
          <>
            {/* Question */}
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">What interval is between these two notes?</h3>
              <div className="text-sm text-gray-400 mb-4">
                <span className="text-orange-500">Orange note</span> to <span className="text-blue-400">Blue note</span>
              </div>
            </div>

            {/* Fretboard */}
            <Fretboard
              notes={[currentQ.note1, currentQ.note2]}
              highlightColor={showResult === "correct" ? "#10b981" : showResult === "incorrect" ? "#ef4444" : "#ea580c"}
            />

            {/* Answer Selection */}
            <div className="space-y-4">
              <Select value={selectedAnswer} onValueChange={handleAnswerSelect} disabled={isAnswered}>
                <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue placeholder="Select an interval..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  {intervals.map((interval) => (
                    <SelectItem key={interval.name} value={interval.name} className="text-white hover:bg-gray-800">
                      {interval.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                    {showResult === "correct" ? "Correct!" : `Incorrect. The answer was: ${currentQ.correctInterval}`}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Quiz Complete */
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">Quiz Complete!</h3>
            <div className="text-4xl font-bold text-orange-500">{score}/10</div>
            <div className="text-gray-300">
              {score >= 8
                ? "Excellent work!"
                : score >= 6
                  ? "Good job!"
                  : score >= 4
                    ? "Keep practicing!"
                    : "Study more and try again!"}
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Accuracy: {Math.round((score / 10) * 100)}%</div>
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
