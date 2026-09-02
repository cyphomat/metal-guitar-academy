/**
 * Scores what the microphone heard against what the metronome asked for.
 *
 * The central idea: a systematic offset and an inconsistent one are completely
 * different problems. Everyone shows up "late" — the sound travels to the mic,
 * the buffer adds a few milliseconds — and none of that is a playing mistake.
 * What actually sounds sloppy is *variance*. So the median deviation is
 * reported separately as an offset and deliberately kept out of the score,
 * which is built on the spread around it.
 */

export type TimingTrend = "steady" | "rushing" | "dragging"

export interface TimingAnalysis {
  /** Clicks that wanted a note. */
  expected: number
  /** Clicks that got one, within tolerance. */
  hits: number
  /** 0–1. */
  hitRate: number
  /** Median deviation in ms. Mostly latency, not a mistake. */
  offsetMs: number
  /** Median absolute deviation around the offset, in ms. The real quality. */
  spreadMs: number
  /** 0–100. */
  score: number
  trend: TimingTrend
  /** Per-hit deviations in ms, offset already removed. Negative = early. */
  deviationsMs: number[]
}

export const EMPTY_TIMING: TimingAnalysis = {
  expected: 0,
  hits: 0,
  hitRate: 0,
  offsetMs: 0,
  spreadMs: 0,
  score: 0,
  trend: "steady",
  deviationsMs: [],
}

/** Spread at which the score halves. Roughly where sloppiness becomes audible. */
const SPREAD_HALF_POINT_MS = 25
/** Difference between the halves of a block that counts as drift. */
const TREND_THRESHOLD_MS = 12
/**
 * Widest systematic offset we try to recover, in seconds.
 *
 * Capture latency is a few milliseconds; Bluetooth headphones routinely add
 * 150-300 ms, which is enough that every note would otherwise miss its click
 * and the whole measurement would silently read as "nothing heard". Past
 * ~300 ms it is more likely the player is on a different beat than that the
 * signal chain is that slow, so the search stops there.
 */
const MAX_OFFSET_SECONDS = 0.3
/** Histogram resolution for the offset search, in seconds. */
const OFFSET_BIN_SECONDS = 0.005
/** Minimum onsets before an estimated offset means anything. */
const MIN_ONSETS_FOR_OFFSET = 4

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/**
 * Greedy nearest matching, one onset per click.
 *
 * Unmatched onsets are ignored rather than penalised: in a gallop or a triplet
 * the notes between the clicks are correct playing, not errors. The question
 * this asks is only whether the notes that belong on the beat landed there.
 */
function nearestDistance(value: number, sorted: number[]): number {
  let low = 0
  let high = sorted.length - 1
  let best = Number.POSITIVE_INFINITY

  while (low <= high) {
    const mid = (low + high) >> 1
    const distance = value - sorted[mid]
    if (Math.abs(distance) < Math.abs(best)) best = distance
    if (distance > 0) low = mid + 1
    else if (distance < 0) high = mid - 1
    else return 0
  }
  return best
}

/**
 * Recovers the constant lag between playing and hearing.
 *
 * A histogram of every onset against its nearest click: real playing piles up
 * around one value — the signal chain's latency — while notes that belong
 * between the clicks spread out and do not form a peak. Taking the peak rather
 * than the median is what makes this survive gallops and triplets, where the
 * off-beat notes are the majority.
 */
export function estimateOffset(onsets: number[], expected: number[]): number {
  if (onsets.length < MIN_ONSETS_FOR_OFFSET || expected.length === 0) return 0

  const sorted = [...expected].sort((a, b) => a - b)
  const period = expected.length > 1 ? (sorted[sorted.length - 1] - sorted[0]) / (expected.length - 1) : Infinity
  // Never search further than half a click, or the beat itself becomes ambiguous.
  const limit = Math.min(MAX_OFFSET_SECONDS, period / 2)

  const distances = onsets
    .map((onset) => nearestDistance(onset, sorted))
    .filter((distance) => Math.abs(distance) <= limit)

  if (distances.length < MIN_ONSETS_FOR_OFFSET) return 0

  const bins = new Map<number, number>()
  for (const distance of distances) {
    const bin = Math.round(distance / OFFSET_BIN_SECONDS)
    bins.set(bin, (bins.get(bin) ?? 0) + 1)
  }

  // Neighbouring bins count too, so a peak straddling a bin edge still wins.
  let bestBin = 0
  let bestWeight = -1
  for (const [bin, count] of bins) {
    const weight = count + (bins.get(bin - 1) ?? 0) + (bins.get(bin + 1) ?? 0)
    if (weight > bestWeight || (weight === bestWeight && Math.abs(bin) < Math.abs(bestBin))) {
      bestWeight = weight
      bestBin = bin
    }
  }

  // Refine: the median of what actually fell in the peak, not the bin centre.
  const centre = bestBin * OFFSET_BIN_SECONDS
  const inPeak = distances.filter((distance) => Math.abs(distance - centre) <= OFFSET_BIN_SECONDS * 1.5)
  return inPeak.length > 0 ? median(inPeak) : centre
}

