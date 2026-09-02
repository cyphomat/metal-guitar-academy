import { mergeLogs } from "@/lib/session/merge"
import type { PracticeLog } from "@/lib/session/types"

/**
 * Ein Ablageort für den Übungs-Log, unabhängig davon, wer ihn führt.
 *
 * Die Trennung existiert, damit der Konfliktfall geprüft werden kann, ohne
 * GitHub anzufassen — genau dort geht sonst Übung verloren.
 */
export interface RemoteStore {
  /** null heisst: dort liegt noch nichts. */
  read(): Promise<{ log: PracticeLog; sha: string } | null>
  /** `sha` weglassen heisst "neu anlegen". Wirft ConflictError bei veraltetem sha. */
  write(log: PracticeLog, sha?: string): Promise<{ sha: string }>
}

/** Ein anderes Gerät war schneller: neu lesen, verschmelzen, nochmal schreiben. */
export class ConflictError extends Error {
  constructor() {
    super("Auf der Gegenseite wurde inzwischen geschrieben.")
    this.name = "ConflictError"
  }
}

export type SyncOutcome =
  | {
      ok: true
      /** Einträge, die von der Gegenseite dazugekommen sind. */
      pulled: number
      /** Einträge, die dieses Gerät hochgeschoben hat. */
      pushed: number
      log: PracticeLog
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
export async function syncLog(store: RemoteStore, local: PracticeLog): Promise<SyncOutcome> {
  try {
    const remote = await store.read()
    const merged = mergeLogs(remote?.log ?? { version: 1, results: [] }, local)

    const pulled = merged.results.length - local.results.length
    const pushed = merged.results.length - (remote?.log.results.length ?? 0)

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
      const combined = mergeLogs(fresh?.log ?? { version: 1, results: [] }, merged)
      await store.write(combined, fresh?.sha)

      return {
        ok: true,
        pulled: combined.results.length - local.results.length,
        pushed: combined.results.length - (fresh?.log.results.length ?? 0),
        log: combined,
      }
    }

    return { ok: true, pulled, pushed, log: merged }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Abgleich fehlgeschlagen." }
  }
}
