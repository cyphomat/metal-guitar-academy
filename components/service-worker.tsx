"use client"

import { useEffect } from "react"
import { asset } from "@/lib/base-path"

/**
 * Registers the service worker so the app keeps working offline once it has
 * been opened online — which is the point of installing it to a home screen.
 *
 * Renders nothing; failure is silent on purpose, because a missing service
 * worker costs offline support and nothing else.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register(asset("/sw.js")).catch(() => {})
  }, [])

  return null
}
