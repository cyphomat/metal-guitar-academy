"use client"

import { useMemo, useState } from "react"
import { BlockRunner, type BlockOutcome } from "@/components/session/block-runner"
import { SessionSummary } from "@/components/session/session-summary"
import { buildDrillSession, buildSession, nextExtraBlock } from "@/lib/session/builder"
import { appendResults, loadLog } from "@/lib/storage/practice-log"
import type { DrillResult, PracticeLog, SessionBlock } from "@/lib/session/types"

export function SessionRunner({ minutes, drillId }: { minutes: number; drillId?: string }) {
  // The log as it stood when the session opened. Kept so the wrap-up can show
  // what changed today rather than just the current totals.
  const [startingLog] = useState<PracticeLog>(() => loadLog())
  const [log, setLog] = useState<PracticeLog>(startingLog)

  const [blocks, setBlocks] = useState<SessionBlock[]>(() => {
    const single = drillId ? buildDrillSession(startingLog, drillId, { minutes }) : null
    return (single ?? buildSession(startingLog, { minutes })).blocks
  })
  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState<DrillResult[]>([])

  const block = blocks[current]
  const done = current >= blocks.length

  const completeBlock = (outcome: BlockOutcome) => {
    const result: DrillResult = {
      drillId: block.drill.id,
      technique: block.drill.technique,
      bpm: outcome.bpm,
      rating: outcome.rating,
      seconds: outcome.seconds,
      at: new Date().toISOString(),
      timing: outcome.timing,
    }

    // Written per block, not at the end: a session abandoned halfway still
    // counts for everything that was actually played.
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

  if (done) {
    return (
      <SessionSummary results={results} previousLog={startingLog} log={log} onExtend={extend} />
    )
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 pb-16">
      <div className="bar mt-6 h-[3px]">
        <i className="transition-[width] duration-500" style={{ width: `${overallProgress}%` }} />
      </div>
      <div className="mt-5" />
      <BlockRunner
        key={`${block.drill.id}-${current}`}
        block={block}
        index={current}
        total={blocks.length}
        onComplete={completeBlock}
      />
    </div>
  )
}
