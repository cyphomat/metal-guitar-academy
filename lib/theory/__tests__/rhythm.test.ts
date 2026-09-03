import { describe, expect, it } from "vitest"
import {
  beatSeconds,
  bewerteFigur,
  EINZAEHLER_SCHLAEGE,
  figurById,
  FIGUREN,
  patternTimes,
  toleranceSeconds,
  TREFFERQUOTE_RICHTIG,
} from "@/lib/theory/rhythm"

const gallop = figurById("gallop")!

describe("Figuren", () => {
  it("beginnen alle auf dem Schlag", () => {
    for (const figur of FIGUREN) expect(figur.offsets[0]).toBe(0)
  })

  it("bleiben innerhalb eines Schlags", () => {
    for (const figur of FIGUREN) {
      for (const offset of figur.offsets) {
        expect(offset, figur.id).toBeGreaterThanOrEqual(0)
        expect(offset, figur.id).toBeLessThan(1)
      }
    }
  })

  it("beschreiben den Gallop als Achtel plus zwei Sechzehntel", () => {
    expect(gallop.offsets).toEqual([0, 0.5, 0.75])
  })

  it("kehren ihn richtig um", () => {
    expect(figurById("gallop-umgekehrt")!.offsets).toEqual([0, 0.25, 0.5])
  })
})

describe("patternTimes", () => {
  it("hängt die Figur an jeden Schlag", () => {
    const zeiten = patternTimes([0, 1], gallop, 1)
    expect(zeiten).toEqual([0, 0.5, 0.75, 1, 1.5, 1.75])
  })

  it("rechnet mit dem Tempo", () => {
    // 120 BPM sind 0,5 s je Schlag.
    const zeiten = patternTimes([10], gallop, beatSeconds(120))
    expect(zeiten).toEqual([10, 10.25, 10.375])
  })

  it("übernimmt die Schlagzeiten des Metronoms, statt sie hochzurechnen", () => {
    // Zwei Uhren gehen auseinander: leicht unregelmässige Schläge müssen
    // unverändert durchschlagen.
    const zeiten = patternTimes([0, 1.02], gallop, 1)
    expect(zeiten[3]).toBe(1.02)
  })

  it("gibt ohne Schläge nichts zurück", () => {
    expect(patternTimes([], gallop, 1)).toEqual([])
  })
})

describe("toleranceSeconds", () => {
  it("bleibt unter dem halben Abstand zum nächsten Anschlag", () => {
    const jeSchlag = beatSeconds(120)
    const engster = 0.25 * jeSchlag // Gallop: das Sechzehntel
    expect(toleranceSeconds(gallop, jeSchlag)).toBeLessThan(engster / 2)
  })

  it("wird bei langsamem Tempo nicht beliebig grosszügig", () => {
    expect(toleranceSeconds(gallop, beatSeconds(40))).toBeLessThanOrEqual(0.09)
  })

  it("ist bei schnellerem Tempo enger", () => {
    expect(toleranceSeconds(gallop, beatSeconds(180))).toBeLessThan(
      toleranceSeconds(gallop, beatSeconds(90)),
    )
  })
})

describe("bewerteFigur", () => {
  const jeSchlag = beatSeconds(120)
  const einzaehler = Array.from({ length: EINZAEHLER_SCHLAEGE }, (_, i) => i * jeSchlag)
  const figurStart = EINZAEHLER_SCHLAEGE * jeSchlag
  const schlaege = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => figurStart + i * jeSchlag)
  const erwartet = patternTimes(schlaege, gallop, jeSchlag)
  const toleranz = toleranceSeconds(gallop, jeSchlag)

  const spiele = (figur = gallop, latenz = 0, jitter = 0) => {
    const gezaehlt = einzaehler.map((zeit) => zeit + latenz)
    const gespielt = patternTimes(schlaege, figur, jeSchlag).map(
      (zeit, i) => zeit + latenz + (i % 2 ? jitter : -jitter),
    )
    return [...gezaehlt, ...gespielt]
  }

  it("erkennt eine sauber gespielte Figur", () => {
    const ergebnis = bewerteFigur({ onsets: spiele(), einzaehler, erwartet, toleranz })
    expect(ergebnis.treffer).toBe(erwartet.length)
    expect(ergebnis.richtig).toBe(true)
    expect(ergebnis.streuungMs).toBeLessThan(5)
  })

  it("lässt eine Bluetooth-Verzögerung nicht als Fehler gelten", () => {
    // 220 ms Laufzeit — die zählt in den Versatz, nicht in die Streuung.
    const ergebnis = bewerteFigur({ onsets: spiele(gallop, 0.22), einzaehler, erwartet, toleranz })
    expect(ergebnis.richtig).toBe(true)
    expect(ergebnis.versatzMs).toBeGreaterThan(180)
    expect(ergebnis.streuungMs).toBeLessThan(5)
  })

  it("erkennt, wer vorne liegt — negativer Versatz ist kein Messfehler", () => {
    const ergebnis = bewerteFigur({ onsets: spiele(gallop, -0.05), einzaehler, erwartet, toleranz })
    expect(ergebnis.versatzMs).toBeLessThan(0)
    expect(ergebnis.richtig).toBe(true)
  })

  it("verwechselt den umgekehrten Gallop nicht mit dem Gallop", () => {
    // Der eigentliche Grund für den Einzähler: mit frei gesuchtem Versatz
    // passt die Umkehrung zu über achtzig Prozent auf das Original.
    const umgekehrt = figurById("gallop-umgekehrt")!
    const ergebnis = bewerteFigur({
      onsets: spiele(umgekehrt, 0.22),
      einzaehler,
      erwartet,
      toleranz,
    })
    expect(ergebnis.richtig).toBe(false)
    expect(ergebnis.trefferquote).toBeLessThan(TREFFERQUOTE_RICHTIG)
  })

  it("lässt gerade Achtel nicht als Gallop durchgehen", () => {
    const ergebnis = bewerteFigur({
      onsets: spiele(figurById("achtel")!),
      einzaehler,
      erwartet,
      toleranz,
    })
    expect(ergebnis.richtig).toBe(false)
  })

  it("bewertet ohne Einzähler streng statt eine Verzögerung zu erfinden", () => {
    const nurFigur = patternTimes(schlaege, gallop, jeSchlag).map((zeit) => zeit + 0.22)
    const ergebnis = bewerteFigur({ onsets: nurFigur, einzaehler, erwartet, toleranz })
    expect(ergebnis.versatzMs).toBe(0)
  })

  it("meldet ohne Anschläge nichts Erfundenes", () => {
    const ergebnis = bewerteFigur({ onsets: [], einzaehler, erwartet, toleranz })
    expect(ergebnis).toMatchObject({ treffer: 0, trefferquote: 0, richtig: false, versatzMs: 0 })
  })
})
