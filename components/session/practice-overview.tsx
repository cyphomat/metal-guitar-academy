"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DRILLS } from "@/lib/session/drills"
import {
  daysPractisedInLast,
  masteryOf,
  progressFor,
  streakDays,
  totalMinutes,
} from "@/lib/session/progress"
import { loadLog } from "@/lib/storage/practice-log"
import { EMPTY_LOG, TECHNIQUE_LABELS, type PracticeLog } from "@/lib/session/types"
import { MdPlayArrow } from "react-icons/md"

const SESSION_LENGTHS = [10, 15, 25]

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-5 py-4 text-center">
      <div className="font-mono text-3xl font-bold text-orange-500">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  )
}

export function PracticeOverview() {
  // localStorage is unavailable during SSR, so the first paint is the
  // empty-log state and the real numbers arrive on mount.
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLog(loadLog())
    setLoaded(true)
  }, [])

  const hasHistory = loaded && log.results.length > 0

  const tracked = DRILLS.filter((drill) => drill.kind !== "warmup")
    .map((drill) => {
      const progress = progressFor(log, drill.id)
      return { drill, progress, mastery: masteryOf(drill, progress) }
    })
    .filter((entry) => entry.progress.attempts > 0)
    .sort((a, b) => b.mastery - a.mastery)

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          {hasHistory ? "Weiter geht's" : "Fangen wir an"}
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          {hasHistory
            ? "Dein Plan für heute steht — aufgebaut auf dem, was letztes Mal lief."
            : "15 Minuten. Aufwärmen, eine Technik, ein Riff. Mehr braucht es nicht."}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          asChild
          size="lg"
          className="h-auto w-full max-w-sm bg-orange-600 px-8 py-6 text-xl hover:bg-orange-700"
        >
          <Link href="/session?minutes=15">
            <MdPlayArrow className="mr-2 h-7 w-7" />
            Session starten · 15 Min
          </Link>
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>oder</span>
          {SESSION_LENGTHS.filter((length) => length !== 15).map((length) => (
            <Link
              key={length}
              href={`/session?minutes=${length}`}
              className="rounded border border-gray-800 px-3 py-1 text-gray-400 transition-colors hover:border-orange-500/60 hover:text-orange-400"
            >
              {length} Min
            </Link>
          ))}
        </div>
      </div>

      {hasHistory && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Stat value={streakDays(log)} label="Tage in Folge" />
            <Stat value={`${daysPractisedInLast(log, 7)}/7`} label="Diese Woche" />
            <Stat value={totalMinutes(log)} label="Minuten gesamt" />
          </div>

          {tracked.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Wo du stehst
              </h2>
              <div className="space-y-3">
                {tracked.map(({ drill, progress, mastery }) => (
                  <div key={drill.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <div className="font-medium text-white">{drill.title}</div>
                        <div className="text-xs uppercase tracking-wider text-gray-500">
                          {TECHNIQUE_LABELS[drill.technique]}
                        </div>
                      </div>
                      <div className="text-right font-mono text-sm text-gray-400">
                        <span className="text-orange-500">{progress.bestBpm ?? "–"}</span>
                        <span className="text-gray-600"> / {drill.targetBpm} BPM</span>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
                        style={{ width: `${Math.round(mastery * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
