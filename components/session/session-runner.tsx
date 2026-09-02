"use client"

import { useMemo, useRef, useState } from "react"
import { BlockRunner, type BlockOutcome } from "@/components/session/block-runner"
import { SessionSummary } from "@/components/session/session-summary"
import { buildDrillSession, buildSession, nextExtraBlock } from "@/lib/session/builder"
import { appendResults, loadLog } from "@/lib/storage/practice-log"
import type { DrillResult, PracticeLog, SessionBlock } from "@/lib/session/types"

export function SessionRunner({ minutes, drillId }: { minutes: number; drillId?: string }) {
  // Der Stand, als die Session aufging. Bleibt liegen, damit der Abschluss
  // zeigen kann, was sich heute geändert hat.
  const [startingLog] = useState<PracticeLog>(() => loadLog())
  const [log, setLog] = useState<PracticeLog>(startingLog)

  const [blocks, setBlocks] = useState<SessionBlock[]>(() => {
    const single = drillId ? buildDrillSession(startingLog, drillId, { minutes }) : null
    return (single ?? buildSession(startingLog, { minutes })).blocks
  })
  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState<DrillResult[]>([])

  /**
   * Ein Drill über mehrere Runden ist ein Eintrag im Log, keine drei. Bis zur
   * letzten Runde sammeln sich hier Spielzeit und zuletzt benutztes Tempo.
   */
  const carried = useRef<Record<string, { seconds: number; bpm: number }>>({})

  const block = blocks[current]
  const done = current >= blocks.length

  // Runde zwei startet mit dem Tempo, das in Runde eins tatsächlich lief —
  // nicht mit dem, das der Plan vor der Session vorgesehen hatte.
  const active: SessionBlock | undefined = block && {
    ...block,
    bpm: carried.current[block.drill.id]?.bpm ?? block.bpm,
  }

  const completeBlock = (outcome: BlockOutcome) => {
    const previous = carried.current[block.drill.id] ?? { seconds: 0, bpm: outcome.bpm }
    const seconds = previous.seconds + outcome.seconds

    if (outcome.rating === null) {
      // Zwischenrunde: merken und weiterziehen, bewertet wird am Ende.
      carried.current[block.drill.id] = { seconds, bpm: outcome.bpm }
      setCurrent((index) => index + 1)
      return
    }

    const result: DrillResult = {
      drillId: block.drill.id,
      technique: block.drill.technique,
      bpm: outcome.bpm,
      rating: outcome.rating,
      seconds,
      at: new Date().toISOString(),
      timing: outcome.timing,
    }

    // Pro Block geschrieben, nicht am Ende: eine abgebrochene Session zählt
    // trotzdem für alles, was wirklich gespielt wurde.
    delete carried.current[block.drill.id]
    setLog(appendResults([result]))
    setResults((previous) => [...previous, result])
    setCurrent((index) => index + 1)
  }

  const extend = () => {
    const extra = nextExtraBlock(log, blocks, { minutes: 5 })
    setBlocks((previous) => [...previous, extra])
  }

  const overallProgress = useMemo(
    () => (blocks.length ? (current / blocks.length) * 100 : 0),
    [current, blocks.length],
  )

  if (done || !active) {
    return <SessionSummary results={results} previousLog={startingLog} log={log} onExtend={extend} />
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 pb-16">
      <div className="bar mt-6 h-[3px]">
        <i className="transition-[width] duration-500" style={{ width: `${overallProgress}%` }} />
      </div>
      <div className="mt-5" />
      <BlockRunner
        key={`${active.drill.id}-${current}`}
        block={active}
        index={current}
        total={blocks.length}
        onComplete={completeBlock}
      />
    </div>
  )
}
