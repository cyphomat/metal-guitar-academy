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
   * Über wie viele Schläge die Figur läuft, bevor sie sich wiederholt.
   * Fehlt die Angabe, ist es einer — so war es, als jede Figur auf jeden
   * Schlag passte.
   *
   * Eine Dreiergruppe braucht drei: punktierte Achtel sind je drei
   * Sechzehntel lang, und erst nach zwölf Sechzehnteln fällt der Anfang der
   * Figur wieder auf einen Schlag. Ohne diese Zahl liesse sich alles, was
   * quer zum Schlag läuft, gar nicht aufschreiben.
   */
  periodeSchlaege?: number
  /**
   * Wo die Anschläge liegen, in Schlägen ab Periodenbeginn.
   * `[0, 0.5, 0.75]` ist Achtel plus zwei Sechzehntel — der Gallop.
   */
  offsets: number[]
  /** Wie sie in Notenwerten heisst. Steht in der Auflösung. */
  beschreibung: string
}

/** Wie viele Schläge eine Figur belegt. */
export function periodeOf(figur: Rhythmusfigur): number {
  return figur.periodeSchlaege ?? 1
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
  {
    id: "sechzehntel",
    name: "Sechzehntel",
    offsets: [0, 0.25, 0.5, 0.75],
    beschreibung: "Vier gleich lange Töne auf jeden Schlag.",
  },
  {
    id: "dreiergruppe",
    name: "Dreiergruppe",
    // Punktierte Achtel: je drei Sechzehntel lang. Nach vier davon sind zwölf
    // Sechzehntel vergangen, und erst dann fällt der Anfang wieder auf einen
    // Schlag — deshalb drei Schläge Periode und nicht einer.
    periodeSchlaege: 3,
    offsets: [0, 0.75, 1.5, 2.25],
    beschreibung:
      "Punktierte Achtel: drei Sechzehntel je Ton. Die Figur läuft quer zum Schlag und findet erst nach drei Schlägen zurück.",
  },
  {
    id: "shuffle",
    name: "Shuffle",
    offsets: [0, 2 / 3],
    beschreibung: "Zwei Töne je Schlag, aber ungleich — der zweite kommt spät, wie bei einer Triole ohne Mitte.",
  },
  {
    id: "synkope",
    name: "Achtelsynkope",
    // „Eins und — zwei gehalten": der Ton auf dem zweiten Schlag fällt weg,
    // stattdessen liegt einer auf dessen Nachschlag. Über zwei Schläge.
    periodeSchlaege: 2,
    offsets: [0, 0.5, 1.5],
    beschreibung: "Eins, und, — und: der Ton auf der Zwei fällt weg, der davor wird gehalten.",
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
  const periode = periodeOf(figur)
  const zeiten: number[] = []
  // Nur volle Perioden. Eine angebrochene würde Anschläge verlangen, die nach
  // dem Ende des Blocks lägen — und die zählte die Bewertung als verpasst.
  for (let start = 0; start + periode <= beatTimes.length; start += periode) {
    for (const offset of figur.offsets) {
      // Der ganze Schlag sucht sich seinen *gemessenen* Klick, nur der Rest
      // wird gerechnet. Eine dreischlägige Figur ganz aus einem Klick
      // hochzurechnen hiesse, eine zweite Uhr zu führen — und zwei Uhren
      // gehen auseinander.
      const schlag = Math.floor(offset + 1e-9)
      zeiten.push(beatTimes[start + schlag] + (offset - schlag) * beatSeconds)
    }
  }
  return zeiten.sort((a, b) => a - b)
}

/** Sekunden je Schlag bei diesem Tempo. */
export function beatSeconds(bpm: number): number {
  return 60 / bpm
}

/**
 * Wie viele Schläge die Figur für so viele Takte läuft.
 *
 * Auf ganze Perioden aufgerundet: eine Dreiergruppe braucht drei Schläge, zwei
 * Takte 4/4 sind acht — die dritte Gruppe wäre angefragt und nie zu Ende
 * gespielt. Lieber einen Schlag länger als eine abgeschnittene Figur.
 */
export function beatsFor(figur: Rhythmusfigur, takte: number, schlaegeJeTakt = 4): number {
  const periode = periodeOf(figur)
  return Math.max(periode, Math.ceil((takte * schlaegeJeTakt) / periode) * periode)
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
  // Zwei volle Perioden, nicht zwei Schläge: sonst bliebe der Übergang von der
  // letzten Note einer Periode zur ersten der nächsten ungesehen, und die
  // Toleranz fiele zu gross aus. Bei Periode 1 sind das genau die zwei
  // Schläge, mit denen diese Rechnung immer schon gearbeitet hat.
  const schlaege = Array.from({ length: periodeOf(figur) * 2 }, (_, i) => i * sekundenJeSchlag)
  const zeiten = patternTimes(schlaege, figur, sekundenJeSchlag)
  const abstaende: number[] = []
  for (let i = 1; i < zeiten.length; i += 1) abstaende.push(zeiten[i] - zeiten[i - 1])
  const engster = Math.min(...abstaende)
  return Math.min(0.09, engster * 0.4)
}

/** Ab welcher Trefferquote eine gespielte Figur als richtig gilt. */
export const TREFFERQUOTE_RICHTIG = 0.75

/**
 * Ab welchem Anteil verlangter Anschläge am Gehörten eine Figur als gespielt
 * gilt — und warum es diese zweite Zahl überhaupt braucht.
 *
 * Die Trefferquote fragt nur, ob das Verlangte kam. Überzählige Anschläge
 * bleiben straffrei, und das ist beim Metronom-Block richtig: dort sind die
 * Töne zwischen den Klicks korrektes Spiel. Bei einer *Figur* kippt es. Die
 * erwarteten Zeitpunkte eines Gallops — 0, ½, ¾ eines Schlags — liegen alle
 * auf dem Sechzehntelraster. Wer stur durchspielt, trifft sie deshalb
 * restlos und bekäme für Dauerspiel ein „sitzt".
 *
 * Bewusst milder als die Trefferquote: eine Saite, die mitklingt, oder ein
 * Anschlag zu viel darf eine saubere Figur nicht kippen. Was er ausschliesst,
 * ist das systematische Zuviel — ein Viertel Überschuss und mehr.
 */
export const GENAUIGKEIT_RICHTIG = 0.8

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
  /**
   * Welcher Anteil der gehörten Anschläge überhaupt verlangt war. Fängt das
   * Dauerspiel ab, das jede Trefferquote mühelos besteht.
   */
  genauigkeit: number
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
    genauigkeit: 0,
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

  // Gehört wird alles nach der Grenze; verlangt war nur ein Teil davon.
  const genauigkeit = hinten.length > 0 ? analyse.hits / hinten.length : 0

  return {
    erwartet: erwartet.length,
    treffer: analyse.hits,
    trefferquote: analyse.hitRate,
    genauigkeit,
    versatzMs: Math.round(versatz * 1000),
    streuungMs: analyse.spreadMs,
    richtig: analyse.hitRate >= TREFFERQUOTE_RICHTIG && genauigkeit >= GENAUIGKEIT_RICHTIG,
  }
}
