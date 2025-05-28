"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MdNavigateNext, MdNavigateBefore, MdMusicNote } from "react-icons/md"

// A Minor Pentatonic Scale Notes
const pentatonicNotes = ["A", "C", "D", "E", "G"]

// All notes on the fretboard
const allNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

// String tuning (standard tuning)
const stringTuning = ["E", "B", "G", "D", "A", "E"] // High E to Low E

// Get note at specific string and fret
const getNoteAtPosition = (stringIndex: number, fret: number): string => {
  const openNote = stringTuning[stringIndex]
  const openNoteIndex = allNotes.indexOf(openNote)
  const noteIndex = (openNoteIndex + fret) % 12
  return allNotes[noteIndex]
}

// Check if note is in pentatonic scale
const isPentatonicNote = (note: string): boolean => {
  return pentatonicNotes.includes(note)
}

// Pentatonic box patterns (fret ranges for each box)
const pentatonicBoxes = {
  1: { name: "Box 1", startFret: 5, endFret: 8, rootFret: 5 },
  2: { name: "Box 2", startFret: 7, endFret: 10, rootFret: 8 },
  3: { name: "Box 3", startFret: 10, endFret: 13, rootFret: 10 },
  4: { name: "Box 4", startFret: 12, endFret: 15, rootFret: 12 },
  5: { name: "Box 5", startFret: 15, endFret: 18, rootFret: 17 },
}

// Check if position is in current box pattern
const isInBoxPattern = (stringIndex: number, fret: number, boxNumber: number): boolean => {
  const box = pentatonicBoxes[boxNumber as keyof typeof pentatonicBoxes]
  if (fret < box.startFret || fret > box.endFret) return false

  const note = getNoteAtPosition(stringIndex, fret)
  return isPentatonicNote(note)
}

// Check if position is root note
const isRootNote = (stringIndex: number, fret: number): boolean => {
  const note = getNoteAtPosition(stringIndex, fret)
  return note === "A"
}

