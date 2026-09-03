import { describe, expect, it } from "vitest"
import { buildBackup, previewBackup } from "@/lib/backup"
import { EMPTY_LOG, type DrillResult, type PracticeLog } from "@/lib/session/types"
import { EMPTY_THEORY_LOG, type TheoryAnswer, type TheoryLog } from "@/lib/theory/types"

const eintrag = (at: string): DrillResult => ({
  drillId: "tech-gallop",
  technique: "gallop",
  bpm: 100,
  rating: 3,
  seconds: 300,
  at,
})
const antwort = (at: string, cardId = "m-halbton"): TheoryAnswer => ({
  cardId,
  grade: 3,
  correct: true,
  at,
})
const uebung = (...results: DrillResult[]): PracticeLog => ({ version: 1, results })
const theorie = (...answers: TheoryAnswer[]): TheoryLog => ({ version: 1, answers })

describe("buildBackup", () => {
  it("nimmt beide Logs mit", () => {
    const datei = buildBackup(
      uebung(eintrag("2026-09-01T10:00:00Z")),
      theorie(antwort("2026-09-01T11:00:00Z")),
    )
    expect(datei.results).toHaveLength(1)
    expect(datei.theory?.answers).toHaveLength(1)
  })

  it("lässt ein leeres Theorie-Feld ganz weg", () => {
    // Eine Datei ohne das Feld ist genau das, was frühere Fassungen erzeugt
    // haben — und bleibt für sie lesbar.
    const datei = buildBackup(uebung(eintrag("2026-09-01T10:00:00Z")), EMPTY_THEORY_LOG)
    expect(datei).not.toHaveProperty("theory")
  })
})

describe("previewBackup", () => {
  it("weist Unsinn ab, statt ihn zu übernehmen", () => {
    expect(previewBackup("kein JSON", EMPTY_LOG, EMPTY_THEORY_LOG).ok).toBe(false)
    expect(previewBackup('{"version":9}', EMPTY_LOG, EMPTY_THEORY_LOG).ok).toBe(false)
  })

  it("liest eine Datei ohne Theorie-Feld — die alte Form", () => {
    const alt = JSON.stringify(uebung(eintrag("2026-09-01T10:00:00Z")))
    const vorschau = previewBackup(alt, EMPTY_LOG, EMPTY_THEORY_LOG)
    expect(vorschau.ok).toBe(true)
    if (!vorschau.ok) return
    expect(vorschau.added).toBe(1)
    expect(vorschau.incomingTheory).toBe(0)
    expect(vorschau.addedTheory).toBe(0)
  })

  it("zählt beide Seiten getrennt", () => {
    const datei = JSON.stringify(
      buildBackup(
        uebung(eintrag("2026-09-01T10:00:00Z"), eintrag("2026-09-02T10:00:00Z")),
        theorie(antwort("2026-09-01T11:00:00Z"), antwort("2026-09-02T11:00:00Z", "m-oktave")),
      ),
    )
    const vorschau = previewBackup(
      datei,
      uebung(eintrag("2026-09-01T10:00:00Z")),
      theorie(antwort("2026-09-01T11:00:00Z")),
    )
    expect(vorschau.ok).toBe(true)
    if (!vorschau.ok) return
    expect(vorschau.incoming).toBe(2)
    expect(vorschau.added).toBe(1)
    expect(vorschau.incomingTheory).toBe(2)
    expect(vorschau.addedTheory).toBe(1)
  })

  it("wirft beim Import nichts weg, was schon da ist", () => {
    const datei = JSON.stringify(
      buildBackup(uebung(eintrag("2026-09-01T10:00:00Z")), EMPTY_THEORY_LOG),
    )
    const vorschau = previewBackup(datei, EMPTY_LOG, theorie(antwort("2026-08-01T11:00:00Z")))
    expect(vorschau.ok).toBe(true)
    if (!vorschau.ok) return
    // Die Datei bringt keine Antworten mit — die vorhandene bleibt trotzdem.
    expect(vorschau.mergedTheory.answers).toHaveLength(1)
  })

  it("meldet beim zweiten Import nichts Neues", () => {
    const stand = uebung(eintrag("2026-09-01T10:00:00Z"))
    const antworten = theorie(antwort("2026-09-01T11:00:00Z"))
    const datei = JSON.stringify(buildBackup(stand, antworten))
    const vorschau = previewBackup(datei, stand, antworten)
    expect(vorschau.ok).toBe(true)
    if (!vorschau.ok) return
    expect(vorschau.added).toBe(0)
    expect(vorschau.addedTheory).toBe(0)
  })
})
