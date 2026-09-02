"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BeatIndicator } from "@/components/session/beat-indicator"
import { MicPanel } from "@/components/session/mic-panel"
import { TabView } from "@/components/session/tab-view"
import { TimingReport } from "@/components/session/timing-report"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { useCountdown } from "@/hooks/use-countdown"
import { useMetronome } from "@/hooks/use-metronome"
import { useOnsetMic } from "@/hooks/use-onset-mic"
import { analyseTiming, suggestRating, type TimingAnalysis } from "@/lib/audio/timing"
import { RATINGS, TECHNIQUE_LABELS, type Rating, type SessionBlock, type TimingResult } from "@/lib/session/types"
import { MdPause, MdPlayArrow, MdSkipNext } from "react-icons/md"

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${`${seconds % 60}`.padStart(2, "0")}`
}

export interface BlockOutcome {
  bpm: number
  rating: Rating
  seconds: number
  timing?: TimingResult
}

export interface BlockRunnerProps {
  block: SessionBlock
  index: number
  total: number
  onComplete: (outcome: BlockOutcome) => void
}

export function BlockRunner({ block, index, total, onComplete }: BlockRunnerProps) {
  const { drill } = block
  const [phase, setPhase] = useState<"play" | "rate">("play")
  const [analysis, setAnalysis] = useState<TimingAnalysis | null>(null)
  const [suggested, setSuggested] = useState<Rating | null>(null)
  const [hitCount, setHitCount] = useState(0)

  const engine = useAudioEngine()
  const mic = useOnsetMic(engine)

  /** Click times the player was asked to hit, on the shared audio clock. */
  const clickTimesRef = useRef<number[]>([])

  const metronome = useMetronome(engine, {
    bpm: block.bpm,
    beatsPerBar: drill.beatsPerBar,
    subdivision: drill.subdivision,
    onTick: (tick) => {
      clickTimesRef.current.push(tick.time)
      // Only meaningful while the mic is on; cheap enough to keep live.
      setHitCount(mic.onsets().length)
    },
  })

  const { stop: stopMetronome } = metronome
  const { onsets, disable: disableMic } = mic

  const finishPlaying = useCallback(() => {
    stopMetronome()

    const expected = clickTimesRef.current
    const heard = onsets()

    if (expected.length > 0 && heard.length > 0) {
      // Half a click is the widest a note can be off and still be that note;
      // 120 ms caps it so a slow tempo does not accept anything.
      const tolerance = Math.min(0.12, (60 / metronome.bpm / drill.subdivision) * 0.4)
      const result = analyseTiming(heard, expected, { toleranceSeconds: tolerance })
      setAnalysis(result)
      setSuggested(suggestRating(result))
    }

    disableMic()
    setPhase("rate")
  }, [disableMic, drill.subdivision, metronome.bpm, onsets, stopMetronome])

  const timer = useCountdown(block.seconds, finishPlaying)
  const { pause: pauseTimer } = timer

  useEffect(() => {
    return () => {
      stopMetronome()
      pauseTimer()
      disableMic()
    }
  }, [disableMic, pauseTimer, stopMetronome])

  const toggle = async () => {
    if (timer.isRunning) {
      timer.pause()
      metronome.stop()
    } else {
      // Each run measures itself: the clock and the onsets start together.
      clickTimesRef.current = []
      mic.reset()
      setHitCount(0)
      timer.start()
      await metronome.start()
    }
  }

  const toggleMic = async () => {
    if (mic.status === "listening") mic.disable()
    else await mic.enable()
  }

  const rate = (rating: Rating) => {
    onComplete({
      bpm: metronome.bpm,
      rating,
      seconds: Math.round(timer.elapsed),
      timing:
        analysis && analysis.hits > 0
          ? {
              hits: analysis.hits,
              expected: analysis.expected,
              spreadMs: analysis.spreadMs,
              offsetMs: analysis.offsetMs,
              score: analysis.score,
              trend: analysis.trend,
            }
          : undefined,
    })
  }

  const progress = block.seconds > 0 ? ((block.seconds - timer.remaining) / block.seconds) * 100 : 0

  if (phase === "rate") {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">
            Block {index + 1} von {total}
          </p>
          <h2 className="mt-1 text-3xl font-bold text-white">{drill.title}</h2>
          <p className="mt-2 text-gray-400">
            {formatClock(Math.round(timer.elapsed))} gespielt bei {metronome.bpm} BPM
          </p>
        </div>

        {analysis && <TimingReport analysis={analysis} />}

        <div>
          <h3 className="mb-4 text-lg font-semibold text-orange-500">Wie lief&apos;s?</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {RATINGS.map((option) => {
              const isSuggested = suggested === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => rate(option.value)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    isSuggested
                      ? "border-orange-500/70 bg-orange-950/30 hover:bg-orange-950/50"
                      : "border-gray-800 bg-gray-900/50 hover:border-orange-500/60 hover:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">{option.label}</span>
                    {isSuggested && (
                      <span className="text-xs uppercase tracking-wider text-orange-500">
                        gemessen
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">{option.hint}</div>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {suggested
              ? "Vorgeschlagen aus dem gemessenen Timing — überstimm es, wenn es sich anders angefühlt hat."
              : "Ehrlich antworten — daraus kommt das Tempo für das nächste Mal."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">
            Block {index + 1} von {total}
          </p>
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
            <div className="font-mono text-5xl font-bold tabular-nums text-orange-500">
              {metronome.bpm}
            </div>
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
          <Button
            onClick={finishPlaying}
            size="lg"
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            <MdSkipNext className="mr-2 h-5 w-5" /> Block beenden
          </Button>
          <BeatIndicator beatInBar={metronome.beatInBar} beatsPerBar={drill.beatsPerBar} />
        </div>
      </div>

      <MicPanel
        status={mic.status}
        detail={mic.detail}
        level={mic.level}
        hits={hitCount}
        onToggle={toggleMic}
      />

      {drill.tab && <TabView tab={drill.tab} />}

      {drill.why && (
        <details className="rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300">
            Warum das so ist
          </summary>
          <p className="mt-3 text-gray-300">{drill.why}</p>
        </details>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-500">
          Worauf achten
        </h3>
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
