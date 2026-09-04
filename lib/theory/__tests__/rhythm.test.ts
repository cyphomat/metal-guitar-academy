import { describe, expect, it } from "vitest"
import {
  beatSeconds,
  beatsFor,
  bewerteFigur,
  DAEMPFUNG_MINDESTENS,
  daempfungsVerhaeltnis,
  EINZAEHLER_SCHLAEGE,
  FIGUREN,
  figurById,
  GENAUIGKEIT_RICHTIG,
  patternMarks,
  patternTimes,
  periodeOf,
  toleranceSeconds,
  TREFFERQUOTE_RICHTIG,
} from "@/lib/theory/rhythm"

const gallop = figurById("gallop")!

describe("Figuren", () => {
  it("beginnen alle auf dem Schlag", () => {
    for (const figur of FIGUREN) expect(figur.offsets[0]).toBe(0)
  })

  it("wiederholen sich nach ganzen Schlägen", () => {
    // Ganzzahlig, weil jeder Anschlag an einem gemessenen Klick hängt: eine
    // Periode von zweieinhalb Schlägen hätte für die zweite Wiederholung
    // keinen Klick mehr, an den sie sich hängen könnte.
    for (const figur of FIGUREN) {
      const periode = periodeOf(figur)
      expect(Number.isInteger(periode), figur.id).toBe(true)
      expect(periode, figur.id).toBeGreaterThanOrEqual(1)
    }
  })

  it("bleiben innerhalb ihrer Periode", () => {
    for (const figur of FIGUREN) {
      for (const offset of figur.offsets) {
        expect(offset, figur.id).toBeGreaterThanOrEqual(0)
        expect(offset, figur.id).toBeLessThan(periodeOf(figur))
      }
    }
  })

  it("sind aufsteigend und ohne Dopplung", () => {
    // Zwei gleiche Offsets machten den engsten Abstand null — und damit die
    // Toleranz null, womit gar nichts mehr träfe.
    for (const figur of FIGUREN) {
      for (let i = 1; i < figur.offsets.length; i += 1) {
        expect(figur.offsets[i], figur.id).toBeGreaterThan(figur.offsets[i - 1])
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

describe("mehrschlägige Figuren", () => {
  const drei = figurById("dreiergruppe")!

  it("legt die Dreiergruppe quer über drei Schläge", () => {
    expect(periodeOf(drei)).toBe(3)
    expect(patternTimes([0, 1, 2, 3, 4, 5], drei, 1)).toEqual([0, 0.75, 1.5, 2.25, 3, 3.75, 4.5, 5.25])
  })

  it("hängt jede Note an ihren eigenen gemessenen Schlag", () => {
    // Der zweite Schlag kam 20 ms zu spät. Die Note bei Offset 1,5 gehört zu
    // ihm — sie muss mitwandern, statt aus dem ersten Schlag hochgerechnet zu
    // werden.
    const zeiten = patternTimes([0, 1.02, 2, 3, 4, 5], drei, 1)
    expect(zeiten[2]).toBeCloseTo(1.52, 10)
  })

  it("lässt eine angebrochene Periode weg, statt sie halb zu verlangen", () => {
    // Fünf Schläge tragen eine Dreiergruppe, nicht zwei.
    expect(patternTimes([0, 1, 2, 3, 4], drei, 1)).toHaveLength(4)
  })

  it("rundet die Länge auf ganze Perioden auf", () => {
    // Zwei Takte sind acht Schläge — die dritte Gruppe wäre angefangen und
    // nie zu Ende gespielt.
    expect(beatsFor(drei, 2)).toBe(9)
    expect(beatsFor(drei, 3)).toBe(12)
    expect(beatsFor(gallop, 2)).toBe(8)
  })

  it("sieht bei der Toleranz auch über die Periodengrenze", () => {
    // Bei der Synkope ist der Abstand von der letzten Note einer Periode zur
    // ersten der nächsten der engste überhaupt. Mit nur einer Periode bliebe
    // er ungesehen und die Toleranz fiele zu grosszügig aus.
    const synkope = figurById("synkope")!
    const jeSchlag = beatSeconds(120)
    expect(synkope.offsets).toEqual([0, 0.5, 1.5])
    // Innerhalb: 0,5 und 1,0 Schläge. Über die Grenze: 1,5 → 2,0, also 0,5.
    expect(toleranceSeconds(synkope, jeSchlag)).toBeLessThan((0.5 * jeSchlag) / 2)
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

  it("lässt stures Sechzehntel-Dauerspiel nicht als Gallop durchgehen", () => {
    // Die erwarteten Zeitpunkte des Gallops — 0, ½, ¾ — liegen alle auf dem
    // Sechzehntelraster. Wer einfach durchspielt, trifft sie deshalb restlos.
    // Treffer allein können das nicht auffangen; es braucht die Gegenfrage,
    // wie viel vom Gehörten überhaupt verlangt war.
    const dauerspiel = {
      id: "sechzehntel-test",
      name: "Sechzehntel",
      offsets: [0, 0.25, 0.5, 0.75],
      beschreibung: "Vier gleich lange Töne auf jeden Schlag.",
    }
    const ergebnis = bewerteFigur({ onsets: spiele(dauerspiel), einzaehler, erwartet, toleranz })
    expect(ergebnis.trefferquote).toBe(1)
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

  it("lässt eine mitklingende Saite eine saubere Figur nicht kippen", () => {
    // Die Genauigkeit darf nicht so scharf sein, dass ein einzelner
    // Fremdanschlag eine gespielte Figur zunichte macht.
    const daneben = figurStart + 2.5 * jeSchlag + 0.03
    const ergebnis = bewerteFigur({
      onsets: [...spiele(), daneben].sort((a, b) => a - b),
      einzaehler,
      erwartet,
      toleranz,
    })
    expect(ergebnis.richtig).toBe(true)
  })
})

describe("bewerteFigur, mehrschlägig", () => {
  const drei = figurById("dreiergruppe")!
  const jeSchlag = beatSeconds(90)
  const einzaehler = Array.from({ length: EINZAEHLER_SCHLAEGE }, (_, i) => i * jeSchlag)
  const figurStart = EINZAEHLER_SCHLAEGE * jeSchlag
  // Zwölf Schläge: vier volle Dreiergruppen, drei volle Takte.
  const schlaege = Array.from({ length: 12 }, (_, i) => figurStart + i * jeSchlag)
  const erwartet = patternTimes(schlaege, drei, jeSchlag)
  const toleranz = toleranceSeconds(drei, jeSchlag)

  const spiele = (figur: typeof drei) => [
    ...einzaehler,
    ...patternTimes(schlaege, figur, jeSchlag),
  ]

  it("erkennt eine sauber gespielte Dreiergruppe", () => {
    expect(erwartet).toHaveLength(16)
    const ergebnis = bewerteFigur({ onsets: spiele(drei), einzaehler, erwartet, toleranz })
    expect(ergebnis.treffer).toBe(16)
    expect(ergebnis.richtig).toBe(true)
  })

  it("lässt durchgespielte Sechzehntel nicht als Dreiergruppe durchgehen", () => {
    // Der eigentliche Prüfstein für die Periode: die vier verlangten
    // Zeitpunkte liegen alle auf dem Sechzehntelraster, wer durchspielt trifft
    // sie also restlos. Nur die Genauigkeit trennt hier noch.
    const ergebnis = bewerteFigur({
      onsets: spiele(figurById("sechzehntel")!),
      einzaehler,
      erwartet,
      toleranz,
    })
    expect(ergebnis.trefferquote).toBe(1)
    expect(ergebnis.genauigkeit).toBeLessThan(GENAUIGKEIT_RICHTIG)
    expect(ergebnis.richtig).toBe(false)
  })

  it("lässt einen Gallop nicht als Dreiergruppe durchgehen", () => {
    const ergebnis = bewerteFigur({ onsets: spiele(gallop), einzaehler, erwartet, toleranz })
    expect(ergebnis.richtig).toBe(false)
  })
})

describe("Dämpfung", () => {
  const dead = figurById("dead-notes")!
  const jeSchlag = beatSeconds(90)
  const einzaehler = Array.from({ length: EINZAEHLER_SCHLAEGE }, (_, i) => i * jeSchlag)
  const start = EINZAEHLER_SCHLAEGE * jeSchlag
  const schlaege = Array.from({ length: 8 }, (_, i) => start + i * jeSchlag)
  const marken = patternMarks(schlaege, dead, jeSchlag)
  const erwartet = marken.map((marke) => marke.time)
  const toleranz = toleranceSeconds(dead, jeSchlag)

  /** Spielt die Figur; `verhaeltnis` ist, wie viel leiser die Dead Notes sind. */
  const spiele = (verhaeltnis: number) => [
    ...einzaehler.map((time) => ({ time, level: 0.5 })),
    ...marken.map((marke) => ({
      time: marke.time,
      // Etwas Streuung, damit nicht der Idealfall geprüft wird: bei einer
      // echten Aufnahme schwanken auch gleich laute Anschläge um rund ein Zehntel.
      level: (marke.gedaempft ? 0.5 / verhaeltnis : 0.5) * (marke.time % 2 < 1 ? 1.06 : 0.94),
    })),
  ]

  const bewerte = (verhaeltnis: number) => {
    const anschlaege = spiele(verhaeltnis)
    return bewerteFigur({
      onsets: anschlaege.map((a) => a.time),
      anschlaege,
      marken,
      einzaehler,
      erwartet,
      toleranz,
    })
  }

  it("erkennt gedämpfte Nachschläge", () => {
    // 1,54× ist, was unter starker Verzerrung übrig bleibt — gemessen, nicht
    // geschätzt. Das muss reichen.
    const ergebnis = bewerte(1.54)
    expect(ergebnis.trefferquote).toBe(1)
    expect(ergebnis.daempfung).toBeGreaterThan(DAEMPFUNG_MINDESTENS)
    expect(ergebnis.richtig).toBe(true)
  })

  it("lässt gleich laut durchgespielte Sechzehntel nicht als Dead Notes gelten", () => {
    // Zeitlich identisch, nur eben ohne Dämpfung. Die Trefferquote ist perfekt,
    // die Genauigkeit auch — und trotzdem ist es die Figur nicht.
    const ergebnis = bewerte(1)
    expect(ergebnis.trefferquote).toBe(1)
    expect(ergebnis.genauigkeit).toBe(1)
    expect(ergebnis.richtig).toBe(false)
  })

  it("gilt ohne Pegel als nicht erbracht, statt stillschweigend durchzugehen", () => {
    const ergebnis = bewerteFigur({
      onsets: marken.map((m) => m.time),
      marken,
      einzaehler,
      erwartet,
      toleranz,
    })
    expect(ergebnis.daempfung).toBeNull()
    expect(ergebnis.richtig).toBe(false)
  })

  it("misst nichts, wo nichts zu dämpfen ist", () => {
    const ohne = patternMarks(schlaege, gallop, jeSchlag)
    expect(daempfungsVerhaeltnis(spiele(2), ohne)).toBeNull()
  })
})

describe("Warum Sechzehntel keine gespielte Frage sein können", () => {
  // Umgekehrt greift keine der beiden Zahlen: die Sechzehntel sind das
  // *feinste* Raster, jede andere Figur ist eine Teilmenge davon. Wer einen
  // Gallop spielt, trifft drei von vier Sechzehnteln — Trefferquote genau an
  // der Schwelle — und hat dabei keine einzige überzählige Note, also volle
  // Genauigkeit. Gegen eine Sechzehntelfrage ist der Gallop damit richtig.
  //
  // Das ist keine Schwäche der Messung, sondern der Frage: „spiel Sechzehntel"
  // ist mit Anschlagszeitpunkten allein nicht prüfbar. Deshalb gibt es die
  // Figur, aber keine Karte dazu — und dieser Test hält fest, warum.
  const sechzehntel = figurById("sechzehntel")!
  const jeSchlag = beatSeconds(90)
  const einzaehler = Array.from({ length: EINZAEHLER_SCHLAEGE }, (_, i) => i * jeSchlag)
  const start = EINZAEHLER_SCHLAEGE * jeSchlag
  const schlaege = Array.from({ length: 8 }, (_, i) => start + i * jeSchlag)

  it("bestünde ein Gallop die Sechzehntelfrage", () => {
    const ergebnis = bewerteFigur({
      onsets: [...einzaehler, ...patternTimes(schlaege, gallop, jeSchlag)],
      einzaehler,
      erwartet: patternTimes(schlaege, sechzehntel, jeSchlag),
      toleranz: toleranceSeconds(sechzehntel, jeSchlag),
    })
    expect(ergebnis.trefferquote).toBeGreaterThanOrEqual(TREFFERQUOTE_RICHTIG)
    expect(ergebnis.genauigkeit).toBe(1)
    expect(ergebnis.richtig).toBe(true)
  })
})
