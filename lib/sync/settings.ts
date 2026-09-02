"use client"

const OWNER_KEY = "mga.sync.owner"
const REPO_KEY = "mga.sync.repo"
const TOKEN_KEY = "mga.sync.token"
const LAST_KEY = "mga.sync.last"

export interface SyncSettings {
  owner: string
  repo: string
  token: string
}

export const EMPTY_SETTINGS: SyncSettings = { owner: "", repo: "", token: "" }

function read(key: string): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(key) ?? ""
  } catch {
    return ""
  }
}

export function loadSettings(): SyncSettings {
  return { owner: read(OWNER_KEY), repo: read(REPO_KEY), token: read(TOKEN_KEY) }
}

export function saveSettings(settings: SyncSettings): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(OWNER_KEY, settings.owner.trim())
    window.localStorage.setItem(REPO_KEY, settings.repo.trim())
    window.localStorage.setItem(TOKEN_KEY, settings.token.trim())
  } catch {
    // Privater Modus oder voller Speicher — der Abgleich bleibt dann aus.
  }
}

export function clearSettings(): void {
  if (typeof window === "undefined") return
  for (const key of [OWNER_KEY, REPO_KEY, TOKEN_KEY, LAST_KEY]) {
    window.localStorage.removeItem(key)
  }
}

export function isConfigured(settings: SyncSettings): boolean {
  return settings.owner !== "" && settings.repo !== "" && settings.token !== ""
}

export function markSynced(now: Date = new Date()): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LAST_KEY, now.toISOString())
  } catch {
    /* nicht kritisch */
  }
}

export function lastSynced(): Date | null {
  const raw = read(LAST_KEY)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}
