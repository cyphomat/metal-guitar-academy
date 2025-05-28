"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MdPlayArrow, MdStop, MdVolumeUp } from "react-icons/md"
import * as Tone from "tone"

// Note definitions
const notes = [
  { name: "A", semitone: 9 },
  { name: "A#/Bb", semitone: 10 },
  { name: "B", semitone: 11 },
  { name: "C", semitone: 0 },
  { name: "C#/Db", semitone: 1 },
  { name: "D", semitone: 2 },
  { name: "D#/Eb", semitone: 3 },
  { name: "E", semitone: 4 },
  { name: "F", semitone: 5 },
  { name: "F#/Gb", semitone: 6 },
  { name: "G", semitone: 7 },
  { name: "G#/Ab", semitone: 8 },
]

// Chord quality definitions
const chordQualities = {
  maj: { name: "Major", intervals: [0, 4, 7], labels: ["R", "3", "5"] },
  min: { name: "Minor", intervals: [0, 3, 7], labels: ["R", "♭3", "5"] },
  dim: { name: "Diminished", intervals: [0, 3, 6], labels: ["R", "♭3", "♭5"] },
  "7": { name: "Dominant 7", intervals: [0, 4, 7, 10], labels: ["R", "3", "5", "♭7"] },
  maj7: { name: "Major 7", intervals: [0, 4, 7, 11], labels: ["R", "3", "5", "7"] },
  min7: { name: "Minor 7", intervals: [0, 3, 7, 10], labels: ["R", "♭3", "5", "♭7"] },
  sus2: { name: "Suspended 2nd", intervals: [0, 2, 7], labels: ["R", "2", "5"] },
  sus4: { name: "Suspended 4th", intervals: [0, 5, 7], labels: ["R", "4", "5"] },
  add9: { name: "Add 9", intervals: [0, 4, 7, 14], labels: ["R", "3", "5", "9"] },
  min9: { name: "Minor 9", intervals: [0, 3, 7, 10, 14], labels: ["R", "♭3", "5", "♭7", "9"] },
  "9": { name: "Dominant 9", intervals: [0, 4, 7, 10, 14], labels: ["R", "3", "5", "♭7", "9"] },
  maj9: { name: "Major 9", intervals: [0, 4, 7, 11, 14], labels: ["R", "3", "5", "7", "9"] },
  "11": { name: "Dominant 11", intervals: [0, 4, 7, 10, 14, 17], labels: ["R", "3", "5", "♭7", "9", "11"] },
  "13": { name: "Dominant 13", intervals: [0, 4, 7, 10, 14, 17, 21], labels: ["R", "3", "5", "♭7", "9", "11", "13"] },
}

// String tuning (standard tuning in semitones from C)
const stringTuning = [4, 11, 7, 2, 9, 4] // E4, B3, G3, D3, A2, E2 (in semitones from C)

// Note names for display
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

interface ChordTone {
  string: number
  fret: number
  note: string
  interval: string
  frequency: number
}

interface MiniFretboardProps {
  chordTones: ChordTone[]
}

