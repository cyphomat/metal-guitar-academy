"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AudioEngine } from "@/lib/audio/audio-engine"
import { Metronome, type MetronomeTick } from "@/lib/audio/metronome"

export interface UseMetronomeOptions {
  bpm: number
  beatsPerBar?: number
  subdivision?: number
  /** Called as each beat sounds. Use it to record what the player was asked for. */
  onTick?: (tick: MetronomeTick) => void
}

export interface UseMetronome {
  isRunning: boolean
  bpm: number
  setBpm: (bpm: number) => void
  /** Beat within the bar, or -1 while stopped. */
  beatInBar: number
  start: () => Promise<void>
  stop: () => void
}

export function useMetronome(engine: AudioEngine, options: UseMetronomeOptions): UseMetronome {
  const { beatsPerBar = 4, subdivision = 1 } = options

  const metronomeRef = useRef<Metronome | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [bpm, setBpmState] = useState(options.bpm)
  const [beatInBar, setBeatInBar] = useState(-1)

  const onTickRef = useRef(options.onTick)
  onTickRef.current = options.onTick

  const handleTick = useCallback((tick: MetronomeTick) => {
    setBeatInBar(tick.beatInBar)
    onTickRef.current?.(tick)
  }, [])

  const getMetronome = useCallback(() => {
    if (!metronomeRef.current) {
      metronomeRef.current = new Metronome(engine, {
        bpm,
        beatsPerBar,
        subdivision,
        onTick: handleTick,
      })
    }
    return metronomeRef.current
  }, [beatsPerBar, bpm, engine, handleTick, subdivision])

  useEffect(() => {
    return () => {
      metronomeRef.current?.dispose()
      metronomeRef.current = null
    }
  }, [])

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
    setBeatInBar(-1)
  }, [])

  return { isRunning, bpm, setBpm, beatInBar, start, stop }
}
