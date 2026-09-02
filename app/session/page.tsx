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
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <Suspense fallback={<div className="text-gray-400">Session wird vorbereitet…</div>}>
          <SessionPageBody />
        </Suspense>
      </div>
    </div>
  )
}
