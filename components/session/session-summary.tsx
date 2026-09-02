"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DRILLS_BY_ID } from "@/lib/session/drills"
import { progressFor, streakDays } from "@/lib/session/progress"
import type { DrillResult, PracticeLog } from "@/lib/session/types"
import { MdAdd, MdCheckCircle } from "react-icons/md"

export interface SessionSummaryProps {
  results: DrillResult[]
  /** The log *before* this session, for before/after comparison. */
  previousLog: PracticeLog
  log: PracticeLog
  onExtend: () => void
}

interface Improvement {
  title: string
  /** null when this is the first clean round of the drill. */
  from: number | null
  to: number
}

/** Personal bests set during this session, so the wrap-up shows real news. */
function improvements(results: DrillResult[], previousLog: PracticeLog): Improvement[] {
  return results.flatMap((result) => {
    if (result.rating < 3) return []
    const drill = DRILLS_BY_ID[result.drillId]
    if (!drill) return []

    const before = progressFor(previousLog, result.drillId).bestBpm
    if (before !== null && result.bpm <= before) return []

    return [{ title: drill.title, from: before, to: result.bpm }]
  })
}

export function SessionSummary({ results, previousLog, log, onExtend }: SessionSummaryProps) {
  const minutes = Math.max(1, Math.round(results.reduce((sum, r) => sum + r.seconds, 0) / 60))
  const minutesLabel = minutes === 1 ? "1 Minute" : `${minutes} Minuten`
  const streak = streakDays(log)
  const gains = improvements(results, previousLog)

  return (
    <div className="space-y-8 text-center">
      <div>
        <MdCheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="text-4xl font-bold text-white">Session fertig</h1>
        <p className="mt-2 text-lg text-gray-400">
          {minutesLabel}, {results.length} {results.length === 1 ? "Block" : "Blöcke"}
          {streak > 1 && ` · ${streak} Tage in Folge`}
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-3 text-left">
        {results.map((result, index) => {
          const drill = DRILLS_BY_ID[result.drillId]
          return (
            <div
              key={`${result.drillId}-${index}`}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3"
            >
              <span className="text-gray-200">{drill?.title ?? result.drillId}</span>
              <span className="flex items-center gap-3 font-mono text-sm">
                {result.timing && (
                  <span className="text-gray-500">
                    Timing <span className="text-gray-300">{result.timing.score}</span>
                    <span className="text-gray-600"> · ±{result.timing.spreadMs} ms</span>
                  </span>
                )}
                <span className="text-orange-500">{result.bpm} BPM</span>
              </span>
            </div>
          )
        })}
      </div>

      {gains.length > 0 && (
        <div className="mx-auto max-w-md rounded-lg border border-green-500/30 bg-green-900/10 p-4 text-left">
          <h2 className="mb-2 font-semibold text-green-400">Neue Bestwerte</h2>
          <ul className="space-y-1 text-sm text-gray-300">
            {gains.map((gain) => (
              <li key={gain.title}>
                {gain.from === null ? (
                  <>
                    {gain.title}: erster sauberer Durchgang bei{" "}
                    <span className="font-semibold text-white">{gain.to} BPM</span>
                  </>
                ) : (
                  <>
                    {gain.title}: {gain.from} → <span className="font-semibold text-white">{gain.to} BPM</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
          <Link href="/">Feierabend</Link>
        </Button>
        <Button onClick={onExtend} size="lg" variant="outline" className="border-orange-500 text-orange-500">
          <MdAdd className="mr-2 h-5 w-5" /> Noch 5 Minuten
        </Button>
      </div>
    </div>
  )
}