function MiniFretboard({ chordTones }: MiniFretboardProps) {
  const strings = 6
  const frets = 12
  const stringSpacing = 25
  const fretSpacing = 35

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <svg viewBox="0 0 460 170" className="w-full h-auto">
        {/* Fret lines */}
        {Array.from({ length: frets + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={i * fretSpacing + 40}
            y1={15}
            x2={i * fretSpacing + 40}
            y2={155}
            stroke="#4a5568"
            strokeWidth={i === 0 ? "3" : "1"}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: strings }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={40}
            y1={25 + i * stringSpacing}
            x2={460}
            y2={25 + i * stringSpacing}
            stroke="#6b7280"
            strokeWidth="1.5"
          />
        ))}

        {/* Fret markers */}
        {[3, 5, 7, 9].map((fret) => (
          <circle key={`marker-${fret}`} cx={fret * fretSpacing + 22.5} cy={85} r="2" fill="#6b7280" />
        ))}

        {/* Double dot marker for 12th fret */}
        <circle cx={12 * fretSpacing + 22.5} cy={70} r="2" fill="#6b7280" />
        <circle cx={12 * fretSpacing + 22.5} cy={100} r="2" fill="#6b7280" />

        {/* Fret numbers */}
        {Array.from({ length: frets }, (_, i) => (
          <text
            key={`fret-num-${i + 1}`}
            x={(i + 1) * fretSpacing + 22.5}
            y={12}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="9"
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
            y={29 + i * stringSpacing}
            textAnchor="middle"
            fill="#f3f4f6"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {note}
          </text>
        ))}

        {/* Chord tones */}
        {chordTones.map((tone, index) => {
          const colors = ["#ea580c", "#3b82f6", "#10b981", "#f59e0b"] // Orange, Blue, Green, Yellow
          const color = colors[index % colors.length]

          return (
            <g key={`tone-${index}`}>
              <circle
                cx={tone.fret * fretSpacing + 22.5}
                cy={25 + tone.string * stringSpacing}
                r="8"
                fill={color}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <text
                x={tone.fret * fretSpacing + 22.5}
                y={29 + tone.string * stringSpacing}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {tone.interval}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Function to validate interval calculations
const validateInterval = (interval: number): number => {
  return interval >= 0 ? interval % 12 : (interval % 12) + 12
}

export function ChordBuilder() {
  const [rootNote, setRootNote] = useState("C")
  const [chordQuality, setChordQuality] = useState<keyof typeof chordQualities>("maj")
  const [chordTones, setChordTones] = useState<ChordTone[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef<Tone.PolySynth | null>(null)

  // Initialize Tone.js
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination()

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  // Calculate chord tones on fretboard
  const calculateChordTones = (root: string, quality: keyof typeof chordQualities): ChordTone[] => {
    const rootSemitone = notes.find((n) => n.name === root)?.semitone || 0
    const chordDef = chordQualities[quality]
    const tones: ChordTone[] = []

    // Calculate the semitones for each chord tone
    const chordSemitones = chordDef.intervals.map((interval) => validateInterval(rootSemitone + interval))

    // Find positions on fretboard for each chord tone
    chordSemitones.forEach((semitone, index) => {
      // Look for this note on each string (first 5 frets for compact display)
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret <= 5; fret++) {
          const fretSemitone = validateInterval(stringTuning[string] + fret)
          if (fretSemitone === semitone) {
            // Only add if we don't already have this chord tone
            const alreadyExists = tones.some((t) => t.interval === chordDef.labels[index])
            if (!alreadyExists) {
              const noteName = noteNames[semitone]
              let octave = Math.floor((stringTuning[string] + fret) / 12) + 4

              // Octave validation
              if (octave < 0) {
                console.warn("Octave is less than 0, adjusting to 0")
                octave = 0
              } else if (octave > 8) {
                console.warn("Octave is greater than 8, adjusting to 8")
                octave = 8
              }

              const frequency = Tone.Frequency(`${noteName}${octave}`).toFrequency()

              // Fretboard position validation
              if (fret < 0 || fret > 24) {
                console.warn(`Invalid fret position: ${fret}. Skipping note.`)
                continue
              }

              tones.push({
                string,
                fret,
                note: noteName,
                interval: chordDef.labels[index],
                frequency,
              })
              break
            }
          }
        }
      }
    })

    return tones.sort((a, b) => a.string - b.string)
  }

  // Update chord tones when root or quality changes
  useEffect(() => {
    const tones = calculateChordTones(rootNote, chordQuality)
    setChordTones(tones)
  }, [rootNote, chordQuality])

  // Play chord
  const playChord = async () => {
    if (!synthRef.current || chordTones.length === 0) return

    try {
      await Tone.start()
      setIsPlaying(true)

      const frequencies = chordTones.map((tone) => tone.frequency)
      synthRef.current.triggerAttackRelease(frequencies, "2n")

      // Stop playing state after 2 seconds
      setTimeout(() => {
        setIsPlaying(false)
      }, 2000)
    } catch (error) {
      console.error("Error playing chord:", error)
      setIsPlaying(false)
    }
  }

  // Stop chord
  const stopChord = () => {
    if (synthRef.current) {
      synthRef.current.releaseAll()
      setIsPlaying(false)
    }
  }

  const currentChord = chordQualities[chordQuality]
  const chordName = `${rootNote} ${currentChord.name}`

  return (
    <Card className="w-full max-w-2xl bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center font-mono">
          <MdVolumeUp className="mr-2 h-5 w-5 text-orange-500" />
          Chord Builder
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 font-mono">Root Note</label>
            <Select value={rootNote} onValueChange={setRootNote}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {notes.map((note) => (
                  <SelectItem key={note.name} value={note.name} className="text-white hover:bg-gray-700 font-mono">
                    {note.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 font-mono">Quality</label>
            <Select
              value={chordQuality}
              onValueChange={(value) => setChordQuality(value as keyof typeof chordQualities)}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Object.entries(chordQualities).map(([key, quality]) => (
                  <SelectItem key={key} value={key} className="text-white hover:bg-gray-700 font-mono">
                    {quality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chord Display */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-orange-500 font-mono">{chordName}</h3>
          <div className="flex justify-center space-x-4 text-sm font-mono">
            {currentChord.labels.map((label, index) => (
              <div key={index} className="text-gray-300">
                <span className="text-orange-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Fretboard */}
        <MiniFretboard chordTones={chordTones} />

        {/* Chord Tones List */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-semibold mb-3 font-mono">Chord Tones</h4>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            {chordTones.map((tone, index) => {
              const colors = ["text-orange-400", "text-blue-400", "text-green-400", "text-yellow-400"]
              const colorClass = colors[index % colors.length]

              return (
                <div key={index} className="flex justify-between text-gray-300">
                  <span className={colorClass}>{tone.interval}:</span>
                  <span>
                    {tone.note} (String {tone.string + 1}, Fret {tone.fret})
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={playChord}
            disabled={isPlaying || chordTones.length === 0}
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

        {/* Instructions */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h4 className="text-blue-400 font-semibold mb-2 font-mono">How to Use</h4>
          <ul className="text-sm text-gray-300 space-y-1 font-mono">
            <li>• Select a root note and chord quality</li>
            <li>• View chord tones on the mini fretboard</li>
            <li>• Interval labels show the chord structure</li>
            <li>• Click "Play Chord" to hear the harmony</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
