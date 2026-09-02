"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MdPlayArrow, MdStop, MdRefresh, MdKeyboard } from "react-icons/md"

// Note types and their durations (in beats)
const noteTypes = {
  quarter: { duration: 1, name: "Quarter Note" },
  eighth: { duration: 0.5, name: "Eighth Note" },
  triplet: { duration: 1 / 3, name: "Eighth Triplet" },
  rest: { duration: 1, name: "Quarter Rest" },
  eighthRest: { duration: 0.5, name: "Eighth Rest" },
}

type NoteType = keyof typeof noteTypes

interface RhythmNote {
  type: NoteType
  beat: number // Position in the bar (0-4)
  isRest: boolean
}

interface UserTap {
  timestamp: number
  beat: number
}

// SVG Components for musical notation
function QuarterNote({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Note head */}
      <ellipse cx={x} cy={y} rx="6" ry="4" fill="#ffffff" transform={`rotate(-20 ${x} ${y})`} />
      {/* Stem */}
      <line x1={x + 5} y1={y} x2={x + 5} y2={y - 25} stroke="#ffffff" strokeWidth="1.5" />
    </g>
  )
}

function EighthNote({ x, y, hasFlag = true }: { x: number; y: number; hasFlag?: boolean }) {
  return (
    <g>
      {/* Note head (filled) */}
      <ellipse cx={x} cy={y} rx="6" ry="4" fill="#ffffff" transform={`rotate(-20 ${x} ${y})`} />
      {/* Stem */}
      <line x1={x + 5} y1={y} x2={x + 5} y2={y - 25} stroke="#ffffff" strokeWidth="1.5" />
      {/* Flag */}
      {hasFlag && <path d={`M ${x + 5} ${y - 25} Q ${x + 15} ${y - 20} ${x + 5} ${y - 15}`} fill="#ffffff" />}
    </g>
  )
}

function EighthTriplet({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Three eighth notes */}
      <EighthNote x={x} y={y} hasFlag={false} />
      <EighthNote x={x + 15} y={y} hasFlag={false} />
      <EighthNote x={x + 30} y={y} hasFlag={false} />
      {/* Beam */}
      <line x1={x + 5} y1={y - 25} x2={x + 35} y2={y - 25} stroke="#ffffff" strokeWidth="2" />
      {/* Triplet bracket */}
      <text x={x + 17} y={y - 35} textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="serif">
        3
      </text>
      <path
        d={`M ${x} ${y - 30} L ${x + 5} ${y - 30} M ${x + 30} ${y - 30} L ${x + 35} ${y - 30}`}
        stroke="#ffffff"
        strokeWidth="1"
      />
    </g>
  )
}

