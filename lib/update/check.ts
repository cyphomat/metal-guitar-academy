"use client"

import { asset } from "@/lib/base-path"
import {
  buildStampSchema,
  UPSTREAM,
  UPSTREAM_PAGE_SIZE,
  type BuildStamp,
  type UpstreamCommit,
} from "./version"

/**
 * Was auf dem Server liegt.
 *
 * `no-store` ist hier keine Vorsicht, sondern Bedingung: käme die Antwort aus
 * einem Cache, verglichen wir den alten Stand mit sich selbst und die Prüfung
 * wäre immer "aktuell". Der Service Worker lässt diese Adresse deshalb auch
 * durch, ohne sie abzulegen.
 */
export async function fetchDeployed(): Promise<BuildStamp | null> {
  try {
    const response = await fetch(asset("/version.json"), { cache: "no-store" })
    if (!response.ok) return null
    const parsed = buildStampSchema.safeParse(await response.json())
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/**
 * Holt beim Original die Commits seit einem Zeitpunkt.
 *
 * Der einzige Netzzugriff der App ausser dem Abgleich — und der einzige ohne
 * Anmeldung. Er läuft nur auf Knopfdruck und nur in einem Fork: die
 * Auslieferung des Originals fragt sich nie selbst.
 */
export async function fetchUpstreamCommits(since: string): Promise<UpstreamCommit[] | null> {
  const url = new URL(`https://api.github.com/repos/${UPSTREAM}/commits`)
  url.searchParams.set("sha", "main")
  url.searchParams.set("per_page", String(UPSTREAM_PAGE_SIZE))
  if (since !== "") url.searchParams.set("since", since)

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    })
    if (!response.ok) return null
    const data: unknown = await response.json()
    if (!Array.isArray(data)) return null

    return data.flatMap((eintrag) => {
      const sha = (eintrag as { sha?: unknown }).sha
      const date = (eintrag as { commit?: { committer?: { date?: unknown } } }).commit?.committer
        ?.date
      return typeof sha === "string" && typeof date === "string" ? [{ sha, date }] : []
    })
  } catch {
    return null
  }
}

/**
 * Holt die neue Fassung und lädt neu.
 *
 * Der Cache muss vorher weg. Der Service Worker fragt zwar das Netz zuerst,
 * aber er ist selbst eine Datei im Cache: ohne `update()` beantwortet ein alter
 * Worker die nächste Anfrage genauso wie die letzte.
 */
export async function applyUpdate(): Promise<void> {
  try {
    if ("caches" in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.update()))
    }
  } catch {
    // Privater Modus oder abgeschalteter Speicher. Neu laden hilft dann
    // vielleicht trotzdem, und schaden kann es nicht.
  }
  window.location.reload()
}
