import { describe, expect, it } from "vitest"
import { DRILLS_BY_ID } from "../drills"
import { dayKey, daysPractisedInLast, masteryOf, nextBpm, progressFor, streakDays } from "../progress"
import type { DrillResult, PracticeLog, Rating } from "../types"

const DRILL = DRILLS_BY_ID["tech-downpicking"]

function result(overrides: Partial<DrillResult> = {}): DrillResult {
  return {
    drillId: DRILL.id,
    technique: DRILL.technique,
    bpm: 100,
    rating: 3,
    seconds: 300,
    at: new Date("2026-03-10T20:00:00").toISOString(),
    ...overrides,
  }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

describe("nextBpm", () => {
  it("opens at the drill's start tempo with no history", () => {
    expect(nextBpm(DRILL, progressFor(log(), DRILL.id))).toBe(DRILL.startBpm)
  })

  const cases: Array<[Rating, number]> = [
    [4, 100 + DRILL.bpmStep * 2],
    [3, 100 + DRILL.bpmStep],
    [2, 100],
    [1, 100 - DRILL.bpmStep],
  ]

  it.each(cases)("moves the tempo per rating %i", (rating, expected) => {
    const state = progressFor(log(result({ rating, bpm: 100 })), DRILL.id)
    expect(nextBpm(DRILL, state)).toBe(expected)
  })

  it("never drops below a playable floor", () => {
    const state = progressFor(log(result({ rating: 1, bpm: 40 })), DRILL.id)
    expect(nextBpm(DRILL, state)).toBeGreaterThanOrEqual(40)
  })

  it("follows the most recent round, not the best one", () => {
    const state = progressFor(
      log(
        result({ bpm: 160, rating: 3, at: "2026-03-01T20:00:00.000Z" }),
        result({ bpm: 120, rating: 1, at: "2026-03-09T20:00:00.000Z" }),
      ),
      DRILL.id,
    )
    expect(nextBpm(DRILL, state)).toBe(120 - DRILL.bpmStep)
  })
})

describe("progressFor", () => {
  it("counts only clean rounds towards the best tempo", () => {
    const state = progressFor(log(result({ bpm: 180, rating: 2 }), result({ bpm: 110, rating: 3 })), DRILL.id)
    expect(state.bestBpm).toBe(110)
  })

  it("reports no best tempo when nothing was ever clean", () => {
    expect(progressFor(log(result({ rating: 1 })), DRILL.id).bestBpm).toBeNull()
  })
})

describe("bestTimingScore", () => {
  const timing = (score: number) => ({
    hits: 8, expected: 8, spreadMs: 10, offsetMs: 20, score, trend: "steady" as const,
  })

  it("is null when the microphone was never used for that drill", () => {
    expect(progressFor(log(result()), DRILL.id).bestTimingScore).toBeNull()
  })

  it("keeps the best measured score, not the latest", () => {
    const entries = log(
      result({ timing: timing(88), at: "2026-03-01T20:00:00.000Z" }),
      result({ timing: timing(54), at: "2026-03-09T20:00:00.000Z" }),
    )
    expect(progressFor(entries, DRILL.id).bestTimingScore).toBe(88)
  })

  it("ignores rounds played without the microphone", () => {
    const entries = log(result(), result({ timing: timing(71) }))
    expect(progressFor(entries, DRILL.id).bestTimingScore).toBe(71)
  })
})

describe("masteryOf", () => {
  it("is 0 untouched and 1 at target tempo", () => {
    expect(masteryOf(DRILL, progressFor(log(), DRILL.id))).toBe(0)
    const owned = progressFor(log(result({ bpm: DRILL.targetBpm, rating: 3 })), DRILL.id)
    expect(masteryOf(DRILL, owned)).toBe(1)
  })

  it("does not exceed 1 past the target", () => {
    const state = progressFor(log(result({ bpm: DRILL.targetBpm + 40, rating: 4 })), DRILL.id)
    expect(masteryOf(DRILL, state)).toBe(1)
  })
})

describe("streakDays", () => {
  const now = new Date("2026-03-10T21:00:00")
  const on = (day: string) => result({ at: new Date(`${day}T20:00:00`).toISOString() })

  it("is 0 with no history", () => {
    expect(streakDays(log(), now)).toBe(0)
  })

  it("counts consecutive days ending today", () => {
    expect(streakDays(log(on("2026-03-08"), on("2026-03-09"), on("2026-03-10")), now)).toBe(3)
  })

  it("still counts a streak that ends yesterday", () => {
    expect(streakDays(log(on("2026-03-08"), on("2026-03-09")), now)).toBe(2)
  })

  it("breaks once a day is missed", () => {
    expect(streakDays(log(on("2026-03-06"), on("2026-03-07")), now)).toBe(0)
  })

  it("counts a day once no matter how many blocks it holds", () => {
    expect(streakDays(log(on("2026-03-10"), on("2026-03-10"), on("2026-03-10")), now)).toBe(1)
  })
})

describe("daysPractisedInLast", () => {
  const now = new Date("2026-03-10T21:00:00")
  const on = (day: string) => result({ at: new Date(`${day}T20:00:00`).toISOString() })

  it("counts distinct days inside the window", () => {
    // A 7-day window ending on the 10th opens on the 4th, so all three days count.
    const entries = log(on("2026-03-04"), on("2026-03-08"), on("2026-03-08"), on("2026-03-10"))
    expect(daysPractisedInLast(entries, 7, now)).toBe(3)
  })

  it("ignores days that fall outside the window", () => {
    const entries = log(on("2026-03-03"), on("2026-03-10"))
    expect(daysPractisedInLast(entries, 7, now)).toBe(1)
  })
})

describe("dayKey", () => {
  it("uses local time so a late session counts for that day", () => {
    expect(dayKey(new Date(2026, 2, 10, 23, 50))).toBe("2026-03-10")
  })
})
