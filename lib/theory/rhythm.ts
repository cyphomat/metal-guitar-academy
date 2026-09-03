import { analyseTiming } from "@/lib/audio/timing"

/**
 * Rhythmusfiguren als Zeitpunkte.
 *
 * Der Punkt der ganzen Sache: eine Rhythmusfrage lässt sich *spielen* statt
 * ankreuzen. Das Mikrofon hört die Anschläge ohnehin auf 2,7 ms genau — es
 * fehlt nur die Angabe, wann sie hätten kommen sollen.
 *
 * Bewusst nicht gegen die Metronomklicks geprüft: ein Gallop trifft nicht
 * jeden Sechzehntel-Klick, und gegen alle Klicks gemessen sähe er nach drei
 * Vierteln Trefferquote aus. Erwartet wird die Figur, nicht das Raster.
 */

export interface Rhythmusfigur {
  id: string
  name: string
  /**
   * Wo die Anschläge innerhalb eines Schlags liegen, als Bruchteile.
   * `[0, 0.5, 0.75]` ist Achtel plus zwei Sechzehntel — der Gallop.
   */
  offsets: number[]
  /** Wie sie in Notenwerten heisst. Steht in der Auflösung. */
  beschreibung: string
}

export const FIGUREN: Rhythmusfigur[] = [
  {
    id: "gallop",
    name: "Gallop",
    offsets: [0, 0.5, 0.75],
    beschreibung: "Achtel, Sechzehntel, Sechzehntel — der lange Ton auf dem Schlag.",
  },
  {
    id: "gallop-umgekehrt",
    name: "Umgekehrter Gallop",
    offsets: [0, 0.25, 0.5],
    beschreibung: "Sechzehntel, Sechzehntel, Achtel — die kurzen zuerst.",
  },
  {
    id: "achtel",
    name: "Gerade Achtel",
    offsets: [0, 0.5],
    beschreibung: "Zwei gleich lange Töne auf jeden Schlag.",
  },
  {
    id: "triole",
    name: "Achteltriole",
    offsets: [0, 1 / 3, 2 / 3],
    beschreibung: "Drei Töne im Platz von zweien.",
  },
]

export function figurById(id: string): Rhythmusfigur | undefined {
  return FIGUREN.find((figur) => figur.id === id)
}

/**
 * Wann die Anschläge fallen müssten, auf der Uhr des Metronoms.
 *
 * Die Schlagzeitpunkte kommen vom Metronom selbst — es plant sie im Voraus auf
 * der Audio-Uhr, also sind sie exakt. Selbst hochzurechnen hiesse, eine zweite
 * Uhr zu führen, und zwei Uhren gehen auseinander.
 */
export function patternTimes(beatTimes: number[], figur: Rhythmusfigur, beatSeconds: number): number[] {
  const zeiten: number[] = []
  for (const beat of beatTimes) {
    for (const offset of figur.offsets) {
      zeiten.push(beat + offset * beatSeconds)
    }
  }
  return zeiten.sort((a, b) => a - b)
}

/** Sekunden je Schlag bei diesem Tempo. */
export function beatSeconds(bpm: number): number {
  return 60 / bpm
}

/**
 * Wie eng ein Anschlag sitzen muss, um als Treffer zu zählen.
 *
 * Der halbe Abstand zum nächsten erwarteten Anschlag ist die Grenze, an der
 * eine Note noch diese Note ist — darüber wäre sie die nächste. Bei 120 zählt
 * ein Gallop-Sechzehntel damit rund 60 ms, und 90 ms ist die Obergrenze, damit
 * ein langsames Tempo nicht alles durchwinkt.
 */
export function toleranceSeconds(figur: Rhythmusfigur, sekundenJeSchlag: number): number {
  const abstaende: number[] = []
  const zeiten = patternTimes([0, sekundenJeSchlag], figur, sekundenJeSchlag)
  for (let i = 1; i < zeiten.length; i += 1) abstaende.push(zeiten[i] - zeiten[i - 1])
  const engster = Math.min(...abstaende)
  return Math.min(0.09, engster * 0.4)
}

