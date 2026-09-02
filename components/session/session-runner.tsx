"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BlockRunner, type BlockOutcome } from "@/components/session/block-runner"
import { SessionSummary } from "@/components/session/session-summary"
import { buildDrillSession, buildSession, nextExtraBlock } from "@/lib/session/builder"
import { appendResults, loadLog } from "@/lib/storage/practice-log"
import { loadProfile } from "@/lib/storage/profile"
import { EMPTY_LOG, type DrillResult, type PracticeLog, type SessionBlock } from "@/lib/session/types"

export function SessionRunner({ minutes, drillId }: { minutes: number; drillId?: string }) {
  /**
   * Der Plan entsteht erst nach dem Mounten, nicht beim Rendern.
   *
   * Er hängt an zwei Dingen, die es auf dem Server nicht gibt: am Übungs-Log
   * aus dem localStorage und am Zufall, mit dem der Scheduler gleichwertige
   * Drills mischt. Beim Vorrendern käme dabei eine andere Session heraus als
   * im Browser — React verwirft den Baum dann und baut ihn neu auf, und für
   * einen Moment steht der falsche Drill auf dem Schirm.
   */
  const [startingLog, setStartingLog] = useState<PracticeLog | null>(null)
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)
  const [blocks, setBlocks] = useState<SessionBlock[] | null>(null)

  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState<DrillResult[]>([])

  useEffect(() => {
    const initial = loadLog()
    const profile = loadProfile()
    const single = drillId ? buildDrillSession(initial, drillId, { minutes, profile }) : null
    setStartingLog(initial)
    setLog(initial)
    setBlocks((single ?? buildSession(initial, { minutes, profile })).blocks)
  }, [drillId, minutes])

  /**
   * Ein Drill über mehrere Runden ist ein Eintrag im Log, keine drei. Bis zur
   * letzten Runde sammeln sich hier Spielzeit und zuletzt benutztes Tempo.
   */
  const carried = useRef<Record<string, { seconds: number; bpm: number }>>({})

  const block = blocks?.[current]
  const done = blocks !== null && current >= blocks.length

  // Runde zwei startet mit dem Tempo, das in Runde eins tatsächlich lief —
  // nicht mit dem, das der Plan vor der Session vorgesehen hatte.
  const active: SessionBlock | undefined = block && {
    ...block,
    bpm: carried.current[block.drill.id]?.bpm ?? block.bpm,
  }

  const completeBlock = (outcome: BlockOutcome) => {
    if (!block) return
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
    setBlocks((previous) => (previous ? [...previous, nextExtraBlock(log, previous, { minutes: 5 })] : previous))
  }

  const overallProgress = useMemo(
    () => (blocks?.length ? (current / blocks.length) * 100 : 0),
    [current, blocks],
  )

  if (blocks === null || startingLog === null) {
    return (
      <p className="huelle pt-8 font-mono text-[12px] uppercase tracking-[0.18em] text-dim">
        Session wird vorbereitet…
      </p>
    )
  }

  if (done || !active) {
    return <SessionSummary results={results} previousLog={startingLog} log={log} onExtend={extend} />
  }

  return (
    <div className="huelle-breit">
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
