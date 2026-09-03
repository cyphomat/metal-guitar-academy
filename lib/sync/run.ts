"use client"

import { importLog, loadLog } from "@/lib/storage/practice-log"
import { importTheoryLog, loadTheoryLog } from "@/lib/storage/theory-log"
import { practiceStore, theoryStore } from "./github"
import { isConfigured, loadSettings, markSynced } from "./settings"
import { syncLog, THEORIE_LOG, UEBUNGS_LOG } from "./store"

export interface SyncSummary {
  ok: boolean
  /** Einträge, die von der Gegenseite dazugekommen sind — beide Logs zusammen. */
  pulled: number
  /** Einträge, die dieses Gerät hochgeschoben hat. */
  pushed: number
  /** Was schiefging, falls etwas schiefging. */
  reason?: string
}

/**
 * Einmal abgleichen: Übungs-Log und Antwort-Log, jeder für sich.
 *
 * Getrennt, weil sie getrennt liegen — und weil ein Fehler beim einen den
 * anderen nichts angeht. Scheitert einer, bleibt der lokale Stand beider
 * unangetastet; er ist selbst die Warteschlange und geht beim nächsten Lauf
 * mit hoch.
 */
export async function runSync(): Promise<SyncSummary> {
  const settings = loadSettings()
  if (!isConfigured(settings)) {
    return { ok: false, pulled: 0, pushed: 0, reason: "Kein Datenrepo eingerichtet." }
  }

  const uebung = await syncLog(practiceStore(settings), loadLog(), UEBUNGS_LOG)
  if (uebung.ok) importLog(uebung.log)

  const theorie = await syncLog(theoryStore(settings), loadTheoryLog(), THEORIE_LOG)
  if (theorie.ok) importTheoryLog(theorie.log)

  if (!uebung.ok || !theorie.ok) {
    return {
      ok: false,
      pulled: uebung.ok ? uebung.pulled : 0,
      pushed: uebung.ok ? uebung.pushed : 0,
      // Der erste echte Fehler; zwei Meldungen übereinander helfen niemandem.
      reason: (uebung.ok ? null : uebung.reason) ?? (theorie.ok ? undefined : theorie.reason),
    }
  }

  markSynced()
  return {
    ok: true,
    pulled: uebung.pulled + theorie.pulled,
    pushed: uebung.pushed + theorie.pushed,
  }
}

/**
 * Abgleich im Hintergrund, etwa nach einer Session. Meldet nichts und
 * scheitert lautlos: mitten im Üben ist ein Fehlerbanner das Letzte, was
 * jemand braucht, und verloren geht dabei nichts.
 */
export function syncInBackground(): void {
  if (!isConfigured(loadSettings())) return
  void runSync().catch(() => {})
}
