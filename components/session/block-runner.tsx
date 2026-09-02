"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BeatIndicator } from "@/components/session/beat-indicator"
import { TabView } from "@/components/session/tab-view"
import { useCountdown } from "@/hooks/use-countdown"
import { useMetronome } from "@/hooks/use-metronome"
import { RATINGS, TECHNIQUE_LABELS, type Rating, type SessionBlock } from "@/lib/session/types"
import { MdPause, MdPlayArrow, MdSkipNext } from "react-icons/md"

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${`${seconds % 60}`.padStart(2, "0")}`
}

export interface BlockRunnerProps {
  block: SessionBlock
  index: number
  total: number
  onComplete: (outcome: { bpm: number; rating: Rating; seconds: number }) => void
}

export function BlockRunner({ block, index, total, onComplete }: BlockRunnerProps) {
  const { drill } = block
  const [phase, setPhase] = useState<"play" | "rate">("play")

  const metronome = useMetronome(block.bpm, drill.beatsPerBar, drill.subdivision)
  const { stop: stopMetronome } = metronome

  const finishPlaying = useCallback(() => {
    stopMetronome()
    setPhase("rate")
  }, [stopMetronome])

  const timer = useCountdown(block.seconds, finishPlaying)
  const { pause: pauseTimer } = timer

  // The parent keys this component per block, so a new block remounts it and
  // the tempo comes from the plan rather than from the previous block.
  useEffect(() => {
    return () => {
      stopMetronome()
      pauseTimer()
    }
  }, [pauseTimer, stopMetronome])

  const toggle = async () => {
    if (timer.isRunning) {
      timer.pause()
      metronome.stop()
    } else {
      timer.start()
      await metronome.start()
    }
  }

  const rate = (rating: Rating) => {
    onComplete({
      bpm: metronome.bpm,
      rating,
      seconds: Math.round(timer.elapsed),
    })
  }

  const progress = block.seconds > 0 ? ((block.seconds - timer.remaining) / block.seconds) * 100 : 0

  if (phase === "rate") {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">Block {index + 1} von {total}</p>
          <h2 className="mt-1 text-3xl font-bold text-white">{drill.title}</h2>
          <p className="mt-2 text-gray-400">
            {formatClock(Math.round(timer.elapsed))} gespielt bei {metronome.bpm} BPM
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-orange-500">Wie lief&apos;s?</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {RATINGS.map((option) => (
              <button
                key={option.value}
                onClick={() => rate(option.value)}
                className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-left transition-colors hover:border-orange-500/60 hover:bg-gray-900"
              >
                <div className="font-semibold text-white">{option.label}</div>
                <div className="mt-1 text-sm text-gray-400">{option.hint}</div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Ehrlich antworten — daraus kommt das Tempo für das nächste Mal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">Block {index + 1} von {total}</p>
          <h2 className="mt-1 text-3xl font-bold text-white">{drill.title}</h2>
          <p className="mt-1 text-gray-400">{drill.goal}</p>
        </div>
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          {TECHNIQUE_LABELS[drill.technique]}
        </Badge>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="font-mono text-6xl font-bold tabular-nums text-white">
              {formatClock(timer.remaining)}
            </div>
            <Progress value={progress} className="mt-3 h-2 w-48" />
          </div>

          <div className="text-right">
            <div className="font-mono text-5xl font-bold tabular-nums text-orange-500">{metronome.bpm}</div>
            <div className="text-sm uppercase tracking-wider text-gray-500">BPM</div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-gray-300"
                onClick={() => metronome.setBpm(metronome.bpm - drill.bpmStep)}
              >
                −{drill.bpmStep}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-gray-300"
                onClick={() => metronome.setBpm(metronome.bpm + drill.bpmStep)}
              >
                +{drill.bpmStep}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button onClick={toggle} size="lg" className="bg-orange-600 hover:bg-orange-700">
            {timer.isRunning ? (
              <>
                <MdPause className="mr-2 h-5 w-5" /> Pause
              </>
            ) : (
              <>
                <MdPlayArrow className="mr-2 h-5 w-5" /> {timer.elapsed > 0 ? "Weiter" : "Los"}
              </>
            )}
          </Button>
          <Button onClick={finishPlaying} size="lg" variant="outline" className="border-gray-700 text-gray-300">
            <MdSkipNext className="mr-2 h-5 w-5" /> Block beenden
          </Button>
          <BeatIndicator beatInBar={metronome.beatInBar} beatsPerBar={drill.beatsPerBar} />
        </div>
      </div>

      {drill.tab && <TabView tab={drill.tab} />}

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-500">Worauf achten</h3>
        <ul className="space-y-2">
          {drill.cues.map((cue) => (
            <li key={cue} className="flex items-start text-gray-300">
              <span className="mr-3 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