function matchOnsets(
  onsets: number[],
  expected: number[],
  toleranceSeconds: number,
): Array<{ beat: number; deviation: number }> {
  const available = [...onsets].sort((a, b) => a - b)
  const used = new Set<number>()
  const matches: Array<{ beat: number; deviation: number }> = []

  for (const beatTime of expected) {
    let bestIndex = -1
    let bestDistance = Number.POSITIVE_INFINITY

    for (let i = 0; i < available.length; i += 1) {
      if (used.has(i)) continue
      const distance = Math.abs(available[i] - beatTime)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = i
      }
      // Sorted, so once we are past the beat and getting worse, we are done.
      if (available[i] > beatTime && distance > bestDistance) break
    }

    if (bestIndex >= 0 && bestDistance <= toleranceSeconds) {
      used.add(bestIndex)
      matches.push({ beat: beatTime, deviation: available[bestIndex] - beatTime })
    }
  }

  return matches
}

export interface AnalyseOptions {
  /** How far off a note may be and still count as that beat, in seconds. */
  toleranceSeconds?: number
  /** Skip offset estimation and use this value instead. Mostly for tests. */
  offsetSeconds?: number
}

export function analyseTiming(
  onsets: number[],
  expected: number[],
  options: AnalyseOptions = {},
): TimingAnalysis {
  if (expected.length === 0) return EMPTY_TIMING

  const tolerance = options.toleranceSeconds ?? 0.12

  // Take the constant lag out first. Matching before this would throw away
  // every note whenever the signal chain is slower than the tolerance window.
  const offset = options.offsetSeconds ?? estimateOffset(onsets, expected)
  const aligned = onsets.map((onset) => onset - offset)
  const matches = matchOnsets(aligned, expected, tolerance)

  if (matches.length === 0) {
    return { ...EMPTY_TIMING, expected: expected.length, offsetMs: Math.round(offset * 1000) }
  }

  const corrected = matches.map((match) => match.deviation * 1000)
  const offsetMs = offset * 1000
  const spreadMs = median(corrected.map(Math.abs))

  const hitRate = matches.length / expected.length
  const timingScore = 1 / (1 + (spreadMs / SPREAD_HALF_POINT_MS) ** 2)
  const score = Math.round(100 * hitRate * timingScore)

  // Drift shows up as one half of the block sitting differently from the other,
  // which the offset alone would hide.
  const half = Math.floor(corrected.length / 2)
  let trend: TimingTrend = "steady"
  if (corrected.length >= 6) {
    const shift = mean(corrected.slice(half)) - mean(corrected.slice(0, half))
    if (shift < -TREND_THRESHOLD_MS) trend = "rushing"
    else if (shift > TREND_THRESHOLD_MS) trend = "dragging"
  }

  return {
    expected: expected.length,
    hits: matches.length,
    hitRate,
    offsetMs: Math.round(offsetMs),
    spreadMs: Math.round(spreadMs),
    score,
    trend,
    deviationsMs: corrected.map((deviation) => Math.round(deviation)),
  }
}

/**
 * What the player would probably have said about that round. Offered as a
 * preselection, never as a verdict — they still get to disagree.
 */
export function suggestRating(analysis: TimingAnalysis): 1 | 2 | 3 | 4 {
  if (analysis.hits === 0) return 2
  if (analysis.score >= 85) return 4
  if (analysis.score >= 62) return 3
  if (analysis.score >= 35) return 2
  return 1
}
