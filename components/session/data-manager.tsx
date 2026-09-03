"use client"

import { useEffect, useRef, useState } from "react"
import { previewImport, type ImportPreview } from "@/lib/session/merge"
import { dayKey, practiceDays, totalMinutes } from "@/lib/session/progress"
import {
  clearLog,
  exportFilename,
  exportLog,
  hasStoredLog,
  importLog,
  loadLog,
} from "@/lib/storage/practice-log"
import { clearProfile } from "@/lib/storage/profile"
import { EMPTY_LOG, type PracticeLog } from "@/lib/session/types"
import { SyncPanel } from "@/components/session/sync-panel"
import { MdFileDownload, MdFileUpload } from "react-icons/md"

type Notice = { tone: "ok" | "err"; text: string } | null

export function DataManager() {
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)
  const [pending, setPending] = useState<(ImportPreview & { name: string }) | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  // Ein Log, der das Schema reisst, zählt null Einträge — der Knopf muss
  // trotzdem angehen, sonst kommt man an genau diese Daten nicht mehr heran.
  const [stored, setStored] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLog(loadLog())
    setStored(hasStoredLog())
  }, [])

  const days = practiceDays(log)

  const download = () => {
    const blob = new Blob([exportLog()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = exportFilename()
    link.click()
    // Erst freigeben, wenn der Browser den Download übernommen hat.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice({ tone: "ok", text: `${log.results.length} Einträge gesichert.` })
  }

  const choose = async (file: File | undefined) => {
    setNotice(null)
    setPending(null)
    if (!file) return

    const result = previewImport(await file.text(), log)
    if (!result.ok) {
      setNotice({ tone: "err", text: result.reason })
      return
    }
    setPending({ ...result, name: file.name })
  }

  const apply = () => {
    if (!pending) return
    setLog(importLog(pending.merged))
    setStored(true)
    setNotice({
      tone: "ok",
      text:
        pending.added === 0
          ? "Nichts Neues dabei — der Log war schon vollständig."
          : `${pending.added} ${pending.added === 1 ? "Eintrag" : "Einträge"} übernommen.`,
    })
    setPending(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="zwei-spalten">
      <div className="spalte">
      <section>
        <h2 className="rule mb-3 mt-8">Was drinsteht</h2>
        <div className="grid grid-cols-3 gap-[9px]">
          <div className="stat">
            <div className="n">Einträge</div>
            <div className="v">{log.results.length}</div>
          </div>
          <div className="stat">
            <div className="n">Übungstage</div>
            <div className="v">{days.length}</div>
          </div>
          <div className="stat">
            <div className="n">Minuten</div>
            <div className="v">{totalMinutes(log)}</div>
          </div>
        </div>
        {days.length > 0 && (
          <p className="mt-2 font-mono text-[11.5px] text-dim">
            seit {days[0]} · zuletzt {days[days.length - 1]}
            {days[days.length - 1] === dayKey(new Date()) && " (heute)"}
          </p>
        )}
      </section>

      </div>

      <div className="spalte">
      <SyncPanel onChanged={() => setLog(loadLog())} />

      <section>
        <h2 className="rule mb-1 mt-9">Sichern</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Eine JSON-Datei mit allem. Leg sie irgendwohin, wo sie einen Browserwechsel überlebt.
        </p>
        <button onClick={download} disabled={log.results.length === 0} className="btn w-full">
          <MdFileDownload className="h-[18px] w-[18px]" /> Exportieren
        </button>
      </section>

      <section>
        <h2 className="rule mb-1">Einlesen</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Wird <b className="text-muted">dazugelegt</b>, nicht ersetzt. Was hier schon steht,
          bleibt — auch wenn die Datei älter ist.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(event) => void choose(event.target.files?.[0])}
          className="hidden"
        />
        <button onClick={() => fileRef.current?.click()} className="btn btn-ghost w-full">
          <MdFileUpload className="h-[18px] w-[18px]" /> Datei wählen
        </button>

        {pending && (
          <div className="card mt-3">
            <span className="kicker">Vorschau</span>
            <p className="mt-1 font-mono text-[13px] text-fg">{pending.name}</p>
            <p className="mt-2 text-[14px] text-muted">
              {pending.incoming} {pending.incoming === 1 ? "Eintrag" : "Einträge"} in der Datei,
              davon <b className="text-akzent">{pending.added} neu</b>. Danach stehen{" "}
              {pending.merged.results.length} im Log.
            </p>
            <div className="mt-3 flex gap-[9px]">
              <button onClick={apply} className="btn flex-1">
                Übernehmen
              </button>
              <button onClick={() => setPending(null)} className="btn btn-ghost btn-small px-4">
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </section>

      {notice && (
        <p
          className={`border-l-2 py-2 pl-3 font-mono text-[12.5px] ${
            notice.tone === "ok" ? "border-gruen text-gruen" : "border-rot text-rot"
          }`}
        >
          {notice.text}
        </p>
      )}

      <section>
        <h2 className="rule mb-1 mt-9">Löschen</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Setzt alles zurück: Tempi, Serien, Bestwerte — und die beiden Antworten vom
          ersten Start. Danach ist die App wieder wie frisch installiert. Vorher
          exportieren.
        </p>
        {confirmClear ? (
          <div className="flex gap-[9px]">
            <button
              onClick={() => {
                clearLog()
                clearProfile()
                setLog(EMPTY_LOG)
                setStored(false)
                setConfirmClear(false)
                setNotice({ tone: "ok", text: "Alles gelöscht." })
              }}
              className="btn flex-1 border-rot bg-transparent text-rot"
            >
              Wirklich löschen
            </button>
            <button onClick={() => setConfirmClear(false)} className="btn btn-ghost btn-small px-4">
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={!stored}
            className="btn btn-ghost w-full"
          >
            Alles löschen
          </button>
        )}
      </section>
      </div>
    </div>
  )
}
