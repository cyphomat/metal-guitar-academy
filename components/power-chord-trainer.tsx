"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { MdPlayArrow, MdStop, MdShuffle, MdVolumeUp } from "react-icons/md"

// Power chord data
const powerChords = [
  { name: "E5", root: "E", string: "E", fret: 0, tabNotation: "0-2" },
  { name: "F5", root: "F", string: "E", fret: 1, tabNotation: "1-3" },
  { name: "F#5", root: "F#", string: "E", fret: 2, tabNotation: "2-4" },
  { name: "G5", root: "G", string: "E", fret: 3, tabNotation: "3-5" },
  { name: "G#5", root: "G#", string: "E", fret: 4, tabNotation: "4-6" },
  { name: "A5", root: "A", string: "A", fret: 0, tabNotation: "0-2" },
  { name: "A#5", root: "A#", string: "A", fret: 1, tabNotation: "1-3" },
  { name: "B5", root: "B", string: "A", fret: 2, tabNotation: "2-4" },
  { name: "C5", root: "C", string: "A", fret: 3, tabNotation: "3-5" },
  { name: "C#5", root: "C#", string: "A", fret: 4, tabNotation: "4-6" },
  { name: "D5", root: "D", string: "A", fret: 5, tabNotation: "5-7" },
  { name: "D#5", root: "D#", string: "A", fret: 6, tabNotation: "6-8" },
]

