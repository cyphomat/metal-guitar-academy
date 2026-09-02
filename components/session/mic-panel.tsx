"use client"

import type { MicStatus } from "@/lib/audio/onset-detector"
import { MdMic, MdMicOff } from "react-icons/md"

export interface MicPanelProps {
  status: MicStatus
  detail: string | null
  level: number
  hits: number
  onToggle: () => void
}

const LABELS: Record<MicStatus, string> = {
  idle: "Mikrofon aus",
  starting: "Mikrofon startet…",
  listening: "hört zu",
  denied: "Zugriff abgelehnt",
  unsupported: "nicht unterstützt",
  error: "Fehler",
}

export function MicPanel({ status, detail, level, hits, onToggle }: MicPanelProps) {
  const listening = status === "listening"
  const blocked = status === "denied" || status === "unsupported" || status === "error"

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onToggle}
          disabled={status === "starting" || status === "unsupported"}
          aria-pressed={listening}
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
            listening
              ? "border-orange-500/60 bg-orange-950/40 text-orange-400"
              : "border-gray-700 text-gray-300 hover:border-gray-600"
          }`}
        >
          {listening ? <MdMic className="h-5 w-5" /> : <MdMicOff className="h-5 w-5" />}
          {listening ? "Mikrofon an" : "Timing messen"}
        </button>

        {listening && (
          <>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-800" aria-hidden>
              <div
                className="h-full rounded-full bg-orange-500 transition-[width] duration-75"
                style={{ width: `${Math.min(100, Math.round(level * 320))}%` }}
              />
            </div>
            <span className="font-mono text-sm text-gray-400">
              {hits} {hits === 1 ? "Anschlag" : "Anschläge"}
            </span>
          </>
        )}

        {!listening && !blocked && (
          <span className="text-sm text-gray-500">{LABELS[status]}</span>
        )}
        {blocked && <span className="text-sm text-red-400">{detail ?? LABELS[status]}</span>}
      </div>

      {listening && (
        <p className="mt-3 text-xs text-gray-500">
          Kopfhörer benutzen — über Lautsprecher hört das Mikrofon das Metronom mit und zählt
          es als Anschlag.
        </p>
      )}
    </div>
  )
}