export function PentatonicVisualizer() {
  const [currentBox, setCurrentBox] = useState(1)
  const [hoveredPosition, setHoveredPosition] = useState<{ string: number; fret: number } | null>(null)

  const nextBox = () => {
    setCurrentBox((prev) => (prev === 5 ? 1 : prev + 1))
  }

  const prevBox = () => {
    setCurrentBox((prev) => (prev === 1 ? 5 : prev - 1))
  }

  const currentBoxInfo = pentatonicBoxes[currentBox as keyof typeof pentatonicBoxes]

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <Card className="bg-gray-900/50 border-gray-800 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <MdMusicNote className="mr-2 h-5 w-5 text-orange-500" />
              Pentatonic Visualizer
            </CardTitle>
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              A Minor
            </Badge>
          </div>
          <p className="text-gray-400">Interactive fretboard showing pentatonic scale patterns</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Box Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={prevBox} size="sm" variant="outline" className="border-gray-600">
                <MdNavigateBefore className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <div className="text-white font-semibold">{currentBoxInfo.name}</div>
                <div className="text-sm text-gray-400">
                  Frets {currentBoxInfo.startFret}-{currentBoxInfo.endFret}
                </div>
              </div>
              <Button onClick={nextBox} size="sm" variant="outline" className="border-gray-600">
                <MdNavigateNext className="h-4 w-4" />
              </Button>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-300">Root (A)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Scale Notes</span>
              </div>
            </div>
          </div>

          {/* Fretboard SVG */}
          <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
            <svg viewBox="0 0 1200 300" className="w-full h-auto max-w-full" style={{ minWidth: "800px" }}>
              {/* Fret lines */}
              {Array.from({ length: 25 }, (_, i) => (
                <line
                  key={`fret-${i}`}
                  x1={i * 48 + 50}
                  y1={20}
                  x2={i * 48 + 50}
                  y2={280}
                  stroke="#4a5568"
                  strokeWidth={i === 0 ? "3" : "1"}
                />
              ))}

              {/* String lines */}
              {Array.from({ length: 6 }, (_, i) => (
                <line
                  key={`string-${i}`}
                  x1={50}
                  y1={40 + i * 40}
                  x2={1150}
                  y2={40 + i * 40}
                  stroke="#6b7280"
                  strokeWidth="2"
                />
              ))}

              {/* Fret markers */}
              {[3, 5, 7, 9, 15, 17, 19, 21].map((fret) => (
                <circle key={`marker-${fret}`} cx={fret * 48 + 26} cy={150} r="4" fill="#6b7280" />
              ))}

              {/* Double dot markers for 12th fret */}
              <circle cx={12 * 48 + 26} cy={120} r="4" fill="#6b7280" />
              <circle cx={12 * 48 + 26} cy={180} r="4" fill="#6b7280" />

              {/* Fret numbers */}
              {Array.from({ length: 24 }, (_, i) => (
                <text
                  key={`fret-num-${i + 1}`}
                  x={(i + 1) * 48 + 26}
                  y={15}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="12"
                  fontFamily="monospace"
                >
                  {i + 1}
                </text>
              ))}

              {/* String names */}
              {stringTuning.map((note, i) => (
                <text
                  key={`string-name-${i}`}
                  x={25}
                  y={45 + i * 40}
                  textAnchor="middle"
                  fill="#f3f4f6"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {note}
                </text>
              ))}

              {/* Scale notes */}
              {Array.from({ length: 6 }, (_, stringIndex) =>
                Array.from({ length: 24 }, (_, fretIndex) => {
                  const fret = fretIndex + 1
                  const isInPattern = isInBoxPattern(stringIndex, fret, currentBox)
                  const isRoot = isRootNote(stringIndex, fret)
                  const note = getNoteAtPosition(stringIndex, fret)

                  if (!isInPattern) return null

                  return (
                    <g key={`note-${stringIndex}-${fret}`}>
                      <circle
                        cx={fret * 48 + 26}
                        cy={40 + stringIndex * 40}
                        r="12"
                        fill={isRoot ? "#ea580c" : "#3b82f6"}
                        stroke={isRoot ? "#fb923c" : "#60a5fa"}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200 hover:r-14"
                        onMouseEnter={() => setHoveredPosition({ string: stringIndex, fret })}
                        onMouseLeave={() => setHoveredPosition(null)}
                      />
                      <text
                        x={fret * 48 + 26}
                        y={45 + stringIndex * 40}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {note}
                      </text>
                    </g>
                  )
                }),
              )}

              {/* Hover tooltip */}
              {hoveredPosition && (
                <g>
                  <rect
                    x={hoveredPosition.fret * 48 + 10}
                    y={10 + hoveredPosition.string * 40}
                    width="32"
                    height="20"
                    fill="#1f2937"
                    stroke="#ea580c"
                    strokeWidth="1"
                    rx="4"
                  />
                  <text
                    x={hoveredPosition.fret * 48 + 26}
                    y={23 + hoveredPosition.string * 40}
                    textAnchor="middle"
                    fill="#ea580c"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {getNoteAtPosition(hoveredPosition.string, hoveredPosition.fret)}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Box Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">{currentBoxInfo.name} Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="text-white">
                      Frets {currentBoxInfo.startFret}-{currentBoxInfo.endFret}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Root Position:</span>
                    <span className="text-orange-500">Fret {currentBoxInfo.rootFret}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scale:</span>
                    <span className="text-white">A Minor Pentatonic</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Notes:</span>
                    <span className="text-white">{pentatonicNotes.join(" - ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 text-lg">Practice Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Start with Box 1 - it's the most common</li>
                  <li>• Practice connecting adjacent boxes</li>
                  <li>• Focus on root note positions (orange)</li>
                  <li>• Use alternate picking for smooth runs</li>
                  <li>• Practice scales ascending and descending</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick Box Navigation */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((boxNum) => (
              <Button
                key={boxNum}
                onClick={() => setCurrentBox(boxNum)}
                size="sm"
                variant={currentBox === boxNum ? "default" : "outline"}
                className={
                  currentBox === boxNum
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "border-gray-600 hover:border-orange-500"
                }
              >
                {boxNum}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
