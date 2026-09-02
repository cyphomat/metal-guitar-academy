"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SessionRunner } from "@/components/session/session-runner"

function SessionPageBody() {
  const params = useSearchParams()
  const parsed = Number.parseInt(params.get("minutes") ?? "", 10)
  const minutes = Number.isFinite(parsed) ? Math.min(60, Math.max(5, parsed)) : 15

  return <SessionRunner minutes={minutes} drillId={params.get("drill") ?? undefined} />
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto max-w-[640px] px-4 pt-8 font-mono text-[12px] uppercase tracking-[0.18em] text-dim">
          Session wird vorbereitet…
        </p>
      }
    >
      <SessionPageBody />
    </Suspense>
  )
}
