"use client"

import { mergeLogs } from "@/lib/session/merge"
import { EMPTY_LOG, practiceLogSchema, type DrillResult, type PracticeLog } from "@/lib/session/types"

// Bleibt beim alten Präfix, obwohl die App inzwischen anders heisst: der
// Schlüssel identifiziert die Daten, nicht das Produkt. Ihn umzubenennen
// würde jeden bestehenden Übungs-Log stillschweigend verwaisen lassen.
const STORAGE_KEY = "mga.practice-log.v1"

/**
 * Where a log that failed the schema is put aside.
 *
 * Exactly one slot, not one per attempt. The key used to carry a timestamp,
 * which meant every page load added another full copy of the log: with a year
 * of practice that fills the storage quota in a couple of dozen visits, and
 * `saveLog` then fails silently — practice would stop being recorded with
 * nothing on screen to say so.
 */
const BROKEN_KEY = `${STORAGE_KEY}.broken`

/** Every key this module owns. `clearLog` has to reach all of them. */
const OWN_KEYS = [STORAGE_KEY, BROKEN_KEY]

/**
 * The log lives in localStorage for now. Everything goes through this module
 * and through the schema, so moving to IndexedDB or a server later is a change
 * in one place.
 */
export function loadLog(): PracticeLog {
  if (typeof window === "undefined") return EMPTY_LOG

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_LOG

    const parsed = practiceLogSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      // Corrupt or from an older shape: keep the bad copy around rather than
      // silently destroying practice history, and start clean.
      window.localStorage.setItem(BROKEN_KEY, raw)
      return EMPTY_LOG
    }
    return parsed.data
  } catch {
    return EMPTY_LOG
  }
}

function saveLog(log: PracticeLog): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // Private mode or a full quota. Losing the write is survivable; crashing
    // mid-session is not.
  }
}

export function appendResults(results: DrillResult[]): PracticeLog {
  const log = loadLog()
  const next: PracticeLog = { ...log, results: [...log.results, ...results] }
  saveLog(next)
  return next
}

/**
 * Übernimmt einen eingelesenen Log. Vereinigt, nie ersetzt — ein Import darf
 * nichts wegwerfen, was auf diesem Gerät geübt wurde.
 */
export function importLog(incoming: PracticeLog): PracticeLog {
  const merged = mergeLogs(loadLog(), incoming)
  saveLog(merged)
  return merged
}

/**
 * Whether anything of ours is stored at all — including a log that is too
 * broken to parse. Löschen has to stay reachable in exactly that case,
 * otherwise the only way out of a corrupt log is the browser settings.
 */
export function hasStoredLog(): boolean {
  if (typeof window === "undefined") return false
  try {
    return OWN_KEYS.some((key) => window.localStorage.getItem(key) !== null)
  } catch {
    return false
  }
}

/**
 * Löschen means gone. That includes the set-aside copy and the older
 * timestamped ones from before there was a single slot — a delete that leaves
 * a full copy of the practice history behind is not a delete.
 */
export function clearLog(): void {
  if (typeof window === "undefined") return
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key === STORAGE_KEY || key.startsWith(BROKEN_KEY)) {
        window.localStorage.removeItem(key)
      }
    }
  } catch {
    /* Nothing readable to delete. */
  }
}

/** Dateiname mit Datum, damit mehrere Sicherungen nebeneinander liegen können. */
export function exportFilename(now: Date = new Date()): string {
  const day = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`
  return `riffforge-${day}.json`
}
