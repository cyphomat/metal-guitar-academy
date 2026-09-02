"use client"

import { importLog, loadLog } from "@/lib/storage/practice-log"
import { githubStore } from "./github"
import { isConfigured, loadSettings, markSynced } from "./settings"
import { syncLog, type SyncOutcome } from "./store"

/**
 * Einmal abgleichen: Gegenseite lesen, verschmelzen, zurückschreiben und das
 * Ergebnis lokal übernehmen.
 *
 * Scheitert der Abgleich, bleibt der lokale Log unangetastet — er ist selbst
 * die Warteschlange. Beim nächsten erfolgreichen Lauf geht alles mit hoch.
 */
export async function runSync(): Promise<SyncOutcome> {
  const settings = loadSettings()
  if (!isConfigured(settings)) {
    return { ok: false, reason: "Kein Datenrepo eingerichtet." }
  }

  const outcome = await syncLog(githubStore(settings), loadLog())
  if (outcome.ok) {
    importLog(outcome.log)
    markSynced()
  }
  return outcome
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
