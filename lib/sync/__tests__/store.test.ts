import { describe, expect, it } from "vitest"
import { ConflictError, syncLog, type RemoteStore } from "../store"
import type { DrillResult, PracticeLog } from "@/lib/session/types"

function entry(at: string, drillId = "tech-gallop"): DrillResult {
  return { drillId, technique: "gallop", bpm: 100, rating: 3, seconds: 300, at }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

/** Ein Ablageort im Speicher, der mitzählt, was mit ihm passiert. */
function fakeStore(initial: PracticeLog | null = null) {
  let state = initial ? { log: initial, sha: "sha-0" } : null
  let version = 0
  const writes: PracticeLog[] = []
  /** Beim nächsten Schreiben einen Konflikt werfen und dabei fremd schreiben. */
  let collideWith: PracticeLog | null = null

  const store: RemoteStore = {
    async read() {
      return state ? { ...state } : null
    },
    async write(next, sha) {
      if (collideWith) {
        state = { log: collideWith, sha: `sha-${++version}` }
        collideWith = null
        throw new ConflictError()
      }
      if (state && sha !== state.sha) throw new ConflictError()
      state = { log: next, sha: `sha-${++version}` }
      writes.push(next)
      return { sha: state.sha }
    },
  }

  return {
    store,
    writes,
    current: () => state?.log ?? null,
    collide(withLog: PracticeLog) {
      collideWith = withLog
    },
  }
}

describe("syncLog", () => {
  it("creates the file when the other side is empty", async () => {
    const remote = fakeStore(null)
    const result = await syncLog(remote.store, log(entry("2026-03-01T20:00:00.000Z")))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.pushed).toBe(1)
    expect(result.pulled).toBe(0)
    expect(remote.current()!.results).toHaveLength(1)
  })

  it("brings down what the other device played", async () => {
    const remote = fakeStore(log(entry("2026-03-02T20:00:00.000Z")))
    const result = await syncLog(remote.store, log(entry("2026-03-01T20:00:00.000Z")))

    expect(result.ok && result.pulled).toBe(1)
    expect(result.ok && result.log.results).toHaveLength(2)
  })

  it("writes nothing when the other side already has everything", async () => {
    const shared = log(entry("2026-03-01T20:00:00.000Z"))
    const remote = fakeStore(shared)
    const result = await syncLog(remote.store, shared)

    expect(result.ok && result.pushed).toBe(0)
    expect(remote.writes).toHaveLength(0)
  })

  it("still reports what it pulled even when it writes nothing", async () => {
    const remote = fakeStore(log(entry("2026-03-01T20:00:00.000Z"), entry("2026-03-02T20:00:00.000Z")))
    const result = await syncLog(remote.store, log(entry("2026-03-01T20:00:00.000Z")))

    expect(result.ok && result.pushed).toBe(0)
    expect(result.ok && result.pulled).toBe(1)
  })

  it("loses nothing when another device writes in between", async () => {
    // Der Konfliktfall: wir lesen, das Handy schreibt, wir schreiben.
    const remote = fakeStore(log(entry("2026-03-01T20:00:00.000Z")))
    remote.collide(log(entry("2026-03-01T20:00:00.000Z"), entry("2026-03-03T20:00:00.000Z")))

    const result = await syncLog(remote.store, log(entry("2026-03-02T20:00:00.000Z")))

    expect(result.ok).toBe(true)
    const days = remote.current()!.results.map((r) => r.at)
    expect(days).toHaveLength(3)
    expect(days).toContain("2026-03-02T20:00:00.000Z")
    expect(days).toContain("2026-03-03T20:00:00.000Z")
  })

  it("reports a failure instead of throwing", async () => {
    const broken: RemoteStore = {
      async read() {
        throw new Error("Token ungültig")
      },
      async write() {
        throw new Error("nie erreicht")
      },
    }
    const result = await syncLog(broken, log())
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.reason).toContain("Token")
  })

  it("does not retry forever", async () => {
    // Eine Gegenseite, die immer kollidiert, darf nicht in eine Schleife führen.
    let reads = 0
    const stubborn: RemoteStore = {
      async read() {
        reads += 1
        return { log: log(), sha: `sha-${reads}` }
      },
      async write() {
        throw new ConflictError()
      },
    }
    const result = await syncLog(stubborn, log(entry("2026-03-01T20:00:00.000Z")))
    expect(result.ok).toBe(false)
    expect(reads).toBeLessThanOrEqual(2)
  })
})
