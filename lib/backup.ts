import { z } from "zod"
import { mergeLogs } from "@/lib/session/merge"
import { practiceLogSchema, type PracticeLog } from "@/lib/session/types"
import { mergeTheoryLogs } from "@/lib/theory/merge"
import { EMPTY_THEORY_LOG, theoryLogSchema, type TheoryLog } from "@/lib/theory/types"

/**
 * Die Sicherungsdatei: alles, was die App führt, in einem Dokument.
 *
 * Aufgebaut wie der Übungs-Log, mit den Wissens-Antworten in einem
 * zusätzlichen Feld. Eine ältere Fassung der App liest so eine Datei ohne
 * Murren — sie streift das unbekannte Feld ab und übernimmt den Rest. Beim
 * *Abgleich* wäre genau das ein Datenverlust, weshalb dort zwei getrennte
 * Dateien liegen; beim Sichern ist eine Datei die richtige Antwort, denn
 * niemand will zwei Downloads verwalten.
 */
export const backupSchema = practiceLogSchema.extend({
  theory: theoryLogSchema.optional(),
})

export type Backup = z.infer<typeof backupSchema>

export function buildBackup(practice: PracticeLog, theory: TheoryLog): Backup {
  // Ein leerer Antwort-Log kommt gar nicht erst mit: eine Datei ohne das Feld
  // ist genau das, was frühere Fassungen erzeugt haben.
  return theory.answers.length > 0 ? { ...practice, theory } : { ...practice }
}

export interface BackupPreview {
  ok: true
  /** Übungs-Einträge in der Datei. */
  incoming: number
  /** Davon noch nicht im Log. */
  added: number
  /** Antworten in der Datei. */
  incomingTheory: number
  /** Davon noch nicht im Antwort-Log. */
  addedTheory: number
  merged: PracticeLog
  mergedTheory: TheoryLog
}

export interface BackupError {
  ok: false
  reason: string
}

/**
 * Liest eine Sicherung und sagt, was ein Import bewirken würde — ohne etwas
 * zu ändern. Ein Import, der stillschweigend überschreibt, wäre bei
 * Übungsdaten die schlimmste Art von Fehler.
 */
export function previewBackup(
  raw: string,
  practice: PracticeLog,
  theory: TheoryLog,
): BackupPreview | BackupError {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: "Das ist keine gültige JSON-Datei." }
  }

  const check = backupSchema.safeParse(parsed)
  if (!check.success) {
    return { ok: false, reason: "Die Datei passt nicht zum Format des Übungs-Logs." }
  }

  const eingelesenTheorie = check.data.theory ?? EMPTY_THEORY_LOG
  const merged = mergeLogs(practice, check.data)
  const mergedTheory = mergeTheoryLogs(theory, eingelesenTheorie)

  return {
    ok: true,
    incoming: check.data.results.length,
    added: merged.results.length - practice.results.length,
    incomingTheory: eingelesenTheorie.answers.length,
    addedTheory: mergedTheory.answers.length - theory.answers.length,
    merged,
    mergedTheory,
  }
}
