"use client"

import { mergeTheoryLogs } from "@/lib/theory/merge"
import {
  EMPTY_THEORY_LOG,
  theoryLogSchema,
  type TheoryAnswer,
  type TheoryLog,
} from "@/lib/theory/types"

// Eigener Schlüssel, nicht im Übungs-Log: eine Antwort ist kein Übungsblock,
// und der Übungs-Log hat ein Schema, das ihn nicht kennt.
const STORAGE_KEY = "mga.theory-log.v1"
const BROKEN_KEY = `${STORAGE_KEY}.broken`

/** Alles, was dieses Modul besitzt — die Löschliste muss alles erreichen. */
const OWN_KEYS = [STORAGE_KEY, BROKEN_KEY]

export function loadTheoryLog(): TheoryLog {
  if (typeof window === "undefined") return EMPTY_THEORY_LOG

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_THEORY_LOG

    const parsed = theoryLogSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      // Genau ein Platz, kein Zeitstempel im Schlüssel: sonst legt jeder
      // Seitenaufruf eine weitere vollständige Kopie an.
      window.localStorage.setItem(BROKEN_KEY, raw)
      return EMPTY_THEORY_LOG
    }
    return parsed.data
  } catch {
    return EMPTY_THEORY_LOG
  }
}

function saveTheoryLog(log: TheoryLog): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // Privater Modus oder voller Speicher. Eine verlorene Antwort ist
    // verschmerzbar, ein Absturz mitten in der Session nicht.
  }
}

/**
 * Antworten anhängen. Nie überschreiben — der Log ist append-only, damit zwei
 * Geräte sich verschmelzen lassen, statt sich zu überstimmen.
 */
export function appendAnswers(answers: TheoryAnswer[]): TheoryLog {
  const log = loadTheoryLog()
  const next: TheoryLog = { ...log, answers: [...log.answers, ...answers] }
  saveTheoryLog(next)
  return next
}

/**
 * Übernimmt einen abgeglichenen Log. Vereinigt, nie ersetzt — was auf diesem
 * Gerät beantwortet wurde, darf ein Abgleich nicht wegräumen.
 */
export function importTheoryLog(incoming: TheoryLog): TheoryLog {
  const merged = mergeTheoryLogs(loadTheoryLog(), incoming)
  saveTheoryLog(merged)
  return merged
}

export function hasStoredTheoryLog(): boolean {
  if (typeof window === "undefined") return false
  try {
    return OWN_KEYS.some((key) => window.localStorage.getItem(key) !== null)
  } catch {
    return false
  }
}

/** Löschen heisst löschen — samt beiseitegelegter Kopie. */
export function clearTheoryLog(): void {
  if (typeof window === "undefined") return
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key === STORAGE_KEY || key.startsWith(BROKEN_KEY)) {
        window.localStorage.removeItem(key)
      }
    }
  } catch {
    /* Nichts Lesbares zu löschen. */
  }
}
