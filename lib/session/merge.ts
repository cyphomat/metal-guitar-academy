import { practiceLogSchema, type DrillResult, type PracticeLog } from "./types"

/**
 * Zwei Übungs-Logs zusammenführen.
 *
 * Der Log ist append-only: ein Eintrag entsteht einmal, ändert sich nie und
 * trägt Zeitstempel und Drill. Deshalb ist die Vereinigung die richtige
 * Antwort und nicht "der neuere gewinnt" — zwei Geräte, die unabhängig
 * geübt haben, haben beide recht.
 *
 * Das ist auch die Grundlage für den späteren Abgleich über ein Datenrepo:
 * wer bei einem Schreibkonflikt neu liest und mergt, verliert nichts.
 */
export function mergeLogs(a: PracticeLog, b: PracticeLog): PracticeLog {
  const byKey = new Map<string, DrillResult>()
  for (const result of [...a.results, ...b.results]) {
    byKey.set(keyOf(result), result)
  }

  return {
    version: 1,
    results: [...byKey.values()].sort((x, y) => Date.parse(x.at) - Date.parse(y.at)),
  }
}

/**
 * Identität eines Eintrags. Derselbe Drill zur selben Sekunde ist derselbe
 * Block — zwei Runden desselben Drills tragen verschiedene Zeitstempel.
 */
function keyOf(result: DrillResult): string {
  return `${result.drillId}@${result.at}`
}

export interface ImportPreview {
  ok: true
  /** Einträge in der eingelesenen Datei. */
  incoming: number
  /** Davon noch nicht im aktuellen Log. */
  added: number
  /** Wie der Log danach aussähe. */
  merged: PracticeLog
}

export interface ImportError {
  ok: false
  reason: string
}

/**
 * Liest eine exportierte Datei und sagt, was ein Import bewirken würde —
 * ohne etwas zu ändern. Ein Import, der stillschweigend überschreibt, wäre
 * bei Übungsdaten die schlimmste Art von Fehler.
 */
export function previewImport(raw: string, current: PracticeLog): ImportPreview | ImportError {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: "Das ist keine gültige JSON-Datei." }
  }

  const check = practiceLogSchema.safeParse(parsed)
  if (!check.success) {
    return {
      ok: false,
      reason: "Die Datei passt nicht zum Format des Übungs-Logs.",
    }
  }

  const merged = mergeLogs(current, check.data)
  return {
    ok: true,
    incoming: check.data.results.length,
    added: merged.results.length - current.results.length,
    merged,
  }
}
