import { describe, expect, it } from "vitest"
import { analyseTiming, estimateOffset, median, suggestRating } from "../timing"

/** Beat times at a given tempo, as the metronome would schedule them. */
function beats(count: number, bpm = 120, start = 10): number[] {
  const step = 60 / bpm
  return Array.from({ length: count }, (_, i) => start + i * step)
}

describe("median", () => {
  it("handles odd and even counts", () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it("is 0 for nothing", () => {
    expect(median([])).toBe(0)
  })
})

describe("analyseTiming", () => {
  it("reports nothing for a block with no clicks", () => {
    expect(analyseTiming([1, 2], []).expected).toBe(0)
  })

  it("scores perfect playing at 100", () => {
    const expected = beats(8)
    const result = analyseTiming(expected, expected)

    expect(result.hits).toBe(8)
    expect(result.hitRate).toBe(1)
    expect(result.spreadMs).toBe(0)
    expect(result.score).toBe(100)
  })

  it("treats a constant lag as offset, not as sloppiness", () => {
    // Every note 30 ms late by exactly the same amount: that is microphone
    // latency, and the player was perfectly consistent.
    const expected = beats(8)
    const result = analyseTiming(expected.map((t) => t + 0.03), expected)

    expect(result.offsetMs).toBe(30)
    expect(result.spreadMs).toBe(0)
    expect(result.score).toBe(100)
  })

  it("punishes inconsistency even when the average is perfect", () => {
    const expected = beats(8)
    // Alternating 40 ms early and late — average zero, but audibly all over.
    const onsets = expected.map((t, i) => t + (i % 2 === 0 ? -0.04 : 0.04))
    const result = analyseTiming(onsets, expected)

    expect(result.hits).toBe(8)
    expect(result.spreadMs).toBeGreaterThan(30)
    expect(result.score).toBeLessThan(45)
  })

  it("counts a missed beat as a miss without inventing a deviation", () => {
    const expected = beats(8)
    const onsets = expected.filter((_, i) => i !== 3)
    const result = analyseTiming(onsets, expected)

    expect(result.hits).toBe(7)
    expect(result.hitRate).toBeCloseTo(7 / 8)
    expect(result.deviationsMs).toHaveLength(7)
  })

  it("ignores extra notes between the clicks", () => {
    // A gallop: the on-beat note plus two sixteenths that belong there.
    const expected = beats(4, 120)
    const step = 60 / 120
    const onsets = expected.flatMap((t) => [t, t + step * 0.5, t + step * 0.75])
    const result = analyseTiming(onsets, expected)

    expect(result.hits).toBe(4)
    expect(result.score).toBe(100)
  })

  it("does not let one onset satisfy two clicks", () => {
    const expected = beats(4, 120)
    const result = analyseTiming([expected[0]], expected)
    expect(result.hits).toBe(1)
  })

  it("scores zero when nothing was played", () => {
    const result = analyseTiming([], beats(8))
    expect(result.hits).toBe(0)
    expect(result.score).toBe(0)
    expect(result.expected).toBe(8)
  })

  it("ignores a single note that lands nowhere near its click", () => {
    // A constant lag is offset and gets corrected; one wild note is a miss.
    const expected = beats(8, 120)
    const onsets = expected.map((t, i) => (i === 4 ? t + 0.2 : t))
    const result = analyseTiming(onsets, expected, { toleranceSeconds: 0.12 })

    expect(result.hits).toBe(7)
    expect(result.offsetMs).toBe(0)
  })

  describe("trend", () => {
    it("calls steady playing steady", () => {
      const expected = beats(12)
      expect(analyseTiming(expected, expected).trend).toBe("steady")
    })

    it("detects speeding up over the block", () => {
      const expected = beats(12)
      // Progressively earlier: the classic rush.
      const onsets = expected.map((t, i) => t - i * 0.005)
      expect(analyseTiming(onsets, expected).trend).toBe("rushing")
    })

    it("detects slowing down over the block", () => {
      const expected = beats(12)
      const onsets = expected.map((t, i) => t + i * 0.005)
      expect(analyseTiming(onsets, expected).trend).toBe("dragging")
    })

    it("stays neutral on too few notes to judge", () => {
      const expected = beats(4)
      const onsets = expected.map((t, i) => t - i * 0.02)
      expect(analyseTiming(onsets, expected).trend).toBe("steady")
    })
  })
})

describe("estimateOffset", () => {
  it("is 0 without enough onsets to judge", () => {
    expect(estimateOffset([10, 10.5], beats(8))).toBe(0)
  })

  it("recovers a constant lag", () => {
    const expected = beats(8)
    expect(estimateOffset(expected.map((t) => t + 0.2), expected)).toBeCloseTo(0.2, 2)
  })

  it("survives notes played between the clicks", () => {
    // A gallop, where the off-beat notes outnumber the on-beat ones and would
    // drag a median away from the truth.
    const expected = beats(8, 120)
    const step = 60 / 120
    const lag = 0.05
    const onsets = expected.flatMap((t) => [t + lag, t + lag + step * 0.5, t + lag + step * 0.75])
    expect(estimateOffset(onsets, expected)).toBeCloseTo(lag, 2)
  })

  it("does not chase an offset beyond half a click", () => {
    const expected = beats(8, 120)
    expect(Math.abs(estimateOffset(onsetsShifted(expected, 0.4), expected))).toBeLessThanOrEqual(0.25)
  })
})

function onsetsShifted(times: number[], by: number): number[] {
  return times.map((t) => t + by)
}

describe("analyseTiming with signal-chain latency", () => {
  it("still measures a player behind a slow signal chain", () => {
    // Bluetooth headphones: ~200 ms, far past the matching tolerance. Before
    // the offset is removed this reads as "nothing heard".
    const expected = beats(12, 100)
    const onsets = expected.map((t) => t + 0.2)
    const result = analyseTiming(onsets, expected)

    expect(result.hits).toBe(12)
    expect(result.offsetMs).toBeCloseTo(200, -1)
    expect(result.spreadMs).toBe(0)
    expect(result.score).toBe(100)
  })

  it("still catches sloppiness hiding behind that latency", () => {
    const expected = beats(12, 100)
    const onsets = expected.map((t, i) => t + 0.2 + (i % 2 === 0 ? -0.045 : 0.045))
    const result = analyseTiming(onsets, expected)

    expect(result.hits).toBe(12)
    expect(result.spreadMs).toBeGreaterThan(35)
    expect(result.score).toBeLessThan(45)
  })
})

describe("suggestRating", () => {
  const at = (score: number) => suggestRating({ ...analyseTiming([], []), hits: 4, score })

  it("maps score bands onto the four ratings", () => {
    expect(at(95)).toBe(4)
    expect(at(70)).toBe(3)
    expect(at(45)).toBe(2)
    expect(at(10)).toBe(1)
  })

  it("stays neutral when nothing was heard, rather than calling it bad", () => {
    // No hits usually means the microphone did not pick the guitar up, which
    // is not the same as playing badly.
    expect(suggestRating({ ...analyseTiming([], []), hits: 0, score: 0 })).toBe(2)
  })
})
