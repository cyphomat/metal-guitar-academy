"use client"

import { EMPTY_LOG, practiceLogSchema, type DrillResult, type PracticeLog } from "@/lib/session/types"

const STORAGE_KEY = "mga.practice-log.v1"

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
      window.localStorage.setItem(`${STORAGE_KEY}.broken.${Date.now()}`, raw)
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

export function clearLog(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function exportLog(): string {
  return JSON.stringify(loadLog(), null, 2)
}