/** Ab welcher Trefferquote eine gespielte Figur als richtig gilt. */
export const TREFFERQUOTE_RICHTIG = 0.75

/** Schläge Einzähler vor der Figur — je ein Ton darauf. */
export const EINZAEHLER_SCHLAEGE = 8

/**
 * Warum überhaupt ein Einzähler.
 *
 * Die Signalkette verzögert alles um denselben Betrag — bei Bluetooth 150 bis
 * 300 ms. Den aus der *Figur selbst* zu schätzen geht nicht: eine Figur ist
 * ungleichmässig, und eine Verzögerung in der Grössenordnung ihrer Abstände
 * sieht aus wie eine andere Figur. Nachgemessen: ein umgekehrter Gallop passt
 * um 125 ms verschoben zu über achtzig Prozent auf einen Gallop. Wer den
 * Versatz frei sucht, bekommt also für die falsche Figur ein "sitzt".
 *
 * Auf gleichmässigen Schlägen ist er dagegen eindeutig, solange er unter einem
 * halben Schlag bleibt — bei 120 BPM also bis 250 ms. Deshalb wird zuerst
 * gezählt und erst dann gespielt.
 */

export interface FigurBewertung {
  /** Anschläge, die die Figur verlangt hat. */
  erwartet: number
  /** Davon getroffen. */
  treffer: number
  trefferquote: number
  /** Konstante Verzögerung in ms, aus dem Einzähler. Zählt nicht als Fehler. */
  versatzMs: number
  /** Schwankung um diesen Versatz, in ms. Das ist die Spielqualität. */
  streuungMs: number
  richtig: boolean
}

export interface FigurEingaben {
  /** Alle gehörten Anschläge, auf der Audio-Uhr. */
  onsets: number[]
  /** Wann die Schläge des Einzählers lagen. */
  einzaehler: number[]
  /** Wann die Anschläge der Figur liegen müssten. */
  erwartet: number[]
  toleranz: number
}

/**
 * Bewertet eine gespielte Figur.
 *
 * Zwei Messungen, nicht eine: der Einzähler liefert den Versatz, die Figur die
 * Streuung. Genau diese Trennung trägt die ganze Timing-Messung der App —
 * Laufzeit ist kein Spielfehler.
 */
export function bewerteFigur({
  onsets,
  einzaehler,
  erwartet,
  toleranz,
}: FigurEingaben): FigurBewertung {
  const leer: FigurBewertung = {
    erwartet: erwartet.length,
    treffer: 0,
    trefferquote: 0,
    versatzMs: 0,
    streuungMs: 0,
    richtig: false,
  }
  if (erwartet.length === 0 || onsets.length === 0) return leer

  // Die Grenze liegt einen halben Schlag vor dem ersten Ton der Figur: davor
  // kann nur der Einzähler liegen, danach nur die Figur.
  const grenze = erwartet[0] - (einzaehler.length > 1 ? (einzaehler[1] - einzaehler[0]) / 2 : 0)
  const vorne = onsets.filter((onset) => onset < grenze)
  const hinten = onsets.filter((onset) => onset >= grenze)

  const einzaehlerAnalyse = analyseTiming(vorne, einzaehler)
  // Ohne brauchbaren Einzähler bleibt der Versatz bei null. Lieber eine
  // strenge Bewertung als eine erfundene Verzögerung.
  const versatz = einzaehlerAnalyse.hits >= 3 ? einzaehlerAnalyse.offsetMs / 1000 : 0

  const analyse = analyseTiming(hinten, erwartet, {
    toleranceSeconds: toleranz,
    offsetSeconds: versatz,
  })

  return {
    erwartet: erwartet.length,
    treffer: analyse.hits,
    trefferquote: analyse.hitRate,
    versatzMs: Math.round(versatz * 1000),
    streuungMs: analyse.spreadMs,
    richtig: analyse.hitRate >= TREFFERQUOTE_RICHTIG,
  }
}
