import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PracticeLog } from "@/lib/session/types"

/**
 * These tests exist because of a security review: deleting the log used to
 * leave a full copy of it behind, and a log that failed the schema used to be
 * copied aside once per page load until the quota ran out.
 */

/**
 * A stand-in for localStorage. The methods are non-enumerable, so `Object.keys`
 * returns the stored keys and nothing else — that is what the browser does, and
 * `clearLog` walks exactly those keys.
 */
function makeStorage(): Storage {
  const store: Record<string, string> = {}
  const define = (name: string, fn: (...args: never[]) => unknown) =>
    Object.defineProperty(store, name, { value: fn, enumerable: false })

  define("getItem", (key: string) => (key in store ? store[key] : null))
  define("setItem", (key: string, value: string) => {
    store[key] = String(value)
  })
  define("removeItem", (key: string) => {
    delete store[key]
  })
  define("clear", () => {
    for (const key of Object.keys(store)) delete store[key]
  })
  return store as unknown as Storage
}

const KEY = "mga.practice-log.v1"

function goodLog(): PracticeLog {
  return {
    version: 1,
    results: [
      {
        drillId: "tech-gallop",
        technique: "gallop",
        bpm: 90,
        rating: 3,
        seconds: 180,
        at: "2026-09-01T18:00:00.000Z",
      },
    ],
  }
}

function installStorage(): Storage {
  const storage = makeStorage()
  vi.stubGlobal("window", { localStorage: storage })
  return storage
}

async function freshModule() {
  vi.resetModules()
  return import("@/lib/storage/practice-log")
}

describe("practice log storage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it("legt einen kaputten Log genau einmal beiseite, nicht je Aufruf", async () => {
    const storage = installStorage()
    storage.setItem(KEY, JSON.stringify({ version: 1, results: [{ nonsense: true }] }))
    const { loadLog } = await freshModule()

    for (let i = 0; i < 5; i += 1) expect(loadLog().results).toHaveLength(0)

    const aside = Object.keys(storage).filter((key) => key.includes(".broken"))
    expect(aside).toHaveLength(1)
  })

  it("löscht auch die beiseitegelegte Kopie — samt der alten mit Zeitstempel", async () => {
    const storage = installStorage()
    storage.setItem(KEY, JSON.stringify(goodLog()))
    storage.setItem(`${KEY}.broken`, "{}")
    storage.setItem(`${KEY}.broken.1700000000000`, '{"alt":true}')
    const { clearLog } = await freshModule()

    clearLog()

    expect(Object.keys(storage)).toHaveLength(0)
  })

  it("liest einen Log mit unbekannter Technik, statt ihn beiseitezulegen", async () => {
    // Der Fall, den es zu verhindern gilt: ein Gerät auf älterem Stand holt
    // beim Abgleich einen Log, in dem eine Technik steht, die es noch nicht
    // kennt. Wäre das Feld gegen die Aufzählung geprüft, verlöre dieses Gerät
    // beim Lesen seinen *ganzen* Übungs-Log — nicht nur den einen Eintrag.
    const storage = installStorage()
    const log = goodLog()
    log.results.push({ ...log.results[0], drillId: "tech-aus-der-zukunft", technique: "wasauchimmer" })
    storage.setItem(KEY, JSON.stringify(log))
    const { loadLog } = await freshModule()

    expect(loadLog().results).toHaveLength(2)
    expect(Object.keys(storage).filter((key) => key.includes(".broken"))).toHaveLength(0)
  })

  it("meldet gespeicherte Daten auch dann, wenn der Log das Schema reisst", async () => {
    const storage = installStorage()
    storage.setItem(KEY, "kein JSON")
    const { hasStoredLog, loadLog } = await freshModule()

    expect(loadLog().results).toHaveLength(0)
    // Sonst wäre der Löschen-Knopf gesperrt und man käme an die Daten nicht mehr heran.
    expect(hasStoredLog()).toBe(true)
  })

  it("meldet nichts Gespeichertes, wenn nichts da ist", async () => {
    installStorage()
    const { hasStoredLog } = await freshModule()
    expect(hasStoredLog()).toBe(false)
  })

  it("behält einen gültigen Log unverändert", async () => {
    const storage = installStorage()
    storage.setItem(KEY, JSON.stringify(goodLog()))
    const { loadLog } = await freshModule()

    expect(loadLog()).toEqual(goodLog())
    expect(Object.keys(storage)).toEqual([KEY])
  })
})
