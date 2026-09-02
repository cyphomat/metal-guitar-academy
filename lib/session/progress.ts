import { startBpmFor, type Profile } from "./profile"
import type { Drill, DrillResult, PracticeLog, Rating } from "./types"

export interface DrillProgress {
  drillId: string
  attempts: number
  /** Highest tempo ever rated "sauber" or better. */
  bestBpm: number | null
  lastBpm: number | null
  lastRating: Rating | null
  lastPlayedAt: string | null
  /** Best measured timing score, or null if the mic was never on for this drill. */
  bestTimingScore: number | null
}

const MIN_BPM = 40

/** Newest result first. */
export function resultsFor(log: PracticeLog, drillId: string): DrillResult[] {
  return log.results
    .filter((r) => r.drillId === drillId)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}

export function progressFor(log: PracticeLog, drillId: string): DrillProgress {
  const results = resultsFor(log, drillId)
  const clean = results.filter((r) => r.rating >= 3)
  const measured = results.filter((r) => r.timing !== undefined)

  return {
    drillId,
    attempts: results.length,
    bestBpm: clean.length ? Math.max(...clean.map((r) => r.bpm)) : null,
    lastBpm: results[0]?.bpm ?? null,
    lastRating: results[0]?.rating ?? null,
    lastPlayedAt: results[0]?.at ?? null,
    bestTimingScore: measured.length ? Math.max(...measured.map((r) => r.timing!.score)) : null,
  }
}

/**
 * The tempo to open the next round at.
 *
 * Rated easy, move up twice the step; clean, one step; wobbly, hold; rough,
 * back off. Holding after a wobbly round is deliberate — repeating a tempo is
 * how it gets consolidated.
 */
export function nextBpm(drill: Drill, progress: DrillProgress, profile: Profile | null = null): number {
  if (progress.lastBpm === null || progress.lastRating === null) {
    // Beim ersten Mal zählt das Starttempo dieses Spielers, nicht das des
    // Katalogs — danach schreibt sich das Tempo ohnehin selbst fort.
    return startBpmFor(drill, profile)
  }

  const delta =
    progress.lastRating === 4
      ? drill.bpmStep * 2
      : progress.lastRating === 3
        ? drill.bpmStep
        : progress.lastRating === 2
          ? 0
          : -drill.bpmStep

  return Math.max(MIN_BPM, progress.lastBpm + delta)
}

/** 0 = untouched, 1 = target tempo reached cleanly. */
export function masteryOf(drill: Drill, progress: DrillProgress): number {
  if (progress.bestBpm === null) return 0
  const span = drill.targetBpm - drill.startBpm
  if (span <= 0) return 1
  return Math.max(0, Math.min(1, (progress.bestBpm - drill.startBpm) / span))
}

export function daysSince(iso: string | null, now: Date = new Date()): number {
  if (!iso) return Number.POSITIVE_INFINITY
  return (now.getTime() - Date.parse(iso)) / 86_400_000
}

/** Local-time YYYY-MM-DD, so a session at 23:50 counts for that day. */
export function dayKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function practiceDays(log: PracticeLog): string[] {
  const days = new Set(log.results.map((r) => dayKey(new Date(r.at))))
  return [...days].sort()
}

/**
 * Consecutive days practised, counting back from today. Yesterday still counts
 * as an unbroken streak so the day is not written off before it is over.
 */
export function streakDays(log: PracticeLog, now: Date = new Date()): number {
  const days = new Set(practiceDays(log))
  if (days.size === 0) return 0

  const cursor = new Date(now)
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKey(cursor))) return 0
  }

  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function daysPractisedInLast(log: PracticeLog, span: number, now: Date = new Date()): number {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - (span - 1))
  const from = dayKey(cutoff)
  return practiceDays(log).filter((day) => day >= from).length
}

export function totalMinutes(log: PracticeLog): number {
  return Math.round(log.results.reduce((sum, r) => sum + r.seconds, 0) / 60)
}
