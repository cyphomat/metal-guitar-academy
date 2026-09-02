"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface UseCountdown {
  /** Whole seconds left, never below 0. */
  remaining: number
  isRunning: boolean
  /** Seconds counted down so far. */
  elapsed: number
  start: () => void
  pause: () => void
  reset: (seconds?: number) => void
  addSeconds: (seconds: number) => void
}

/**
 * Wall-clock countdown. Deadline-based rather than decrement-based so a
 * throttled background tab does not slow the timer down.
 */
export function useCountdown(seconds: number, onComplete?: () => void): UseCountdown {
  const [total, setTotal] = useState(seconds)
  const [remaining, setRemaining] = useState(seconds)
  const [isRunning, setIsRunning] = useState(false)

  const deadlineRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setTotal(seconds)
    setRemaining(seconds)
    deadlineRef.current = null
    setIsRunning(false)
  }, [seconds])

  useEffect(() => {
    if (!isRunning) return

    const id = setInterval(() => {
      if (deadlineRef.current === null) return
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) {
        setIsRunning(false)
        deadlineRef.current = null
        onCompleteRef.current?.()
      }
    }, 250)

    return () => clearInterval(id)
  }, [isRunning])

  const start = useCallback(() => {
    setIsRunning((running) => {
      if (running) return running
      setRemaining((left) => {
        deadlineRef.current = Date.now() + left * 1000
        return left
      })
      return true
    })
  }, [])

  const pause = useCallback(() => {
    if (deadlineRef.current !== null) {
      setRemaining(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)))
    }
    deadlineRef.current = null
    setIsRunning(false)
  }, [])

  const reset = useCallback((next?: number) => {
    const value = next ?? seconds
    setTotal(value)
    setRemaining(value)
    deadlineRef.current = null
    setIsRunning(false)
  }, [seconds])

  const addSeconds = useCallback((extra: number) => {
    setRemaining((left) => {
      const next = left + extra
      if (deadlineRef.current !== null) deadlineRef.current += extra * 1000
      return next
    })
    setTotal((value) => value + extra)
  }, [])

  return { remaining, isRunning, elapsed: Math.max(0, total - remaining), start, pause, reset, addSeconds }
}
