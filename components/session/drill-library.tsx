"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DRILLS } from "@/lib/session/drills"
import { masteryOf, nextBpm, progressFor } from "@/lib/session/progress"
import { loadLog } from "@/lib/storage/practice-log"
import { EMPTY_LOG, TECHNIQUE_LABELS, type BlockKind, type PracticeLog } from "@/lib/session/types"

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
    <div>
      {SECTIONS.map((section) => (
        <section key={section.kind}>
          <h2 className="rule mb-1 mt-9">{section.title}</h2>
          <p className="mb-3 text-[12.5px] text-dim">{section.blurb}</p>

          <div className="grid gap-[9px] wide:grid-cols-2">
            {DRILLS.filter((drill) => drill.kind === section.kind).map((drill) => {
              const progress = progressFor(log, drill.id)
              const mastery = masteryOf(drill, progress)
              const started = progress.attempts > 0

              return (
                <Link
                  key={drill.id}
                  href={`/session?drill=${drill.id}&minutes=10`}
                  className="group block border border-line bg-panel px-[15px] py-[13px] transition-colors hover:border-akzent"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="display text-[18px] text-fg group-hover:text-akzent">
                        {drill.title}
                      </div>
                      <div className="kicker mt-0.5 text-dim">
                        {TECHNIQUE_LABELS[drill.technique]}
                      </div>
                    </div>
                    <div className="flex-none text-right">
                      <div className="num text-[15px] font-bold text-akzent">
                        {started ? nextBpm(drill, progress) : drill.startBpm}
                      </div>
                      <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
                        Ziel {drill.targetBpm}
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{drill.goal}</p>

                  <div className="bar mt-[10px] h-[4px]">
                    <i style={{ width: `${Math.round(mastery * 100)}%` }} />
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