function QuarterRest({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M ${x} ${y - 10} L ${x + 8} ${y - 15} L ${x + 3} ${y - 5} L ${x + 8} ${y} L ${x} ${y + 5} Z`}
        fill="#ffffff"
      />
    </g>
  )
}

function EighthRest({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x + 4} cy={y - 8} rx="3" ry="2" fill="#ffffff" />
      <path d={`M ${x} ${y - 5} Q ${x + 8} ${y - 10} ${x + 4} ${y}`} stroke="#ffffff" strokeWidth="2" fill="none" />
    </g>
  )
}

interface RhythmNotationProps {
  pattern: RhythmNote[]
  currentBeat: number
}

function RhythmNotation({ pattern, currentBeat }: RhythmNotationProps) {
  const barWidth = 400
  const noteY = 60

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <svg viewBox="0 0 450 120" className="w-full h-auto">
        {/* Staff lines */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={25} y1={40 + i * 10} x2={425} y2={40 + i * 10} stroke="#6b7280" strokeWidth="1" />
        ))}

        {/* Bar lines */}
        <line x1={25} y1={30} x2={25} y2={80} stroke="#ffffff" strokeWidth="2" />
        <line x1={425} y1={30} x2={425} y2={80} stroke="#ffffff" strokeWidth="2" />

        {/* Time signature */}
        <text x={35} y={50} fill="#ffffff" fontSize="16" fontFamily="serif" fontWeight="bold">
          4
        </text>
        <text x={35} y={70} fill="#ffffff" fontSize="16" fontFamily="serif" fontWeight="bold">
          4
        </text>

        {/* Beat markers */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={75 + i * 80} y1={85} x2={75 + i * 80} y2={90} stroke="#6b7280" strokeWidth="1" />
        ))}

        {/* Beat numbers */}
        {Array.from({ length: 4 }, (_, i) => (
          <text
            key={i}
            x={115 + i * 80}
            y={105}
            textAnchor="middle"
            fill={currentBeat >= i && currentBeat < i + 1 ? "#ea580c" : "#9ca3af"}
            fontSize="12"
            fontFamily="monospace"
          >
            {i + 1}
          </text>
        ))}

        {/* Current beat indicator */}
        <line
          x1={75 + currentBeat * 80}
          y1={25}
          x2={75 + currentBeat * 80}
          y2={85}
          stroke="#ea580c"
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Rhythm pattern */}
        {pattern.map((note, index) => {
          const x = 75 + note.beat * 80

          switch (note.type) {
            case "quarter":
              return note.isRest ? (
                <QuarterRest key={index} x={x} y={noteY} />
              ) : (
                <QuarterNote key={index} x={x} y={noteY} />
              )
            case "eighth":
              return note.isRest ? (
                <EighthRest key={index} x={x} y={noteY} />
              ) : (
                <EighthNote key={index} x={x} y={noteY} />
              )
            case "triplet":
              return <EighthTriplet key={index} x={x} y={noteY} />
            case "rest":
              return <QuarterRest key={index} x={x} y={noteY} />
            case "eighthRest":
              return <EighthRest key={index} x={x} y={noteY} />
            default:
              return null
          }
        })}
      </svg>
    </div>
  )
}

interface RhythmTrainerProps {
  demoMode?: boolean
}

export function RhythmTrainer({ demoMode = false }: RhythmTrainerProps) {
  const [pattern, setPattern] = useState<RhythmNote[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [userTaps, setUserTaps] = useState<UserTap[]>([])
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [verdict, setVerdict] = useState<string>("")
  const [bpm] = useState(120)

  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const expectedTaps = useRef<number[]>([])

  // Generate a random rhythm pattern
  const generatePattern = useCallback(() => {
    const patterns = [
      // Simple quarter notes
      [
        { type: "quarter" as NoteType, beat: 0, isRest: false },
        { type: "quarter" as NoteType, beat: 1, isRest: false },
        { type: "quarter" as NoteType, beat: 2, isRest: false },
        { type: "quarter" as NoteType, beat: 3, isRest: false },
      ],
      // Eighth note pattern
      [
        { type: "eighth" as NoteType, beat: 0, isRest: false },
        { type: "eighth" as NoteType, beat: 0.5, isRest: false },
        { type: "quarter" as NoteType, beat: 1, isRest: false },
        { type: "eighth" as NoteType, beat: 2, isRest: false },
        { type: "eighth" as NoteType, beat: 2.5, isRest: false },
        { type: "quarter" as NoteType, beat: 3, isRest: false },
      ],
      // With rests
      [
        { type: "quarter" as NoteType, beat: 0, isRest: false },
        { type: "rest" as NoteType, beat: 1, isRest: true },
        { type: "eighth" as NoteType, beat: 2, isRest: false },
        { type: "eighth" as NoteType, beat: 2.5, isRest: false },
        { type: "quarter" as NoteType, beat: 3, isRest: false },
      ],
      // Triplet pattern
      [
        { type: "triplet" as NoteType, beat: 0, isRest: false },
        { type: "quarter" as NoteType, beat: 1, isRest: false },
        { type: "quarter" as NoteType, beat: 2, isRest: false },
        { type: "quarter" as NoteType, beat: 3, isRest: false },
      ],
    ]

    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
    setPattern(randomPattern)

    // Calculate expected tap times
    expectedTaps.current = randomPattern.filter((note) => !note.isRest).map((note) => note.beat)
  }, [])

  // Handle spacebar press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Space" && isRecording) {
        event.preventDefault()
        const currentTime = Date.now()
        const elapsedTime = (currentTime - startTimeRef.current) / 1000
        const beatTime = (elapsedTime * bpm) / 60

        setUserTaps((prev) => [...prev, { timestamp: currentTime, beat: beatTime }])
      }
    },
    [isRecording, bpm],
  )

  // Set up keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // Calculate accuracy
  const calculateAccuracy = useCallback(() => {
    if (userTaps.length === 0 || expectedTaps.current.length === 0) {
      setAccuracy(0)
      setVerdict("No taps recorded")
      return
    }

    const tolerance = 0.1 // 0.1 beat tolerance
    let correctTaps = 0
    const totalExpected = expectedTaps.current.length

    expectedTaps.current.forEach((expectedBeat) => {
      const closestTap = userTaps.reduce((closest, tap) => {
        const distance = Math.abs(tap.beat - expectedBeat)
        const closestDistance = Math.abs(closest.beat - expectedBeat)
        return distance < closestDistance ? tap : closest
      }, userTaps[0])

      if (closestTap && Math.abs(closestTap.beat - expectedBeat) <= tolerance) {
        correctTaps++
      }
    })

    const accuracyPercent = Math.round((correctTaps / totalExpected) * 100)
    setAccuracy(accuracyPercent)

    // Set verdict based on accuracy
    if (accuracyPercent >= 90) {
      setVerdict("Tight")
    } else if (accuracyPercent >= 70) {
      setVerdict("Good")
    } else {
      setVerdict("Loose")
    }
  }, [userTaps])

  // Start rhythm playback
  const startPlayback = () => {
    setIsPlaying(true)
    setCurrentBeat(0)
    startTimeRef.current = Date.now()

    const beatDuration = (60 / bpm) * 1000 // ms per beat

    intervalRef.current = setInterval(() => {
      setCurrentBeat((prev) => {
        const next = prev + 0.1
        if (next >= 4) {
          setIsPlaying(false)
          setIsRecording(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          return 0
        }
        return next
      })
    }, beatDuration / 10)
  }

  // Start recording
  const startRecording = () => {
    setUserTaps([])
    setAccuracy(null)
    setVerdict("")
    setIsRecording(true)
    startPlayback()
  }

  // Stop everything
  const stop = () => {
    setIsPlaying(false)
    setIsRecording(false)
    setCurrentBeat(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (userTaps.length > 0) {
      calculateAccuracy()
    }
  }

  // Reset
  const reset = () => {
    stop()
    setUserTaps([])
    setAccuracy(null)
    setVerdict("")
    generatePattern()
  }

  // Initialize with a pattern
  useEffect(() => {
    generatePattern()
  }, [generatePattern])

  // Calculate accuracy when recording stops
  useEffect(() => {
    if (!isRecording && userTaps.length > 0) {
      calculateAccuracy()
    }
  }, [isRecording, userTaps, calculateAccuracy])

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Tight":
        return "text-green-400"
      case "Good":
        return "text-yellow-400"
      case "Loose":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  useEffect(() => {
    if (demoMode) {
      setAccuracy(85)
      setVerdict("Good")
      setCurrentBeat(2.5)
    }
  }, [demoMode])

  return (
    <Card className="w-full max-w-4xl bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center font-mono">
          <MdKeyboard className="mr-2 h-5 w-5 text-orange-500" />
          Rhythm Trainer
        </CardTitle>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-orange-500 text-orange-500 font-mono">
            {bpm} BPM
          </Badge>
          {accuracy !== null && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 font-mono">Accuracy:</span>
              <span className="text-orange-500 font-bold font-mono">{accuracy}%</span>
              <span className={`font-bold font-mono ${getVerdictColor(verdict)}`}>{verdict}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rhythm Notation */}
        <RhythmNotation pattern={pattern} currentBeat={currentBeat} />

        {/* Progress Bar */}
        {isPlaying && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-gray-400">Progress</span>
              <span className="text-orange-500">{Math.round((currentBeat / 4) * 100)}%</span>
            </div>
            <Progress value={(currentBeat / 4) * 100} className="h-2" />
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={startRecording}
            disabled={isPlaying || isRecording}
            className="bg-orange-600 hover:bg-orange-700 font-mono"
          >
            <MdPlayArrow className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
          <Button
            onClick={stop}
            disabled={!isPlaying && !isRecording}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 font-mono"
          >
            <MdStop className="mr-2 h-4 w-4" />
            Stop
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 font-mono"
          >
            <MdRefresh className="mr-2 h-4 w-4" />
            New Pattern
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h4 className="text-blue-400 font-semibold mb-2 font-mono">Instructions</h4>
          <ul className="text-sm text-gray-300 space-y-1 font-mono">
            <li>• Press &quot;Start Recording&quot; to begin</li>
            <li>• Tap SPACEBAR to match the rhythm shown</li>
            <li>• Don&apos;t tap during rests (empty spaces)</li>
            <li>• Orange line shows current beat position</li>
            <li>• Accuracy is calculated when recording stops</li>
          </ul>
        </div>

        {/* Tap History */}
        {userTaps.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-semibold mb-3 font-mono">Your Taps</h4>
            <div className="grid grid-cols-4 gap-2 text-sm font-mono">
              {userTaps.map((tap, index) => (
                <div key={index} className="text-gray-300">
                  <span className="text-orange-400">Tap {index + 1}:</span> Beat {tap.beat.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
