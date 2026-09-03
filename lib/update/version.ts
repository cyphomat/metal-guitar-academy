import { z } from "zod"

/**
 * Der Bau-Stempel: welcher Stand ist das hier.
 *
 * Zwei Exemplare davon gibt es zur Laufzeit. Eines steckt im Bündel und sagt,
 * was der Browser gerade *ausführt*; das andere liegt als `version.json` auf
 * dem Server und sagt, was dort *liegt*. Weichen sie ab, hält der Browser eine
 * alte Fassung fest — genau das ist die Update-Erkennung.
 */
export const buildStampSchema = z.object({
  commit: z.string(),
  committedAt: z.string(),
  repo: z.string(),
})

export type BuildStamp = z.infer<typeof buildStampSchema>

/** Das Original. Ein Fork trägt hier seinen eigenen Namen und fällt damit auf. */
export const UPSTREAM = "cyphomat/riffforge"

/**
 * Das Repo hiess bis September 2026 `metal-guitar-academy`. GitHub leitet
 * weiter, aber ein Klon von davor trägt den alten Namen noch im Remote — ohne
 * diese Zeile hielte sich das Original für einen Fork seiner selbst.
 */
const UPSTREAM_ALIASES = [UPSTREAM, "cyphomat/metal-guitar-academy"]

/**
 * Was gerade läuft, aus dem Bündel.
 *
 * Ein Entwicklungslauf ohne Git hat keinen Stempel: dann ist die Antwort
 * `null` und die App sagt "unbekannt", statt sich etwas auszudenken.
 */
export function runningBuild(): BuildStamp | null {
  const commit = process.env.NEXT_PUBLIC_COMMIT ?? ""
  if (commit === "") return null
  return {
    commit,
    committedAt: process.env.NEXT_PUBLIC_COMMITTED_AT ?? "",
    repo: process.env.NEXT_PUBLIC_REPO ?? "",
  }
}

export type UpdateState =
  /** Bündel und Server tragen denselben Commit. */
  | "aktuell"
  /** Auf dem Server liegt ein neuerer Stand — neu laden holt ihn. */
  | "neuer-da"
  /** Der Server ist älter: jemand hat zurückgerollt. Neu laden gilt trotzdem. */
  | "zurueckgerollt"
  /** Kein Stempel auf einer der beiden Seiten. Keine Aussage möglich. */
  | "unbekannt"

/**
 * Vergleicht Laufendes mit Ausgeliefertem.
 *
 * Die Richtung entscheidet der Commit-Zeitpunkt, nicht der Bauzeitpunkt: zwei
 * Bauläufe desselben Commits sind derselbe Stand, und eine Uhr würde etwas
 * anderes behaupten.
 */
export function compareBuilds(
  running: BuildStamp | null,
  deployed: BuildStamp | null,
): UpdateState {
  if (!running || !deployed) return "unbekannt"
  if (running.commit === "" || deployed.commit === "") return "unbekannt"
  if (running.commit === deployed.commit) return "aktuell"

  const hier = Date.parse(running.committedAt)
  const dort = Date.parse(deployed.committedAt)
  if (Number.isNaN(hier) || Number.isNaN(dort)) return "neuer-da"
  return dort >= hier ? "neuer-da" : "zurueckgerollt"
}

/** Läuft diese Auslieferung aus einem Fork statt aus dem Original? */
export function isFork(running: BuildStamp | null): boolean {
  if (!running || running.repo === "") return false
  return !UPSTREAM_ALIASES.includes(running.repo)
}

/** Kurzform, wie git sie zeigt. */
export function shortCommit(commit: string): string {
  return commit.slice(0, 7)
}

/** Ein Commit im Original, so weit die App ihn braucht. */
export interface UpstreamCommit {
  sha: string
  date: string
}

export interface UpstreamNews {
  /** Wie viele Commits das Original seit diesem Stand hat. */
  commits: number
  /** Wann zuletzt, ISO. Null, wenn nichts Neues da ist. */
  newest: string | null
  /**
   * Ob die Zählung an der Seitengrösse hängengeblieben ist. Dann heisst es
   * "mindestens", nicht "genau" — eine Zahl, die stimmen könnte, ist keine.
   */
  capped: boolean
}

/** Wie viele Seiten die GitHub-Antwort höchstens umfasst. */
export const UPSTREAM_PAGE_SIZE = 100

/**
 * Wertet die Commit-Liste des Originals aus.
 *
 * GitHub liefert bei `?since=` den eigenen Stand mit, wenn er auf die Sekunde
 * passt — der zählt nicht als Neuigkeit und fliegt deshalb raus.
 */
export function upstreamNews(
  commits: UpstreamCommit[],
  running: BuildStamp | null,
): UpstreamNews {
  const neuere = commits.filter((commit) => commit.sha !== running?.commit)
  if (neuere.length === 0) return { commits: 0, newest: null, capped: false }

  const zeiten = neuere
    .map((commit) => Date.parse(commit.date))
    .filter((zeit) => !Number.isNaN(zeit))

  return {
    commits: neuere.length,
    newest: zeiten.length > 0 ? new Date(Math.max(...zeiten)).toISOString() : null,
    capped: commits.length >= UPSTREAM_PAGE_SIZE,
  }
}
