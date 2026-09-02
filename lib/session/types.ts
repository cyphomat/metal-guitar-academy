import { z } from "zod"

export const TECHNIQUES = [
  "warmup",
  "power-chords",
  "palm-mute",
  "downpicking",
  "gallop",
  "alternate-picking",
  "pentatonic",
  "bending",
] as const

export type Technique = (typeof TECHNIQUES)[number]

export const TECHNIQUE_LABELS: Record<Technique, string> = {
  warmup: "Warm-up",
  "power-chords": "Power Chords",
  "palm-mute": "Palm Muting",
  downpicking: "Downpicking",
  gallop: "Gallop",
  "alternate-picking": "Alternate Picking",
  pentatonic: "Pentatonic",
  bending: "Bending",
}

/** Where a drill sits in the arc of a session. */
export type BlockKind = "warmup" | "technique" | "riff"

export interface Drill {
  id: string
  title: string
  kind: BlockKind
  technique: Technique
  /** One line: what this actually trains. */
  goal: string
  /** Ordered cues to keep on screen while playing. */
  cues: string[]
  /** ASCII tab, monospace. Optional for pure coordination drills. */
  tab?: string
  /**
   * The theory behind the exercise, in two or three sentences. Shown next to
   * the drill rather than in a section of its own — theory sticks when it
   * explains something your hands are doing right now.
   */
  why?: string
  /** Tempo to start at when there is no history for this drill. */
  startBpm: number
  /** The tempo that counts as "owned". */
  targetBpm: number
  /** How much to move the tempo after a good or bad round. */
  bpmStep: number
  beatsPerBar: number
  /** Clicks per beat: 1 = quarters, 2 = eighths. */
  subdivision: number
}

/** How the player felt about a round. Drives the next tempo. */
export const RATINGS = [
  { value: 1, label: "Zäh", hint: "Nicht sauber durchgekommen" },
  { value: 2, label: "Wackelig", hint: "Ging, aber unsauber" },
  { value: 3, label: "Sauber", hint: "Sitzt im Tempo" },
  { value: 4, label: "Locker", hint: "Zu einfach, schneller" },
] as const

export type Rating = (typeof RATINGS)[number]["value"]

/** What the microphone measured, when it was on. */
export const timingResultSchema = z.object({
  hits: z.number().int().min(0),
  expected: z.number().int().min(0),
  /** Median absolute deviation around the systematic offset, in ms. */
  spreadMs: z.number(),
  /** Median deviation in ms — mostly capture latency, kept out of the score. */
  offsetMs: z.number(),
  score: z.number().min(0).max(100),
  trend: z.enum(["steady", "rushing", "dragging"]),
})

export type TimingResult = z.infer<typeof timingResultSchema>

export const drillResultSchema = z.object({
  drillId: z.string(),
  technique: z.enum(TECHNIQUES),
  bpm: z.number().int().min(20).max(300),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  /** Seconds actually spent on the block. */
  seconds: z.number().min(0),
  /** ISO timestamp. */
  at: z.string(),
  /** Absent when the block was played without the microphone. */
  timing: timingResultSchema.optional(),
})

export type DrillResult = z.infer<typeof drillResultSchema>

export const practiceLogSchema = z.object({
  version: z.literal(1),
  results: z.array(drillResultSchema),
})

export type PracticeLog = z.infer<typeof practiceLogSchema>

export const EMPTY_LOG: PracticeLog = { version: 1, results: [] }

export interface SessionBlock {
  drill: Drill
  /** Planned length in seconds. */
  seconds: number
  /** Tempo chosen for this round, derived from history. */
  bpm: number
}

export interface SessionPlan {
  blocks: SessionBlock[]
  /** Planned total in seconds, excluding the wrap-up screen. */
  totalSeconds: number
}
