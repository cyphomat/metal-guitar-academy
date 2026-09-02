"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Metronome, type MetronomeTick } from "@/lib/audio/metronome"

export interface UseMetronome {
  isRunning: boolean
  bpm: number
  setBpm: (bpm: number) => void
  /** Beat within the bar, or -1 while stopped. */
  beatInBar: number
  bar: number
  start: () => Promise<void>
  stop: () => void
  toggle: () => Promise<void>
}

export function useMetronome(initialBpm: number, beatsPerBar = 4, subdivision = 1): UseMetronome {
  const metronomeRef = useRef<Metronome | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [bpm, setBpmState] = useState(initialBpm)
  const [tick, setTick] = useState<MetronomeTick | null>(null)

  // Built lazily: constructing an AudioContext before a user gesture makes
  // browsers complain, and on iOS leaves it permanently suspended.
  const getMetronome = useCallback(() => {
    if (!metronomeRef.current) {
      metronomeRef.current = new Metronome({ bpm, beatsPerBar, subdivision, onTick: setTick })
    }
    return metronomeRef.current
  }, [bpm, beatsPerBar, subdivision])

  useEffect(() => {
    return () => {
      metronomeRef.current?.dispose()
      metronomeRef.current = null
    }
  }, [])

  useEffect(() => {
    metronomeRef.current?.setSubdivision(subdivision)
  }, [subdivision])

  const setBpm = useCallback((next: number) => {
    setBpmState(next)
    metronomeRef.current?.setBpm(next)
  }, [])

  const start = useCallback(async () => {
    const metronome = getMetronome()
    metronome.setBpm(bpm)
    await metronome.start()
    setIsRunning(true)
  }, [bpm, getMetronome])

  const stop = useCallback(() => {
    metronomeRef.current?.stop()
    setIsRunning(false)
    setTick(null)
  }, [])

  const toggle = useCallback(async () => {
    if (isRunning) stop()
    else await start()
  }, [isRunning, start, stop])

  return {
    isRunning,
    bpm,
    setBpm,
    beatInBar: isRunning && tick ? tick.beatInBar : -1,
    bar: tick?.bar ?? 0,
    start,
    stop,
    toggle,
  }
}
