"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AudioEngine } from "@/lib/audio/audio-engine"
import { OnsetDetector, type MicStatus } from "@/lib/audio/onset-detector"

export interface UseOnsetMic {
  status: MicStatus
  /** Human-readable reason when the status is denied, unsupported or error. */
  detail: string | null
  /** Smoothed input level, 0–1, for a meter. */
  level: number
  /** Onset times on the shared audio clock, since the last reset. */
  onsets: () => number[]
  enable: () => Promise<boolean>
  disable: () => void
  reset: () => void
}

export function useOnsetMic(engine: AudioEngine): UseOnsetMic {
  const detectorRef = useRef<OnsetDetector | null>(null)
  const onsetsRef = useRef<number[]>([])

  const [status, setStatus] = useState<MicStatus>("idle")
  const [detail, setDetail] = useState<string | null>(null)
  const [level, setLevel] = useState(0)

  const getDetector = useCallback(() => {
    if (!detectorRef.current) {
      detectorRef.current = new OnsetDetector(engine, {
        onOnset: (time) => {
          onsetsRef.current.push(time)
        },
        // Meter only: a little smoothing so it reads as a level, not a strobe.
        onLevel: (value) => setLevel((previous) => Math.max(value, previous * 0.82)),
        onStatus: (next, reason) => {
          setStatus(next)
          setDetail(reason ?? null)
          if (next !== "listening") setLevel(0)
        },
      })
    }
    return detectorRef.current
  }, [engine])

  useEffect(() => {
    return () => {
      detectorRef.current?.stop()
      detectorRef.current = null
    }
  }, [])

  const enable = useCallback(async () => getDetector().start(), [getDetector])

  const disable = useCallback(() => {
    detectorRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    onsetsRef.current = []
  }, [])

  const onsets = useCallback(() => onsetsRef.current, [])

  return { status, detail, level, onsets, enable, disable, reset }
}
