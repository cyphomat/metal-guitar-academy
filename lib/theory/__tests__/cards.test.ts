import { describe, expect, it } from "vitest"
import { cardById, cardsOfStufe, THEORY_CARDS } from "@/lib/theory/cards"
import { intervalBetween, noteAt } from "@/lib/theory/fretboard"
import {
  beatSeconds,
  beatsFor,
  bewerteFigur,
  EINZAEHLER_SCHLAEGE,
  FIGUREN,
  figurById,
  patternTimes,
  periodeOf,
  toleranceSeconds,
} from "@/lib/theory/rhythm"
import { STUFEN, type Griff } from "@/lib/theory/types"

const g = (saite: number, bund: number) => ({ saite, bund }) as Griff

/** Kleinstes gemeinsames Vielfaches — für Längen, in denen zwei Figuren aufgehen. */
const ggt = (a: number, b: number): number => (b === 0 ? a : ggt(b, a % b))
const kgv = (a: number, b: number) => (a / ggt(a, b)) * b

describe("Katalog", () => {
  it("hat lauter eindeutige Kennungen", () => {
    const ids = THEORY_CARDS.map((card) => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("nennt nur Stufen, die es gibt", () => {
    const bekannt = STUFEN.map((stufe) => stufe.nummer)
    for (const card of THEORY_CARDS) expect(bekannt).toContain(card.stufe)
  })

  it("hat in jeder Stufe etwas", () => {
    for (const stufe of STUFEN) {
      expect(cardsOfStufe(stufe.nummer).length, `Stufe ${stufe.nummer}`).toBeGreaterThan(0)
    }
  })

  it("ordnet jede Karte genau einer Stufe zu", () => {
    const summe = STUFEN.reduce((zahl, stufe) => zahl + cardsOfStufe(stufe.nummer).length, 0)
    expect(summe).toBe(THEORY_CARDS.length)
  })

  it("findet eine Karte über ihre Kennung", () => {
    expect(cardById("i-tritonus")?.begriff).toBe("Tritonus")
    expect(cardById("gibt-es-nicht")).toBeUndefined()
  })
})

describe("Jede Karte", () => {
  it.each(THEORY_CARDS.map((card) => [card.id, card] as const))(
    "%s ist vollständig",
    (_id, card) => {
      expect(card.begriff.length).toBeGreaterThan(2)
      // Zwei bis drei Sätze — die Länge eines why-Feldes. Kürzer erklärt
      // nichts, viel länger sind meistens zwei Karten.
      expect(card.erklaerung.length).toBeGreaterThan(80)
      expect(card.erklaerung.length).toBeLessThan(700)
      expect(card.frage.text.length).toBeGreaterThan(5)
      expect(card.frage.richtig.length).toBeGreaterThan(0)
    },
  )

  it.each(THEORY_CARDS.filter((card) => card.frage.art === "auswahl").map((c) => [c.id, c] as const))(
    "%s hat die richtige Antwort unter den Möglichkeiten",
    (_id, card) => {
      expect(card.frage.auswahl).toBeDefined()
      expect(card.frage.auswahl!.length).toBeGreaterThanOrEqual(3)
      for (const richtig of card.frage.richtig as string[]) {
        expect(card.frage.auswahl).toContain(richtig)
      }
      expect(new Set(card.frage.auswahl).size).toBe(card.frage.auswahl!.length)
    },
  )

  it.each(
    THEORY_CARDS.filter((card) => card.frage.art === "griffbrett").map((c) => [c.id, c] as const),
  )("%s zeigt bei %s auf echte Stellen des Halses", (_id, card) => {
    const stellen = card.frage.richtig as Griff[]
    expect(stellen.length).toBeGreaterThan(0)
    for (const stelle of stellen) {
      expect(stelle.saite).toBeGreaterThanOrEqual(1)
      expect(stelle.saite).toBeLessThanOrEqual(6)
      expect(stelle.bund).toBeGreaterThanOrEqual(0)
      expect(stelle.bund).toBeLessThanOrEqual(15)
    }
    // Alle richtigen Stellen müssen denselben Ton tragen, sonst ist eine davon
    // schlicht falsch.
    const toene = new Set(stellen.map((stelle) => noteAt(stelle)))
    expect(toene.size).toBe(1)
  })
})

/**
 * Die Erklärungen behaupten Töne und Abstände. Was sich nachrechnen lässt,
 * wird nachgerechnet — ein falscher Bund im Fliesstext fällt sonst niemandem
 * auf, und Übungsmaterial, das lügt, ist schlimmer als keines.
 */
describe("Gespielte Fragen", () => {
  const gespielt = THEORY_CARDS.filter((card) => card.frage.art === "gespielt")

  it("gibt es", () => {
    expect(gespielt.length).toBeGreaterThan(0)
  })

  it.each(gespielt.map((card) => [card.id, card] as const))("%s nennt eine echte Figur", (_id, card) => {
    const rhythmus = card.frage.rhythmus
    expect(rhythmus).toBeDefined()
    expect(figurById(rhythmus!.figurId), rhythmus!.figurId).toBeDefined()
    expect(rhythmus!.bpm).toBeGreaterThanOrEqual(40)
    expect(rhythmus!.bpm).toBeLessThanOrEqual(200)
    expect(rhythmus!.takte).toBeGreaterThan(0)
  })

  it("bleibt bei einem Tempo, das die Figur noch trennbar macht", () => {
    // Die Toleranz darf nicht so gross werden, dass eine Nachbarnote
    // mitgezählt wird — sonst gilt jede Figur als jede andere.
    for (const card of gespielt) {
      const figur = figurById(card.frage.rhythmus!.figurId)!
      const jeSchlag = beatSeconds(card.frage.rhythmus!.bpm)
      // Zwei Perioden hintereinander, damit auch der Abstand über die
      // Wiederholungsgrenze zählt: bei einer Figur, die auf eine Lücke endet,
      // ist genau der der engste. Bewusst aus den Offsets gerechnet und nicht
      // über patternTimes — der Test soll unabhängig davon bleiben, was er prüft.
      const periode = periodeOf(figur)
      const zwei = [...figur.offsets, ...figur.offsets.map((offset) => offset + periode)]
      const engster = Math.min(...zwei.slice(1).map((offset, i) => (offset - zwei[i]) * jeSchlag))
      expect(toleranceSeconds(figur, jeSchlag), card.id).toBeLessThan(engster / 2)
    }
  })

  it("misst in ganzen Takten", () => {
    // Die Figur bestimmt die Länge, nicht die Taktzahl — und wenn sie im Takt
    // nicht aufgeht, steht auf dem Schirm „9 Schläge" statt „2 Takte". Das ist
    // ehrlich, aber sonderbar; deshalb hier gerade rücken statt dort.
    for (const card of gespielt) {
      const { figurId, takte } = card.frage.rhythmus!
      expect(beatsFor(figurById(figurId)!, takte) % 4, card.id).toBe(0)
    }
  })

  it("stellt keine Figur, die eine andere aus Versehen mitbeantwortet", () => {
    // Der Prüfstein für das ganze Verfahren: wer die gefragte Figur nicht
    // kann, darf sie nicht mit einer anderen bestehen. Gemessen wird mit
    // demselben Urteil wie in der App — Trefferquote *und* Genauigkeit.
    for (const card of gespielt) {
      const { figurId, bpm, takte } = card.frage.rhythmus!
      const figur = figurById(figurId)!
      const jeSchlag = beatSeconds(bpm)
      const toleranz = toleranceSeconds(figur, jeSchlag)

      for (const andere of FIGUREN) {
        if (andere.id === figur.id) continue
        // Genug Schläge, dass beide Figuren ganz aufgehen: eine abgeschnittene
        // Periode sähe fälschlich nach Unterscheidbarkeit aus.
        const laenge = kgv(beatsFor(figur, takte), periodeOf(andere))
        const einzaehler = Array.from({ length: EINZAEHLER_SCHLAEGE }, (_, i) => i * jeSchlag)
        const start = EINZAEHLER_SCHLAEGE * jeSchlag
        const schlaege = Array.from({ length: laenge }, (_, i) => start + i * jeSchlag)

        const urteil = bewerteFigur({
          onsets: [...einzaehler, ...patternTimes(schlaege, andere, jeSchlag)],
          einzaehler,
          erwartet: patternTimes(schlaege, figur, jeSchlag),
          toleranz,
        })
        expect(urteil.richtig, `${card.id} ← ${andere.id}`).toBe(false)
      }
    }
  })
})

describe("Fragen nach der Schreibweise", () => {
  it("werden wörtlich verglichen, sonst beantwortet die Frage sich selbst", () => {
    // "Wie heisst dieser Ton in einer Tabulatur" liesse sich mit dem H aus der
    // Frage beantworten, weil die Eingabe H und B als denselben Ton liest.
    const karte = cardById("m-h-oder-b")
    expect(karte?.frage.woertlich).toBe(true)
    expect(karte?.frage.richtig).toEqual(["B"])
  })
})

describe("Was im Text steht, stimmt auch", () => {
  it("tiefe E-Saite: 3. Bund G, 5. Bund A, 7. Bund B", () => {
    expect(noteAt(g(6, 3))).toBe("G")
    expect(noteAt(g(6, 5))).toBe("A")
    expect(noteAt(g(6, 7))).toBe("B")
  })

  it("A-Saite: 3. Bund C, 5. Bund D, 7. Bund E", () => {
    expect(noteAt(g(5, 3))).toBe("C")
    expect(noteAt(g(5, 5))).toBe("D")
    expect(noteAt(g(5, 7))).toBe("E")
  })

  it("d-Saite 5. Bund ist G", () => {
    expect(noteAt(g(4, 5))).toBe("G")
  })

  it("benachbarte Leersaiten sind Quarten — ausser G zu B", () => {
    expect(intervalBetween(g(6, 0), g(5, 0)).name).toBe("Quarte")
    expect(intervalBetween(g(5, 0), g(4, 0)).name).toBe("Quarte")
    expect(intervalBetween(g(4, 0), g(3, 0)).name).toBe("Quarte")
    expect(intervalBetween(g(3, 0), g(2, 0)).name).toBe("grosse Terz")
    expect(intervalBetween(g(2, 0), g(1, 0)).name).toBe("Quarte")
  })

  it("vom 3. zum 10. Bund derselben Saite ist eine Quinte", () => {
    expect(intervalBetween(g(6, 3), g(6, 10)).name).toBe("Quinte")
  })

  it("die Quinte liegt eine Saite höher und zwei Bünde weiter", () => {
    expect(intervalBetween(g(6, 5), g(5, 7)).name).toBe("Quinte")
  })

  it("die Oktave von der d-Saite braucht drei Bünde, nicht zwei", () => {
    // Genau der Knick: der Weg führt über die h-Saite.
    expect(intervalBetween(g(4, 5), g(2, 8)).name).toBe("Oktave")
    expect(noteAt(g(2, 8))).toBe(noteAt(g(4, 5)))
  })

  it("G# und Ab liegen auf demselben Bund", () => {
    // Die Karte "Zwei Namen, ein Bund" behauptet das.
    expect(noteAt(g(6, 4))).toBe("G#")
  })

  it("der Tritonus zur Quinte liegt einen Bund tiefer — die Blue Note", () => {
    expect(intervalBetween(g(6, 5), g(5, 6)).name).toBe("Tritonus")
    expect(intervalBetween(g(6, 5), g(5, 7)).name).toBe("Quinte")
  })
})
