import { practiceLogSchema, type PracticeLog } from "@/lib/session/types"
import { ConflictError, type RemoteStore } from "./store"
import type { SyncSettings } from "./settings"

const API = "https://api.github.com"

/**
 * Der Log liegt als eine Datei im Wurzelverzeichnis.
 *
 * Bewusst nicht in einem Ordner namens `log` — Inhaltsblocker, Netzwerkfilter
 * und Firmen-WLANs verwerfen Adressen mit diesem Wegstück regelmässig, weil
 * dort sonst Telemetrie abfliesst. Der Name ist deshalb neutral.
 */
export const LOG_PATH = "uebungen.json"

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

export function githubStore(settings: SyncSettings): RemoteStore {
  const base = repoPath(settings, `/contents/${LOG_PATH}`)

  return {
    async read() {
      const response = await call(settings, `${base}?ref=main`)
      if (response.status === 404) return null
      if (!response.ok) {
        throw new Error(`GitHub ${response.status} beim Lesen.`)
      }

      const data = await response.json()
      if (!data?.content) return null

      const parsed = practiceLogSchema.safeParse(JSON.parse(decodeBase64(data.content)))
      if (!parsed.success) {
        // Lieber abbrechen als eine kaputte Gegenseite über den lokalen Stand
        // legen. Die Datei bleibt liegen und kann von Hand angesehen werden.
        throw new Error(`${LOG_PATH} im Datenrepo passt nicht zum Format.`)
      }
      return { log: parsed.data, sha: data.sha as string }
    },

    async write(log: PracticeLog, sha?: string) {
      const body: Record<string, unknown> = {
        message: `Übungs-Log: ${log.results.length} Einträge`,
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
