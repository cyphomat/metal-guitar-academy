import type { TimingAnalysis } from "@/lib/audio/timing"

const TREND_TEXT = {
  steady: "Tempo bleibt stabil",
  rushing: "Du wirst über den Block hinweg schneller",
  dragging: "Du wirst über den Block hinweg langsamer",
} as const

/**
 * A positive offset is mostly signal-chain latency and cannot be held against
 * the player. A negative one cannot be: latency only ever pushes a note later,
 * so playing ahead of the click is something they actually did.
 */
function offsetText(offsetMs: number): string {
  if (Math.abs(offsetMs) <= 8) return "Deine Anschläge lagen praktisch genau auf dem Klick."
  if (offsetMs > 0) {
    return `Deine Anschläge lagen konstant ${offsetMs} ms hinter dem Klick — darin steckt die Laufzeit von der Saite bis ins Mikrofon, die nicht gegen dich zählen kann.`
  }
  return `Deine Anschläge lagen konstant ${Math.abs(offsetMs)} ms vor dem Klick. Laufzeit kann einen Ton nur später machen, nie früher — du spielst also tatsächlich vorne.`
}

function Metric({ value, unit, label }: { value: string | number; unit?: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-2xl font-bold text-white">
        {value}
        {unit && <span className="ml-0.5 text-sm font-normal text-gray-500">{unit}</span>}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  )
}

/**
 * Deviations as a strip around the beat, so a glance says whether the notes sat
 * in a tight cluster or scattered. ±60 ms fills the width.
 */
function Scatter({ deviations }: { deviations: number[] }) {
  return (
    <div className="relative h-10 overflow-hidden rounded border border-gray-800 bg-black/40">
      <div className="absolute inset-y-0 left-1/2 w-px bg-gray-600" />
      {deviations.map((deviation, index) => {
        const position = 50 + Math.max(-50, Math.min(50, (deviation / 60) * 50))
        return (
          <div
            key={index}
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/70"
            style={{ left: `${position}%` }}
          />
        )
      })}
      <span className="absolute bottom-0.5 left-1 text-[10px] text-gray-600">früh</span>
      <span className="absolute bottom-0.5 right-1 text-[10px] text-gray-600">spät</span>
    </div>
  )
}

export function TimingReport({ analysis }: { analysis: TimingAnalysis }) {
  if (analysis.expected === 0) return null

  if (analysis.hits === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm text-gray-400">
        Das Mikrofon hat nichts gehört, was zum Klick passt. Lauter spielen oder näher ans
        Mikrofon — die Einschätzung unten machst du diesmal selbst.
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
      <div className="grid grid-cols-3 gap-4">
        <Metric value={analysis.score} label="Timing-Score" />
        <Metric value={`±${analysis.spreadMs}`} unit="ms" label="Streuung" />
        <Metric value={`${analysis.hits}/${analysis.expected}`} label="Getroffen" />
      </div>

      <Scatter deviations={analysis.deviationsMs} />

      <div className="space-y-1 text-sm text-gray-400">
        <p>{TREND_TEXT[analysis.trend]}.</p>
        <p className="text-xs text-gray-600">
          Gemessen wird die Streuung, nicht der Versatz. {offsetText(analysis.offsetMs)}
        </p>
      </div>
    </div>
  )
}
