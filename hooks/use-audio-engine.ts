"use client"

import { useEffect, useRef } from "react"
import { AudioEngine } from "@/lib/audio/audio-engine"

/**
 * One AudioEngine for the lifetime of the component tree that owns it, so the
 * metronome and the microphone timestamp against the same clock.
 */
export function useAudioEngine(): AudioEngine {
  const ref = useRef<AudioEngine | null>(null)
  if (!ref.current) ref.current = new AudioEngine()

  useEffect(() => {
    const engine = ref.current
    return () => {
      void engine?.close()
    }
  }, [])

  return ref.current
}
