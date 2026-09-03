import { describe, expect, it } from "vitest"
import referenz from "./fsrs-referenz.json"
import {
  DEFAULT_PARAMETERS,
  DESIRED_RETENTION,
  intervalDays,
  isDue,
  newCard,
  retrievability,
  review,
  type CardState,
  type Grade,
} from "@/lib/theory/fsrs"

/**
 * Der Port gilt nur, wenn er dieselben Zahlen liefert wie die Referenz.
 *
 * `fsrs-referenz.json` ist mit py-fsrs 6.3.2 erzeugt, mit abgeschalteten
 * Lernschritten und ohne Streuung — die Einstellung, der dieser Port
 * entspricht. Wer eine Formel anfasst, erzeugt die Datei neu, statt die
 * Erwartungen anzupassen.
 */

describe("Parameter", () => {
  it("stimmen mit der Referenz überein", () => {
    expect([...DEFAULT_PARAMETERS]).toEqual(referenz.parameters)
    expect(DESIRED_RETENTION).toBe(referenz.desiredRetention)
  })
})

describe("Vergessenskurve", () => {
  it("trifft die Referenzpunkte", () => {
    const card: CardState = {
      stability: referenz.retrievability.stability,
      difficulty: 5,
      lastReview: referenz.retrievability.afterGoodAt,
      due: referenz.retrievability.afterGoodAt,
    }
    for (const punkt of referenz.retrievability.points) {
      const jetzt = new Date(Date.parse(referenz.retrievability.afterGoodAt) + punkt.days * 86400000)
      expect(retrievability(card, jetzt)).toBeCloseTo(punkt.retrievability, 9)
    }
  })

  it("ist ohne Vorgeschichte null, nicht eins", () => {
    expect(retrievability(newCard())).toBe(0)
  })
})

describe.each(referenz.cases)("Verlauf: $name", ({ steps }) => {
  it("liefert Schritt für Schritt dieselbe Stabilität, Schwierigkeit und Fälligkeit", () => {
    let card = newCard(new Date(steps[0].at))

    steps.forEach((schritt, index) => {
      card = review(card, schritt.grade as Grade, new Date(schritt.at))

      const wo = `Schritt ${index + 1} (Note ${schritt.grade})`
      expect(card.stability, `${wo}: Stabilität`).toBeCloseTo(schritt.stability, 9)
      expect(card.difficulty, `${wo}: Schwierigkeit`).toBeCloseTo(schritt.difficulty, 9)
      // Zeitpunkt statt Zeichenkette: Python lässt bei null Mikrosekunden
      // das ".000" weg, gemeint ist derselbe Moment.
      expect(Date.parse(card.due), `${wo}: Fälligkeit`).toBe(Date.parse(schritt.due))
    })
  })
})

describe("intervalDays", () => {
  it("gibt nie weniger als einen Tag", () => {
    expect(intervalDays(0.001)).toBe(1)
  })

  it("wächst mit der Stabilität", () => {
    expect(intervalDays(10)).toBeGreaterThan(intervalDays(3))
    expect(intervalDays(100)).toBeGreaterThan(intervalDays(10))
  })

  it("bedeutet bei 0,9 ungefähr die Stabilität selbst", () => {
    // Genau das ist die Definition von Stabilität: der Abstand, nach dem die
    // Abrufbarkeit auf 90 % gefallen ist.
    expect(intervalDays(20, 0.9)).toBe(20)
  })

  it("verlangt bei höherer Behaltensrate kürzere Abstände", () => {
    expect(intervalDays(50, 0.95)).toBeLessThan(intervalDays(50, 0.9))
  })
})

describe("review", () => {
  const jetzt = new Date("2026-09-03T12:00:00.000Z")

  it("macht aus einer neuen Karte eine bewertete", () => {
    const card = review(newCard(jetzt), 3, jetzt)
    expect(card.stability).toBeGreaterThan(0)
    expect(card.difficulty).toBeGreaterThanOrEqual(1)
    expect(card.difficulty).toBeLessThanOrEqual(10)
    expect(card.lastReview).toBe(jetzt.toISOString())
  })

  it("hält die Schwierigkeit auch bei zwanzig Reinfällen im Rahmen", () => {
    let card = newCard(jetzt)
    let tag = jetzt
    for (let i = 0; i < 20; i += 1) {
      card = review(card, 1, tag)
      tag = new Date(tag.getTime() + 86400000)
    }
    expect(card.difficulty).toBeLessThanOrEqual(10)
    expect(card.stability).toBeGreaterThan(0)
  })

  it("belohnt Leicht mit einem grösseren Abstand als Gut", () => {
    const start = review(newCard(jetzt), 3, jetzt)
    const spaeter = new Date(jetzt.getTime() + 3 * 86400000)
    const gut = review(start, 3, spaeter)
    const leicht = review(start, 4, spaeter)
    expect(Date.parse(leicht.due)).toBeGreaterThan(Date.parse(gut.due))
  })

  it("wirft bei Nochmal auf einen kurzen Abstand zurück", () => {
    const start = review(newCard(jetzt), 4, jetzt)
    const spaeter = new Date(jetzt.getTime() + 30 * 86400000)
    const daneben = review(start, 1, spaeter)
    expect(daneben.stability!).toBeLessThan(start.stability!)
  })
})

describe("isDue", () => {
  const jetzt = new Date("2026-09-03T12:00:00.000Z")

  it("ist bei einer neuen Karte sofort wahr", () => {
    expect(isDue(newCard(jetzt), jetzt)).toBe(true)
  })

  it("wird erst zum Termin wieder wahr", () => {
    const card = review(newCard(jetzt), 3, jetzt)
    expect(isDue(card, jetzt)).toBe(false)
    expect(isDue(card, new Date(card.due))).toBe(true)
  })
})
