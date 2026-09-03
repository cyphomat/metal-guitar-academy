import { describe, expect, it } from "vitest"
import { answersFor, cardStates, dueCards, pickCards, theorieStand } from "@/lib/theory/progress"
import type { TheoryAnswer, TheoryCard, TheoryLog } from "@/lib/theory/types"
import type { Grade } from "@/lib/theory/fsrs"

function karte(id: string, extra: Partial<TheoryCard> = {}): TheoryCard {
  return {
    id,
    stufe: 1,
    begriff: id,
    erklaerung: "…",
    frage: { art: "eingabe", text: "?", richtig: ["x"] },
    ...extra,
  }
}

function antwort(cardId: string, grade: Grade, at: string, correct = grade > 1): TheoryAnswer {
  return { cardId, grade, at, correct }
}

function log(...answers: TheoryAnswer[]): TheoryLog {
  return { version: 1, answers }
}

const JETZT = new Date("2026-09-10T12:00:00.000Z")

describe("cardStates", () => {
  it("ist ohne Antworten leer", () => {
    expect(cardStates(log()).size).toBe(0)
  })

  it("spielt Antworten in Zeitreihenfolge ab, nicht in Listenreihenfolge", () => {
    // Genau der Fall nach einem Abgleich: zwei Geräte, deren Einträge
    // verschmolzen wurden und dabei durcheinandergeraten sind.
    const geordnet = log(
      antwort("a", 3, "2026-09-01T10:00:00Z"),
      antwort("a", 1, "2026-09-03T10:00:00Z"),
      antwort("a", 3, "2026-09-05T10:00:00Z"),
    )
    const gemischt = log(
      antwort("a", 3, "2026-09-05T10:00:00Z"),
      antwort("a", 3, "2026-09-01T10:00:00Z"),
      antwort("a", 1, "2026-09-03T10:00:00Z"),
    )
    expect(cardStates(gemischt).get("a")).toEqual(cardStates(geordnet).get("a"))
  })

  it("überspringt einen unlesbaren Zeitstempel, statt alles zu verlieren", () => {
    const stand = cardStates(
      log(antwort("a", 3, "kaputt"), antwort("b", 3, "2026-09-01T10:00:00Z")),
    )
    expect(stand.has("a")).toBe(false)
    expect(stand.has("b")).toBe(true)
  })

  it("hält Karten auseinander", () => {
    const stand = cardStates(
      log(antwort("a", 4, "2026-09-01T10:00:00Z"), antwort("b", 1, "2026-09-01T10:00:00Z")),
    )
    expect(stand.get("a")!.stability).toBeGreaterThan(stand.get("b")!.stability!)
  })
})

describe("dueCards", () => {
  const karten = [karte("a"), karte("b"), karte("c")]

  it("gibt neue Karten zurück, wenn nichts beantwortet wurde", () => {
    const faellig = dueCards(karten, log(), JETZT)
    expect(faellig).toHaveLength(3)
    expect(faellig.every((eintrag) => eintrag.state === null)).toBe(true)
  })

  it("lässt weg, was noch nicht dran ist", () => {
    // Gerade eben mit "Leicht" beantwortet — kommt so schnell nicht wieder.
    const faellig = dueCards(karten, log(antwort("a", 4, JETZT.toISOString())), JETZT)
    expect(faellig.map((eintrag) => eintrag.card.id)).toEqual(["b", "c"])
  })

  it("stellt Fälliges vor Neues", () => {
    // Sonst sammelt man Neues an, während der Rückstand wächst.
    const vorWochen = "2026-08-01T10:00:00Z"
    const faellig = dueCards(karten, log(antwort("c", 1, vorWochen)), JETZT)
    expect(faellig[0].card.id).toBe("c")
    expect(faellig[0].state).not.toBeNull()
  })

  it("sortiert Fälliges nach dem, was am schlechtesten sitzt", () => {
    const faellig = dueCards(
      karten,
      log(antwort("a", 3, "2026-08-20T10:00:00Z"), antwort("b", 3, "2026-09-08T10:00:00Z")),
      JETZT,
    )
    const ids = faellig.filter((eintrag) => eintrag.state).map((eintrag) => eintrag.card.id)
    // a liegt länger zurück, sitzt also schlechter und kommt zuerst.
    expect(ids[0]).toBe("a")
  })
})

describe("pickCards", () => {
  const karten = [
    karte("rhythmus-1", { technique: "gallop" }),
    karte("lead-1", { technique: "bending" }),
    karte("allgemein-1"),
  ]

  it("nimmt höchstens so viele wie verlangt", () => {
    expect(pickCards(karten, log(), 2)).toHaveLength(2)
  })

  it("zieht passendes Thema vor, ohne den Rest auszuschliessen", () => {
    const gewaehlt = pickCards(karten, log(), 3, { now: JETZT, technique: "bending" })
    expect(gewaehlt[0].id).toBe("lead-1")
    expect(gewaehlt).toHaveLength(3)
  })

  it("ist kein Filter: ohne passende Karte kommt trotzdem etwas", () => {
    const gewaehlt = pickCards(karten, log(), 2, { now: JETZT, technique: "downpicking" })
    expect(gewaehlt).toHaveLength(2)
  })

  it("gibt nichts zurück, wenn alles frisch beantwortet ist", () => {
    const alle = log(...karten.map((k) => antwort(k.id, 4, JETZT.toISOString())))
    expect(pickCards(karten, alle, 4, { now: JETZT })).toHaveLength(0)
  })
})

describe("theorieStand", () => {
  const karten = [karte("a"), karte("b"), karte("c")]

  it("meldet ohne Antworten nichts, statt null Prozent zu behaupten", () => {
    expect(theorieStand(karten, log(), JETZT)).toEqual({
      angefangen: 0,
      sitzen: 0,
      faellig: 0,
      trefferquote: null,
    })
  })

  it("zählt Angefangenes, Sitzendes und Fälliges", () => {
    const stand = theorieStand(
      karten,
      log(
        antwort("a", 3, JETZT.toISOString()),
        antwort("b", 3, "2026-07-01T10:00:00Z"),
      ),
      JETZT,
    )
    expect(stand.angefangen).toBe(2)
    // a wurde gerade beantwortet, sitzt also; b liegt Monate zurück.
    expect(stand.sitzen).toBe(1)
    expect(stand.faellig).toBe(1)
  })

  it("rechnet die Trefferquote aus den Antworten, nicht aus den Noten", () => {
    const stand = theorieStand(
      karten,
      log(
        antwort("a", 1, "2026-09-01T10:00:00Z", false),
        antwort("a", 3, "2026-09-02T10:00:00Z", true),
        antwort("b", 2, "2026-09-03T10:00:00Z", true),
        antwort("c", 3, "2026-09-04T10:00:00Z", true),
      ),
      JETZT,
    )
    expect(stand.trefferquote).toBe(0.75)
  })
})

describe("answersFor", () => {
  it("gibt die Antworten einer Karte, älteste zuerst", () => {
    const gemischt = log(
      antwort("a", 3, "2026-09-05T10:00:00Z"),
      antwort("b", 3, "2026-09-01T10:00:00Z"),
      antwort("a", 1, "2026-09-02T10:00:00Z"),
    )
    expect(answersFor(gemischt, "a").map((eintrag) => eintrag.at)).toEqual([
      "2026-09-02T10:00:00Z",
      "2026-09-05T10:00:00Z",
    ])
  })
})