export function PowerChordTrainer() {
  const [currentChord, setCurrentChord] = useState(powerChords[0])
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false)
  const [bpm, setBpm] = useState([120])
  const [currentBeat, setCurrentBeat] = useState(0)
  const [barCount, setBarCount] = useState(0)

  // Audio context and metronome refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const nextNoteTimeRef = useRef(0)
  const lookAhead = 25.0 // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1 // How far ahead to schedule audio (sec)

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Generate random chord
  const generateRandomChord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * powerChords.length)
    setCurrentChord(powerChords[randomIndex])
  }, [])

  // Create click sound
  const playClick = useCallback((time: number, accent = false) => {
    if (!audioContextRef.current) return

    const osc = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()

    osc.connect(gain)
    gain.connect(audioContextRef.current.destination)

    osc.frequency.value = accent ? 1000 : 800
    gain.gain.setValueAtTime(0.1, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)

    osc.start(time)
    osc.stop(time + 0.1)
  }, [])

  // Metronome scheduler
  const scheduler = useCallback(() => {
    while (nextNoteTimeRef.current < audioContextRef.current!.currentTime + scheduleAheadTime) {
      const accent = currentBeat % 4 === 0
      playClick(nextNoteTimeRef.current, accent)

      const secondsPerBeat = 60.0 / bpm[0]
      nextNoteTimeRef.current += secondsPerBeat

      setCurrentBeat((prev) => {
        const newBeat = (prev + 1) % 16 // 4 bars of 4 beats
        if (newBeat === 0) {
          setBarCount((prevBar) => prevBar + 1)
        }
        return newBeat
      })
    }
  }, [bpm, currentBeat, playClick])

  // Start/stop metronome
  const toggleMetronome = useCallback(() => {
    if (!audioContextRef.current) return

    if (isMetronomeRunning) {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
        metronomeIntervalRef.current = null
      }
      setIsMetronomeRunning(false)
      setCurrentBeat(0)
      setBarCount(0)
    } else {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }

      setCurrentBeat(0)
      setBarCount(0)
      nextNoteTimeRef.current = audioContextRef.current.currentTime
      metronomeIntervalRef.current = setInterval(scheduler, lookAhead)
      setIsMetronomeRunning(true)
    }
  }, [isMetronomeRunning, scheduler])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
      }
    }
  }, [])

  // Generate VexTab notation
  const generateVexTab = () => {
    const { string, fret, tabNotation } = currentChord
    const stringNumber = string === "E" ? "6" : "5"

    return `
      options space=20
      tabstave notation=true
      notes :q ${stringNumber}/${fret} :q ${stringNumber}/${fret} :q ${stringNumber}/${fret} :q ${stringNumber}/${fret}
    `
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 rounded-xl max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MdVolumeUp className="mr-2 h-5 w-5 text-orange-500" />
          Power Chord Trainer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={generateRandomChord} className="bg-orange-600 hover:bg-orange-700 flex items-center">
            <MdShuffle className="mr-2 h-4 w-4" />
            Random Chord
          </Button>
          <Button
            onClick={toggleMetronome}
            variant={isMetronomeRunning ? "destructive" : "default"}
            className={isMetronomeRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isMetronomeRunning ? (
              <>
                <MdStop className="mr-2 h-4 w-4" />
                Stop Metronome
              </>
            ) : (
              <>
                <MdPlayArrow className="mr-2 h-4 w-4" />
                Start Metronome
              </>
            )}
          </Button>
        </div>

        {/* BPM Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">BPM</label>
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              {bpm[0]}
            </Badge>
          </div>
          <Slider value={bpm} onValueChange={setBpm} max={200} min={60} step={5} className="w-full" />
        </div>

        {/* Current Chord Display */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-orange-500">{currentChord.name}</h3>
            <p className="text-gray-300">
              Root note: <span className="font-semibold text-white">{currentChord.root}</span> on{" "}
              <span className="font-semibold text-white">{currentChord.string}-string</span>
            </p>
            <p className="text-sm text-gray-400">Fret: {currentChord.fret === 0 ? "Open" : currentChord.fret}</p>
          </div>
        </div>

        {/* Tab Notation Display */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-semibold mb-3">Tab Notation</h4>
          <div className="bg-black/30 rounded p-4 font-mono text-green-400 text-sm">
            <div className="space-y-1">
              <div>
                E|
                {currentChord.string === "E"
                  ? `--${currentChord.fret}--${currentChord.fret + 2}--${currentChord.fret}--${currentChord.fret + 2}--`
                  : "--------------------"}
              </div>
              <div>B|--------------------</div>
              <div>G|--------------------</div>
              <div>D|--------------------</div>
              <div>
                A|
                {currentChord.string === "A"
                  ? `--${currentChord.fret}--${currentChord.fret + 2}--${currentChord.fret}--${currentChord.fret + 2}--`
                  : "--------------------"}
              </div>
              <div>E|--------------------</div>
            </div>
            <div className="mt-2 text-xs text-gray-400">Pattern: {currentChord.tabNotation} (root-fifth)</div>
          </div>
        </div>

        {/* Metronome Status */}
        {isMetronomeRunning && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="text-sm text-gray-400">Beat</div>
                <div className="text-xl font-bold">{(currentBeat % 4) + 1}/4</div>
              </div>
              <div className="text-white">
                <div className="text-sm text-gray-400">Bar</div>
                <div className="text-xl font-bold">{Math.floor(currentBeat / 4) + 1}/4</div>
              </div>
              <div className="text-white">
                <div className="text-sm text-gray-400">Cycle</div>
                <div className="text-xl font-bold">{barCount + 1}</div>
              </div>
            </div>

            {/* Beat indicator */}
            <div className="flex space-x-2 mt-3">
              {[0, 1, 2, 3].map((beat) => (
                <div
                  key={beat}
                  className={`w-4 h-4 rounded-full border-2 ${
                    (currentBeat % 4) === beat
                      ? "bg-orange-500 border-orange-500"
                      : beat === 0
                        ? "border-orange-500"
                        : "border-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Practice Tips */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h4 className="text-blue-400 font-semibold mb-2">Practice Tips</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Start slow and focus on clean chord changes</li>
            <li>• Mute unused strings with your palm</li>
            <li>• Keep your fretting hand relaxed</li>
            <li>• Practice with downstrokes for authentic metal sound</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
