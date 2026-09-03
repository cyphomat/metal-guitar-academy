import type { ZodType } from "zod"
import { practiceLogSchema, type PracticeLog } from "@/lib/session/types"
import { theoryLogSchema, type TheoryLog } from "@/lib/theory/types"
import { ConflictError, type RemoteStore } from "./store"
import type { SyncSettings } from "./settings"

const API = "https://api.github.com"

/**
 * Die Logs liegen als je eine Datei im Wurzelverzeichnis.
 *
 * Bewusst nicht in einem Ordner namens `log` — Inhaltsblocker, Netzwerkfilter
 * und Firmen-WLANs verwerfen Adressen mit diesem Wegstück regelmässig, weil
 * dort sonst Telemetrie abfliesst. Die Namen sind deshalb neutral.
 *
 * Und bewusst **zwei** Dateien statt einer mit zwei Feldern: ein Gerät mit
 * älterem Stand kennt das jüngere Feld nicht, streift es beim Einlesen ab und
 * schriebe es beim nächsten Abgleich weg. Getrennte Dateien können sich nicht
 * gegenseitig löschen.
 */
export const LOG_PATH = "uebungen.json"
export const THEORY_PATH = "theorie.json"

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decodeBase64(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ""))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

/**
 * Konto und Repo kommen aus einem Textfeld und dürfen den Pfad nicht
 * verlassen. Ohne Kodierung landet ein Wert wie `repo/../..` auf einem ganz
 * anderen Endpunkt — mit dem Token im Kopf der Anfrage —, und ein `#` schneidet
 * den Rest des Pfades einfach ab.
 */
function repoPath(settings: SyncSettings, suffix = ""): string {
  const owner = encodeURIComponent(settings.owner)
  const repo = encodeURIComponent(settings.repo)
  return `/repos/${owner}/${repo}${suffix}`
}

async function call(
  settings: SyncSettings,
  path: string,
  options: RequestInit = {},
  attempt = 1,
): Promise<Response> {
  let response: Response
  try {
    response = await fetch(API + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${settings.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.headers ?? {}),
      },
    })
  } catch {
    // Safari meldet abgebrochene Anfragen als "Load failed". Das passiert auf
    // iOS regelmässig bei der ersten Anfrage, nachdem die App aus dem
    // Hintergrund geweckt wurde — ein zweiter Versuch geht fast immer durch.
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
      return call(settings, path, options, attempt + 1)
    }
    throw new Error(
      navigator.onLine ? "GitHub nicht erreichbar." : "Kein Netz — der Abgleich wartet.",
    )
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(`Token ungültig oder ohne Schreibrecht auf ${settings.repo}.`)
  }
  if (response.status === 409 || response.status === 422) {
    throw new ConflictError()
  }
  return response
}

/**
 * Ob das Datenrepo öffentlich ist.
 *
 * Die App schreibt jede Session dorthin. Steht es auf öffentlich, liest das
 * die ganze Welt mit, und niemand merkt es — die App funktioniert genauso.
 * Deshalb wird gefragt statt angenommen.
 *
 * null heisst "nicht feststellbar". Unbekannt ist nicht dasselbe wie
 * öffentlich.
 */
export async function repoIsPublic(settings: SyncSettings): Promise<boolean | null> {
  try {
    const response = await call(settings, repoPath(settings))
    if (!response.ok) return null
    const data = await response.json()
    return typeof data.private === "boolean" ? !data.private : null
  } catch {
    return null
  }
}

/**
 * Ein Ablageort im Datenrepo: eine Datei, ein Schema.
 *
 * Das Schema ist Pflicht, nicht Zierde — was von der Gegenseite kommt, ist
 * Fremdinhalt, und über den lokalen Stand gelegt wird nur, was passt.
 */
/** Wie viele Einträge in einem Log stecken — nur für die Commit-Meldung. */
function eintraege(log: unknown): number {
  if (typeof log !== "object" || log === null) return 0
  const daten = log as { results?: unknown[]; answers?: unknown[] }
  return (daten.results ?? daten.answers ?? []).length
}

export function githubStore<T>(
  settings: SyncSettings,
  path: string,
  schema: ZodType<T>,
): RemoteStore<T> {
  const base = repoPath(settings, `/contents/${path}`)

  return {
    async read() {
      const response = await call(settings, `${base}?ref=main`)
      if (response.status === 404) return null
      if (!response.ok) {
        throw new Error(`GitHub ${response.status} beim Lesen.`)
      }

      const data = await response.json()
      if (!data?.content) return null

      const parsed = schema.safeParse(JSON.parse(decodeBase64(data.content)))
      if (!parsed.success) {
        // Lieber abbrechen als eine kaputte Gegenseite über den lokalen Stand
        // legen. Die Datei bleibt liegen und kann von Hand angesehen werden.
        throw new Error(`${path} im Datenrepo passt nicht zum Format.`)
      }
      return { log: parsed.data, sha: data.sha as string }
    },

    async write(log: T, sha?: string) {
      const body: Record<string, unknown> = {
        message: `${path}: ${eintraege(log)} Einträge`,
        content: encodeBase64(`${JSON.stringify(log, null, 2)}\n`),
        branch: "main",
      }
      if (sha) body.sha = sha

      const response = await call(settings, base, {
        method: "PUT",
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error(`GitHub ${response.status} beim Schreiben.`)
      }
      const data = await response.json()
      return { sha: data.content.sha as string }
    },
  }
}

/** Der Übungs-Log im Datenrepo. */
export function practiceStore(settings: SyncSettings): RemoteStore<PracticeLog> {
  return githubStore(settings, LOG_PATH, practiceLogSchema)
}

/** Die Wissens-Antworten im Datenrepo. */
export function theoryStore(settings: SyncSettings): RemoteStore<TheoryLog> {
  return githubStore(settings, THEORY_PATH, theoryLogSchema)
}
