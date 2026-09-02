"use client"

import { profileSchema, type Profile } from "@/lib/session/profile"

const KEY = "mga.profile.v1"

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = profileSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // Ohne gespeichertes Profil laufen die Katalogwerte — kein Beinbruch.
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
}
