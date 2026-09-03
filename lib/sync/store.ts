import { mergeLogs } from "@/lib/session/merge"
import { EMPTY_LOG, type PracticeLog } from "@/lib/session/types"
import { mergeTheoryLogs } from "@/lib/theory/merge"
import { EMPTY_THEORY_LOG, type TheoryLog } from "@/lib/theory/types"

/**
 * Ein Ablageort für einen Log, unabhängig davon, wer ihn führt.
 *
 * Die Trennung existiert, damit der Konfliktfall geprüft werden kann, ohne
 * GitHub anzufassen — genau dort geht sonst Übung verloren.
 */
export interface RemoteStore<T> {
  /** null heisst: dort liegt noch nichts. */
  read(): Promise<{ log: T; sha: string } | null>
  /** `sha` weglassen heisst "neu anlegen". Wirft ConflictError bei veraltetem sha. */
  write(log: T, sha?: string): Promise<{ sha: string }>
}

/**
 * Was ein Log können muss, damit `syncLog` ihn abgleichen kann.
 *
 * Zwei Logs, dieselbe Bauart: append-only, unveränderliche Einträge, über
 * Kennung plus Zeitstempel identifiziert. Die Konfliktbehandlung ist die
 * heikelste Stelle der ganzen App — sie existiert deshalb genau einmal, und
 * beide Logs reichen hier nur ihre Eigenheiten herein.
 */
export interface LogShape<T> {
  leer: T
  merge(a: T, b: T): T
  anzahl(log: T): number
}

export const UEBUNGS_LOG: LogShape<PracticeLog> = {
  leer: EMPTY_LOG,
  merge: mergeLogs,
  anzahl: (log) => log.results.length,
}

export const THEORIE_LOG: LogShape<TheoryLog> = {
  leer: EMPTY_THEORY_LOG,
  merge: mergeTheoryLogs,
  anzahl: (log) => log.answers.length,
}

/** Ein anderes Gerät war schneller: neu lesen, verschmelzen, nochmal schreiben. */
export class ConflictError extends Error {
  constructor() {
    super("Auf der Gegenseite wurde inzwischen geschrieben.")
    this.name = "ConflictError"
  }
}

export type SyncOutcome<T = PracticeLog> =
  | {
      ok: true
      /** Einträge, die von der Gegenseite dazugekommen sind. */
      pulled: number
      /** Einträge, die dieses Gerät hochgeschoben hat. */
      pushed: number
      log: T
    }
  | { ok: false; reason: string }

/**
 * Gleicht den lokalen Log mit der Gegenseite ab.
 *
 * Es gewinnt keine Seite: der Log ist append-only, Einträge sind
 * unveränderlich und über Drill plus Zeitstempel identifiziert. Zwei Geräte,
 * die unabhängig geübt haben, haben beide recht — also wird vereinigt.
 *
 * Schreibt nur, wenn die Gegenseite tatsächlich etwas nicht hat. Ein Abgleich
 * ohne Neuigkeiten soll keinen Commit erzeugen.
 */
export async function syncLog<T>(
  store: RemoteStore<T>,
  local: T,
  shape: LogShape<T>,
): Promise<SyncOutcome<T>> {
  try {
    const remote = await store.read()
    const merged = shape.merge(remote?.log ?? shape.leer, local)

    const pulled = shape.anzahl(merged) - shape.anzahl(local)
    const pushed = shape.anzahl(merged) - (remote ? shape.anzahl(remote.log) : 0)

    if (pushed === 0) {
      // Die Gegenseite ist bereits vollständig — nichts zu schreiben.
      return { ok: true, pulled, pushed: 0, log: merged }
    }

    try {
      await store.write(merged, remote?.sha)
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error

      // Genau ein zweiter Versuch. Wer beim Konflikt neu liest und erneut
      // verschmilzt, verliert nichts; wer es endlos versucht, hängt.
      const fresh = await store.read()
      const combined = shape.merge(fresh?.log ?? shape.leer, merged)
      await store.write(combined, fresh?.sha)

      return {
        ok: true,
        pulled: shape.anzahl(combined) - shape.anzahl(local),
        pushed: shape.anzahl(combined) - (fresh ? shape.anzahl(fresh.log) : 0),
        log: combined,
      }
    }

    return { ok: true, pulled, pushed, log: merged }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Abgleich fehlgeschlagen." }
  }
}
