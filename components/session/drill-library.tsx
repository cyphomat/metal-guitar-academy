"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { DRILLS } from "@/lib/session/drills"
import { masteryOf, nextBpm, progressFor } from "@/lib/session/progress"
import { loadLog } from "@/lib/storage/practice-log"
import { EMPTY_LOG, TECHNIQUE_LABELS, type BlockKind, type PracticeLog } from "@/lib/session/types"
import { MdPlayArrow } from "react-icons/md"

const SECTIONS: Array<{ kind: BlockKind; title: string; blurb: string }> = [
  { kind: "warmup", title: "Warm-up", blurb: "Zwei Minuten, bevor es losgeht" },
  { kind: "technique", title: "Technik", blurb: "Eine Sache isoliert, mit Metronom" },
  { kind: "riff", title: "Riffs", blurb: "Technik im musikalischen Zusammenhang" },
]

export function DrillLibrary() {
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)

  useEffect(() => {
    setLog(loadLog())
  }, [])

  return (
    <div className="space-y-12">
      {SECTIONS.map((section) => (
        <section key={section.kind}>
          <h2 className="text-xl font-semibold text-white">{section.title}</h2>
          <p className="mb-4 text-sm text-gray-500">{section.blurb}</p>

          <div className="space-y-3">
            {DRILLS.filter((drill) => drill.kind === section.kind).map((drill) => {
              const progress = progressFor(log, drill.id)
              const mastery = masteryOf(drill, progress)

              return (
                <Link
                  key={drill.id}
                  href={`/session?drill=${drill.id}&minutes=10`}
                  className="group block rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-colors hover:border-orange-500/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{drill.title}</span>
                        <Badge variant="outline" className="border-gray-700 text-xs text-gray-400">
                          {TECHNIQUE_LABELS[drill.technique]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{drill.goal}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3 text-right">
                      <div className="font-mono text-sm">
                        <div className="text-orange-500">
                          {progress.attempts > 0 ? `${nextBpm(drill, progress)}` : drill.startBpm} BPM
                        </div>
                        <div className="text-xs text-gray-600">Ziel {drill.targetBpm}</div>
                      </div>
                      <MdPlayArrow className="h-6 w-6 text-gray-600 transition-colors group-hover:text-orange-500" />
                    </div>
                  </div>

                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-orange-500/70"
                      style={{ width: `${Math.round(mastery * 100)}%` }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
