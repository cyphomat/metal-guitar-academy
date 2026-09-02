import { DRILLS } from "./drills"
import { daysSince, masteryOf, nextBpm, progressFor } from "./progress"
import type { BlockKind, Drill, PracticeLog, SessionBlock, SessionPlan } from "./types"

/** Share of the session each kind gets, after the fixed warm-up. */
const WARMUP_SECONDS = 120

export interface BuildOptions {
  minutes?: number
  now?: Date
  /** Deterministic tie-breaking for tests. */
  random?: () => number
}

/**
 * How badly a drill wants to be picked.
 *
 * Two pulls: what is weakest (low mastery) and what has gone longest untouched.
 * Staleness saturates after a week so a drill skipped for a month does not
 * crowd out everything else forever.
 */
export function priorityOf(drill: Drill, log: PracticeLog, now: Date): number {
  const progress = progressFor(log, drill.id)
  const weakness = 1 - masteryOf(drill, progress)
  const staleness = Math.min(daysSince(progress.lastPlayedAt, now), 7) / 7

  // A drill never played is worth trying, but not ahead of a drill actively
  // being worked on and still far from target.
  const novelty = progress.attempts === 0 ? 0.15 : 0

  return weakness * 0.55 + staleness * 0.45 + novelty
}

function rank(kind: BlockKind, log: PracticeLog, now: Date, random: () => number): Drill[] {
  return DRILLS.filter((drill) => drill.kind === kind)
    .map((drill) => ({
      drill,
      // Small jitter so equal-priority drills rotate instead of locking in.
      score: priorityOf(drill, log, now) + random() * 0.02,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.drill)
}

function toBlock(drill: Drill, log: PracticeLog, seconds: number): SessionBlock {
  return {
    drill,
    seconds,
    bpm: nextBpm(drill, progressFor(log, drill.id)),
  }
}

/**
 * A session is one warm-up, then technique and riff work splitting whatever
 * time is left. The shape stays the same every day — that is the point; the
 * content is what adapts.
 */
export function buildSession(log: PracticeLog, options: BuildOptions = {}): SessionPlan {
  const minutes = options.minutes ?? 15
  const now = options.now ?? new Date()
  const random = options.random ?? Math.random

  const playable = Math.max(WARMUP_SECONDS + 120, minutes * 60 - 60)
  const remaining = playable - WARMUP_SECONDS
  const techniqueSeconds = Math.round(remaining / 2 / 30) * 30
  const riffSeconds = remaining - techniqueSeconds

  const warmup = rank("warmup", log, now, random)[0]
  const technique = rank("technique", log, now, random)[0]
  const riff = rank("riff", log, now, random)[0]

  const blocks = [
    toBlock(warmup, log, WARMUP_SECONDS),
    toBlock(technique, log, techniqueSeconds),
    toBlock(riff, log, riffSeconds),
  ]

  return {
    blocks,
    totalSeconds: blocks.reduce((sum, block) => sum + block.seconds, 0),
  }
}

/**
 * The "+10 Minuten" block: the next most-wanted drill that is not already in
 * the session, alternating technique and riff so an extended session keeps its
 * rhythm.
 */
export function nextExtraBlock(
  log: PracticeLog,
  used: SessionBlock[],
  options: BuildOptions = {},
): SessionBlock {
  const now = options.now ?? new Date()
  const random = options.random ?? Math.random
  const seconds = (options.minutes ?? 5) * 60

  const usedIds = new Set(used.map((block) => block.drill.id))
  const riffCount = used.filter((block) => block.drill.kind === "riff").length
  const techniqueCount = used.filter((block) => block.drill.kind === "technique").length
  const preferred: BlockKind = riffCount > techniqueCount ? "technique" : "riff"

  const candidates = [
    ...rank(preferred, log, now, random),
    ...rank(preferred === "riff" ? "technique" : "riff", log, now, random),
  ]

  // Everything played already? Then repeat the highest-priority drill rather
  // than refusing to extend the session.
  const drill = candidates.find((candidate) => !usedIds.has(candidate.id)) ?? candidates[0]

  return toBlock(drill, log, seconds)
}

/**
 * A single drill on its own, for when you know exactly what you want to work
 * on. Same tempo logic and same logging as a full session.
 */
export function buildDrillSession(
  log: PracticeLog,
  drillId: string,
  options: BuildOptions = {},
): SessionPlan | null {
  const drill = DRILLS.find((candidate) => candidate.id === drillId)
  if (!drill) return null

  const seconds = Math.max(60, (options.minutes ?? 10) * 60)
  const blocks = [toBlock(drill, log, seconds)]
  return { blocks, totalSeconds: seconds }
}
