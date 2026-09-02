import { z } from "zod"
import type { Drill, Technique } from "./types"

/**
 * Das Wenige, was die App nicht aus dem Log ableiten kann.
 *
 * Beide Antworten ändern etwas Echtes — eine Frage, die nichts bewirkt,
 * gehört nicht in eine Ersteinrichtung.
 */

export const EXPERIENCE = [
  {
    value: "anfang",
    label: "Fange gerade an",
    hint: "Gitarre ist neu oder fast neu",
    /** Startempi runter: die Katalogwerte sind für jemanden mit etwas Übung. */
    tempoScale: 0.8,
  },
  {
    value: "wieder",
    label: "Wieder eingestiegen",
    hint: "Kann was, war lange weg",
    tempoScale: 1,
  },
  {
    value: "laeuft",
    label: "Spiele regelmässig",
    hint: "Suche Struktur, nicht Grundlagen",
    tempoScale: 1.25,
  },
] as const

export type Experience = (typeof EXPERIENCE)[number]["value"]

export const FOCUS = [
  { value: "rhythmus", label: "Rhythmus", hint: "Riffs, Chugs, rechte Hand" },
  { value: "lead", label: "Lead", hint: "Skalen, Licks, Bendings" },
  { value: "beides", label: "Beides", hint: "Ausgewogen durchmischen" },
] as const

export type Focus = (typeof FOCUS)[number]["value"]

export const profileSchema = z.object({
  version: z.literal(1),
  experience: z.enum(["anfang", "wieder", "laeuft"]),
  focus: z.enum(["rhythmus", "lead", "beides"]),
  /** ISO-Zeitstempel der Ersteinrichtung. */
  at: z.string(),
})

export type Profile = z.infer<typeof profileSchema>

export function makeProfile(experience: Experience, focus: Focus, now: Date = new Date()): Profile {
  return { version: 1, experience, focus, at: now.toISOString() }
}

/** Multiplikator auf die Starttempi des Katalogs. */
export function tempoScaleOf(profile: Profile | null): number {
  if (!profile) return 1
  return EXPERIENCE.find((entry) => entry.value === profile.experience)?.tempoScale ?? 1
}

/**
 * Das Starttempo eines Drills für diesen Spieler.
 *
 * Auf 5 gerundet, weil ein Metronom auf 74 BPM niemandem hilft, und nie unter
 * ein Tempo, bei dem sich der Drill nicht mehr spielen lässt.
 */
export function startBpmFor(drill: Drill, profile: Profile | null): number {
  const scaled = drill.startBpm * tempoScaleOf(profile)
  return Math.max(40, Math.round(scaled / 5) * 5)
}

const RHYTHM: Technique[] = ["downpicking", "palm-mute", "gallop", "power-chords"]
const LEAD: Technique[] = ["pentatonic", "bending", "alternate-picking"]

/**
 * Wie stark ein Drill zum gewählten Schwerpunkt passt.
 *
 * Bewusst ein Zuschlag und kein Filter: wer Lead will, soll trotzdem an der
 * rechten Hand arbeiten — nur eben später. Das Warm-up bleibt unberührt.
 */
export function focusBonus(drill: Drill, profile: Profile | null): number {
  if (!profile || profile.focus === "beides" || drill.kind === "warmup") return 0
  const wanted = profile.focus === "rhythmus" ? RHYTHM : LEAD
  return wanted.includes(drill.technique) ? 0.2 : 0
}
