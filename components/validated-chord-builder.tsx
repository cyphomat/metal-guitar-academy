"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MdPlayArrow, MdStop, MdVolumeUp, MdWarning, MdError, MdInfo } from "react-icons/md"
import * as Tone from "tone"
import {
  validateChord,
  getAlternativeVoicings,
  CHORD_INTERVALS,
  NOTE_SEMITONES,
  type ChordPosition,
  type ChordValidationResult,
} from "@/utils/music-theory-validator"

// Enhanced chord definitions with proper music theory
const chordDefinitions = {
  major: { name: "Major", symbol: "", description: "Happy, bright sound" },
  minor: { name: "Minor", symbol: "m", description: "Sad, dark sound" },
  diminished: { name: "Diminished", symbol: "°", description: "Tense, unstable sound" },
  augmented: { name: "Augmented", symbol: "+", description: "Mysterious, floating sound" },
  sus2: { name: "Suspended 2nd", symbol: "sus2", description: "Open, unresolved sound" },
  sus4: { name: "Suspended 4th", symbol: "sus4", description: "Tension seeking resolution" },
  major7: { name: "Major 7th", symbol: "maj7", description: "Jazzy, sophisticated sound" },
  minor7: { name: "Minor 7th", symbol: "m7", description: "Smooth, mellow sound" },
  dominant7: { name: "Dominant 7th", symbol: "7", description: "Bluesy, wants to resolve" },
} as const

type ChordType = keyof typeof chordDefinitions

interface ValidatedChordBuilderProps {
  showValidation?: boolean
}

export function ValidatedChordBuilder({ showValidation = true }: ValidatedChordBuilderProps) {
  const [rootNote, setRootNote] = useState<string>("C")
  const [chordType, setChordType] = useState<ChordType>("major")
  const [chordPositions, setChordPositions] = useState<ChordPosition[]>([])
  const [validation, setValidation] = useState<ChordValidationResult | null>(null)
  const [alternativeVoicings, setAlternativeVoicings] = useState<ChordPosition[][]>([])
  const [selectedVoicing, setSelectedVoicing] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef<Tone.PolySynth | null>(null)

  // Initialize Tone.js
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination()

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  // Calculate chord positions and validate
  useEffect(() => {
    const voicings = getAlternativeVoicings(rootNote, chordType)
    setAlternativeVoicings(voicings)

    if (voicings.length > 0) {
      const currentVoicing = voicings[selectedVoicing] || voicings[0]
      setChordPositions(currentVoicing)

      if (showValidation) {
        const validationResult = validateChord(rootNote, chordType, currentVoicing)
        setValidation(validationResult)
      }
    }
  }, [rootNote, chordType, selectedVoicing, showValidation])

  // Play chord with accurate frequencies
  const playChord = async () => {
    if (!synthRef.current || chordPositions.length === 0) return

    try {
      await Tone.start()
      setIsPlaying(true)

      const frequencies = chordPositions.map((pos) => pos.frequency)
      synthRef.current.triggerAttackRelease(frequencies, "2n")

      setTimeout(() => setIsPlaying(false), 2000)
    } catch (error) {
      console.error("Error playing chord:", error)
      setIsPlaying(false)
    }
  }

  const stopChord = () => {
    if (synthRef.current) {
      synthRef.current.releaseAll()
      setIsPlaying(false)
    }
  }

  const chordDef = chordDefinitions[chordType]
  const chordSymbol = `${rootNote}${chordDef.symbol}`

  return (
    <Card className="w-full max-w-4xl bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center font-mono">
          <MdVolumeUp className="mr-2 h-5 w-5 text-orange-500" />
          Validated Chord Builder
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Music theory validated chord construction with accurate fretboard positions
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 font-mono">Root Note</label>
            <Select value={rootNote} onValueChange={setRootNote}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Object.keys(NOTE_SEMITONES).map((note) => (
                  <SelectItem key={note} value={note} className="text-white hover:bg-gray-700 font-mono">
                    {note}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 font-mono">Chord Type</label>
            <Select value={chordType} onValueChange={(value) => setChordType(value as ChordType)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Object.entries(chordDefinitions).map(([key, def]) => (
                  <SelectItem key={key} value={key} className="text-white hover:bg-gray-700 font-mono">
                    {def.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 font-mono">Voicing</label>
            <Select
              value={selectedVoicing.toString()}
              onValueChange={(value) => setSelectedVoicing(Number.parseInt(value))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {alternativeVoicings.map((_, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-white hover:bg-gray-700 font-mono">
                    Voicing {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chord Display */}
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-bold text-orange-500 font-mono">{chordSymbol}</h3>
          <p className="text-gray-400 text-sm">{chordDef.description}</p>
          <div className="flex justify-center space-x-4 text-sm font-mono">
            {CHORD_INTERVALS[chordType].map((interval, index) => {
              const intervalNames = ["R", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"]
              return (
                <div key={index} className="text-gray-300">
                  <span className="text-orange-400">{intervalNames[interval] || `+${interval}`}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Validation Results */}
        {showValidation && validation && (
          <div className="space-y-2">
            {validation.errors.length > 0 && (
              <Alert className="border-red-500/50 bg-red-900/20">
                <MdError className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  <strong>Errors:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.warnings.length > 0 && (
              <Alert className="border-yellow-500/50 bg-yellow-900/20">
                <MdWarning className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  <strong>Warnings:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.suggestions.length > 0 && (
              <Alert className="border-blue-500/50 bg-blue-900/20">
                <MdInfo className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-400">
                  <strong>Suggestions:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {validation.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Chord Positions Table */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-semibold mb-3 font-mono">Chord Positions</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 p-2">String</th>
                  <th className="text-left text-gray-400 p-2">Fret</th>
                  <th className="text-left text-gray-400 p-2">Note</th>
                  <th className="text-left text-gray-400 p-2">Interval</th>
                  <th className="text-left text-gray-400 p-2">Frequency (Hz)</th>
                </tr>
              </thead>
              <tbody>
                {chordPositions.map((pos, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="text-gray-300 p-2">{pos.string + 1}</td>
                    <td className="text-gray-300 p-2">{pos.fret}</td>
                    <td className="text-orange-400 p-2">{pos.note}</td>
                    <td className="text-blue-400 p-2">{pos.interval}</td>
                    <td className="text-gray-300 p-2">{pos.frequency.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={playChord}
            disabled={isPlaying || chordPositions.length === 0}
            className="bg-orange-600 hover:bg-orange-700 font-mono"
          >
            <MdPlayArrow className="mr-2 h-4 w-4" />
            Play Chord
          </Button>
          <Button
            onClick={stopChord}
            disabled={!isPlaying}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 font-mono"
          >
            <MdStop className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>

        {/* Validation Status */}
        {showValidation && validation && (
          <div className="text-center">
            <Badge
              variant={validation.isValid ? "default" : "destructive"}
              className={validation.isValid ? "bg-green-600" : "bg-red-600"}
            >
              {validation.isValid ? "✓ Valid Chord" : "⚠ Issues Found"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
