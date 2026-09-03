"use client"

import { useState } from "react"
import { Fretboard } from "@/components/theory/fretboard"
import { GRADES, type Grade } from "@/lib/theory/fsrs"
import { noteAt, parseTon, sameGriff, verwechselungshinweis } from "@/lib/theory/fretboard"
import type { Griff, TheoryCard } from "@/lib/theory/types"

/**
 * Eine Frage, eine Antwort, dann die Erklärung.
 *
 * Die Rückmeldung ist kein Beiwerk: bei niedriger Trefferquote kehrt sich der
 * Vorteil des Abfragens ohne sie sogar um — wer rät und nichts erfährt, lernt
 * die falsche Antwort. Deshalb steht nach jedem Versuch die richtige Antwort
 * da, und darunter, warum sie richtig ist.
 */

function istRichtig(card: TheoryCard, antwort: Griff | string | null): boolean {
  if (antwort === null) return false

  if (card.frage.art === "griffbrett") {
    const stellen = card.frage.richtig as Griff[]
    return typeof antwort !== "string" && stellen.some((stelle) => sameGriff(stelle, antwort))
  }

  const erwartet = card.frage.richtig as string[]
  const getippt = String(antwort).trim()
  if (getippt === "") return false

  if (erwartet.some((wert) => wert.toLowerCase() === getippt.toLowerCase())) return true

  // Sonst als Ton gelesen: "fis" und "F#" meinen dasselbe. Bei einer Frage
  // nach der Schreibweise wäre genau das der Fehler — dort zählt das Wort.
  if (card.frage.woertlich) return false

  const alsTon = parseTon(getippt)
  return alsTon !== null && erwartet.some((wert) => parseTon(wert) === alsTon)
}

export interface QuizCardProps {
  card: TheoryCard
  onAnswer: (grade: Grade, correct: boolean) => void
  /** Kopfzeile, etwa "Frage 2 von 4". */
  zaehler?: string
}

export function QuizCard({ card, onAnswer, zaehler }: QuizCardProps) {
  const [griff, setGriff] = useState<Griff | null>(null)
  const [text, setText] = useState("")
  const [aufgeloest, setAufgeloest] = useState(false)

  const antwort: Griff | string | null = card.frage.art === "griffbrett" ? griff : text
  const richtig = istRichtig(card, antwort)
  const bereit = card.frage.art === "griffbrett" ? griff !== null : text.trim() !== ""

  const loesungen = card.frage.richtig
  const hinweis =
    card.frage.art !== "griffbrett" && !richtig
      ? verwechselungshinweis(text, parseTon((loesungen as string[])[0]) ?? "C")
      : null

  return (
    <div className="space-y-4">
      <div>
        {zaehler && <p className="kicker text-dim">{zaehler}</p>}
        <h2 className="display mt-1 text-[26px] leading-tight text-fg sm:text-[30px]">
          {card.frage.text}
        </h2>
      </div>

      {card.frage.art === "griffbrett" && (
        <Fretboard
          gegeben={card.frage.gegeben}
          gewaehlt={griff}
          loesung={aufgeloest ? (loesungen as Griff[]) : undefined}
          onPick={aufgeloest ? null : (gewaehlt) => setGriff(gewaehlt)}
        />
      )}

      {card.frage.art === "eingabe" && (
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && bereit && !aufgeloest) setAufgeloest(true)
          }}
          disabled={aufgeloest}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Antwort"
          className="w-full border border-line bg-sunken px-3 py-3 font-mono text-[16px] text-fg outline-none focus:border-akzent disabled:text-muted"
        />
      )}

      {card.frage.art === "auswahl" && (
        <div className="grid gap-[9px] sm:grid-cols-2">
          {card.frage.auswahl?.map((option) => {
            const gewaehlt = text === option
            const istLoesung = (loesungen as string[]).includes(option)
            const rahmen = aufgeloest
              ? istLoesung
                ? "border-gruen text-gruen"
                : gewaehlt
                  ? "border-rot text-rot"
                  : "border-line text-dim"
              : gewaehlt
                ? "border-akzent text-fg"
                : "border-line text-muted"
            return (
              <button
                key={option}
                onClick={() => !aufgeloest && setText(option)}
                disabled={aufgeloest}
                className={`border p-[14px] text-left font-mono text-[14px] transition-colors ${rahmen}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}

      {!aufgeloest ? (
        <button onClick={() => setAufgeloest(true)} disabled={!bereit} className="btn w-full">
          Auflösen
        </button>
      ) : (
        <div className="space-y-4">
          <div
            className={`border-l-2 py-2 pl-3 ${richtig ? "border-gruen" : "border-rot"}`}
          >
            <p className={`kicker ${richtig ? "text-gruen" : "text-rot"}`}>
              {richtig ? "Sitzt" : "Daneben"}
            </p>
            {!richtig && (
              <p className="mt-1 text-[15px] text-fg">
                Richtig ist{" "}
                <b className="font-mono">
                  {card.frage.art === "griffbrett"
                    ? `${noteAt((loesungen as Griff[])[0])} — ${(loesungen as Griff[])
                        .slice(0, 3)
                        .map((stelle) => `Saite ${stelle.saite}, Bund ${stelle.bund}`)
                        .join(" oder ")}`
                    : (loesungen as string[])[0]}
                </b>
                .
              </p>
            )}
            {hinweis && <p className="mt-1 text-[14px] leading-relaxed text-akzent">{hinweis}</p>}
          </div>

          <div>
            <p className="kicker text-dim">{card.begriff}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">{card.erklaerung}</p>
          </div>

          <div>
            <h3 className="rule mb-3">Wie lief&apos;s?</h3>
            <div className="grid gap-[9px] sm:grid-cols-2">
              {GRADES.map((note) => {
                // Vorschlag, keine Vorgabe: falsch beantwortet heisst
                // "Nochmal", richtig heisst "Gut". Überschreiben geht immer.
                const empfohlen = richtig ? note.value === 3 : note.value === 1
                return (
                  <button
                    key={note.value}
                    onClick={() => onAnswer(note.value as Grade, richtig)}
                    className={`border p-[14px] text-left transition-colors ${
                      empfohlen ? "border-akzent bg-[--tint-akzent]" : "border-line"
                    }`}
                  >
                    <span className="display block text-[17px] text-fg">{note.label}</span>
                    <span className="text-[13px] text-dim">{note.hint}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
