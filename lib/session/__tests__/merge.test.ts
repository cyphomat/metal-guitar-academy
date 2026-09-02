import { describe, expect, it } from "vitest"
import { mergeLogs, previewImport } from "../merge"
import type { DrillResult, PracticeLog } from "../types"

function entry(at: string, drillId = "tech-gallop", bpm = 100): DrillResult {
  return { drillId, technique: "gallop", bpm, rating: 3, seconds: 300, at }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

describe("mergeLogs", () => {
  it("keeps both sides", () => {
    const merged = mergeLogs(
      log(entry("2026-03-01T20:00:00.000Z")),
      log(entry("2026-03-02T20:00:00.000Z")),
    )
    expect(merged.results).toHaveLength(2)
  })

  it("does not duplicate the same block", () => {
    const shared = entry("2026-03-01T20:00:00.000Z")
    expect(mergeLogs(log(shared), log(shared)).results).toHaveLength(1)
  })

  it("keeps two rounds of one drill apart", () => {
    const merged = mergeLogs(
      log(entry("2026-03-01T20:00:00.000Z"), entry("2026-03-01T20:06:00.000Z")),
      log(),
    )
    expect(merged.results).toHaveLength(2)
  })

  it("keeps different drills at the same second apart", () => {
    const merged = mergeLogs(
      log(entry("2026-03-01T20:00:00.000Z", "tech-gallop")),
      log(entry("2026-03-01T20:00:00.000Z", "riff-ironclad")),
    )
    expect(merged.results).toHaveLength(2)
  })

  it("sorts by time so the log reads as a history", () => {
    const merged = mergeLogs(
      log(entry("2026-03-05T20:00:00.000Z")),
      log(entry("2026-03-01T20:00:00.000Z"), entry("2026-03-03T20:00:00.000Z")),
    )
    expect(merged.results.map((r) => r.at)).toEqual([
      "2026-03-01T20:00:00.000Z",
      "2026-03-03T20:00:00.000Z",
      "2026-03-05T20:00:00.000Z",
    ])
  })

  it("is symmetric — neither side wins", () => {
    const a = log(entry("2026-03-01T20:00:00.000Z"))
    const b = log(entry("2026-03-02T20:00:00.000Z"))
    expect(mergeLogs(a, b)).toEqual(mergeLogs(b, a))
  })

  it("merging with an empty log changes nothing", () => {
    const a = log(entry("2026-03-01T20:00:00.000Z"))
    expect(mergeLogs(a, { version: 1, results: [] })).toEqual(a)
  })
})

describe("previewImport", () => {
  const current = log(entry("2026-03-01T20:00:00.000Z"))

  it("rejects something that is not JSON", () => {
    const result = previewImport("nicht wirklich json", current)
    expect(result.ok).toBe(false)
  })

  it("rejects JSON that is not an practice log", () => {
    const result = previewImport(JSON.stringify({ hallo: "welt" }), current)
    expect(result.ok).toBe(false)
  })

  it("rejects a log with a broken entry rather than importing half of it", () => {
    const broken = { version: 1, results: [{ drillId: "x", bpm: "schnell" }] }
    expect(previewImport(JSON.stringify(broken), current).ok).toBe(false)
  })

  it("counts what would actually be new", () => {
    const incoming = log(entry("2026-03-01T20:00:00.000Z"), entry("2026-03-02T20:00:00.000Z"))
    const result = previewImport(JSON.stringify(incoming), current)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.incoming).toBe(2)
    expect(result.added).toBe(1)
    expect(result.merged.results).toHaveLength(2)
  })

  it("reports zero new entries when the file is already contained", () => {
    const result = previewImport(JSON.stringify(current), current)
    expect(result.ok && result.added).toBe(0)
  })

  it("changes nothing on its own", () => {
    const before = JSON.stringify(current)
    previewImport(JSON.stringify(log(entry("2026-03-09T20:00:00.000Z"))), current)
    expect(JSON.stringify(current)).toBe(before)
  })
})
