import { describe, expect, it } from "vitest"
import { buildSession, nextExtraBlock, priorityOf } from "../builder"
import { DRILLS, DRILLS_BY_ID } from "../drills"
import type { DrillResult, PracticeLog } from "../types"

const NOW = new Date("2026-03-10T21:00:00")
/** No jitter, so ranking is deterministic under test. */
const fixed = () => 0

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

function result(drillId: string, overrides: Partial<DrillResult> = {}): DrillResult {
  const drill = DRILLS_BY_ID[drillId]
  return {
    drillId,
    technique: drill.technique,
    bpm: drill.startBpm,
    rating: 3,
    seconds: 300,
    at: NOW.toISOString(),
    ...overrides,
  }
}

describe("buildSession", () => {
  it("always opens with a warm-up and covers technique and riff", () => {
    const plan = buildSession(log(), { now: NOW, random: fixed })
    expect(plan.blocks.map((block) => block.drill.kind)).toEqual(["warmup", "technique", "riff"])
  })

  it("fits the requested length, leaving room for the wrap-up", () => {
    for (const minutes of [10, 15, 20, 30]) {
      const plan = buildSession(log(), { minutes, now: NOW, random: fixed })
      expect(plan.totalSeconds).toBeLessThanOrEqual(minutes * 60)
      expect(plan.totalSeconds).toBeGreaterThan(minutes * 60 - 120)
    }
  })

  it("reports a total matching its blocks", () => {
    const plan = buildSession(log(), { now: NOW, random: fixed })
    const sum = plan.blocks.reduce((total, block) => total + block.seconds, 0)
    expect(plan.totalSeconds).toBe(sum)
  })

  it("stays playable even when asked for an absurdly short session", () => {
    const plan = buildSession(log(), { minutes: 1, now: NOW, random: fixed })
    expect(plan.blocks).toHaveLength(3)
    for (const block of plan.blocks) {
      expect(block.seconds).toBeGreaterThan(0)
    }
  })

  it("carries the tempo forward from the last round of that drill", () => {
    const drill = DRILLS_BY_ID["tech-downpicking"]
    const history = log(result(drill.id, { bpm: 120, rating: 3, at: "2026-03-01T20:00:00.000Z" }))
    const plan = buildSession(history, { now: NOW, random: fixed })
    const block = plan.blocks.find((candidate) => candidate.drill.id === drill.id)
    if (block) expect(block.bpm).toBe(120 + drill.bpmStep)
  })

  it("moves on rather than repeating what was just drilled", () => {
    const first = buildSession(log(), { now: NOW, random: fixed })
    const played = first.blocks.map((block) =>
      result(block.drill.id, { rating: 4, at: NOW.toISOString() }),
    )
    const second = buildSession(log(...played), { now: NOW, random: fixed })

    const technique = (plan: typeof first) =>
      plan.blocks.find((block) => block.drill.kind === "technique")!.drill.id
    expect(technique(second)).not.toBe(technique(first))
  })
})

describe("priorityOf", () => {
  it("ranks an untouched drill above one just drilled clean", () => {
    const drilled = DRILLS_BY_ID["tech-downpicking"]
    const untouched = DRILLS_BY_ID["tech-gallop"]
    const history = log(result(drilled.id, { bpm: drilled.targetBpm, rating: 4 }))

    expect(priorityOf(untouched, history, NOW)).toBeGreaterThan(priorityOf(drilled, history, NOW))
  })

  it("brings a drill back as it goes stale", () => {
    const drill = DRILLS_BY_ID["tech-gallop"]
    const fresh = log(result(drill.id, { at: NOW.toISOString() }))
    const stale = log(result(drill.id, { at: "2026-02-01T20:00:00.000Z" }))

    expect(priorityOf(drill, stale, NOW)).toBeGreaterThan(priorityOf(drill, fresh, NOW))
  })
})

describe("nextExtraBlock", () => {
  it("adds something not already in the session", () => {
    const plan = buildSession(log(), { now: NOW, random: fixed })
    const extra = nextExtraBlock(log(), plan.blocks, { now: NOW, random: fixed })
    expect(plan.blocks.map((block) => block.drill.id)).not.toContain(extra.drill.id)
  })

  it("alternates so an extended session keeps its shape", () => {
    const plan = buildSession(log(), { now: NOW, random: fixed })
    const first = nextExtraBlock(log(), plan.blocks, { now: NOW, random: fixed })
    const second = nextExtraBlock(log(), [...plan.blocks, first], { now: NOW, random: fixed })
    expect(first.drill.kind).not.toBe(second.drill.kind)
  })

  it("repeats rather than failing once every drill has been used", () => {
    const all = DRILLS.map((drill) => ({ drill, seconds: 300, bpm: drill.startBpm }))
    expect(() => nextExtraBlock(log(), all, { now: NOW, random: fixed })).not.toThrow()
  })
})

describe("drill catalogue", () => {
  it("has unique ids", () => {
    expect(new Set(DRILLS.map((drill) => drill.id)).size).toBe(DRILLS.length)
  })

  it("has at least one drill of every kind", () => {
    for (const kind of ["warmup", "technique", "riff"] as const) {
      expect(DRILLS.some((drill) => drill.kind === kind)).toBe(true)
    }
  })

  it("has a target tempo above its start tempo", () => {
    for (const drill of DRILLS) {
      expect(drill.targetBpm).toBeGreaterThan(drill.startBpm)
      expect(drill.bpmStep).toBeGreaterThan(0)
    }
  })
})
