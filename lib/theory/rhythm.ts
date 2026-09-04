import { analyseTiming, median, type Anschlag } from "@/lib/audio/timing"

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
  /**
   * Welche dieser Anschläge gedämpft sind — Dead Notes. Als Werte aus
   * `offsets`, nicht als Indizes: `[0.25, 0.75]` liest sich als „die beiden
   * Nachschläge", eine Liste von Indizes nicht.
   *
   * Nur Dämpfung, keine Akzente. Nachgemessen trennt eine gedämpfte Note sich
   * auch unter starker Verzerrung noch um Faktor 1,5 von einer normalen, bei
   * einer Streuung innerhalb der Gruppe von 1,1. Ein Akzent bleibt dagegen bei
   * 1,15 bis 1,24 und liegt damit im Rauschen — er wird deshalb nicht
   * gemessen, sondern nur erklärt.
   */
  gedaempft?: number[]
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
    id: "dead-notes",
    name: "Sechzehntel mit Dead Notes",
    offsets: [0, 0.25, 0.5, 0.75],
    // Die Nachschläge sind abgedämpft: Anschlag ja, Ton nein. Im Zeitraster
    // ist das von geraden Sechzehnteln nicht zu unterscheiden — der Unterschied
    // steckt allein im Pegel, und genau deshalb wird er gemessen.
    gedaempft: [0.25, 0.75],
    beschreibung:
      "Vier Sechzehntel, aber nur die auf dem Schlag und der Mitte klingen. Die beiden dazwischen sind abgedämpft — sie treiben, ohne einen Ton beizusteuern.",
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

/** Ein erwarteter Anschlag, mit der Angabe, ob er gedämpft sein soll. */
export interface Erwartung {
  time: number
  gedaempft: boolean
}

/**
 * Wie `patternTimes`, aber mit der Dämpfungsangabe je Anschlag.
 *
 * Eine Quelle für beides: `patternTimes` leitet sich hieraus ab. Zwei
 * getrennte Listen derselben Figur liefen beim ersten Sonderfall auseinander,
 * und die Zuordnung „welcher erwartete Anschlag war gedämpft" ist genau das,
 * was nach dem Sortieren sonst verloren geht.
 */
export function patternMarks(
  beatTimes: number[],
  figur: Rhythmusfigur,
  beatSeconds: number,
): Erwartung[] {
  const periode = periodeOf(figur)
  const gedaempft = new Set(figur.gedaempft ?? [])
  const marken: Erwartung[] = []
  // Nur volle Perioden. Eine angebrochene würde Anschläge verlangen, die nach
  // dem Ende des Blocks lägen — und die zählte die Bewertung als verpasst.
  for (let start = 0; start + periode <= beatTimes.length; start += periode) {
    for (const offset of figur.offsets) {
      // Der ganze Schlag sucht sich seinen *gemessenen* Klick, nur der Rest
      // wird gerechnet. Eine dreischlägige Figur ganz aus einem Klick
      // hochzurechnen hiesse, eine zweite Uhr zu führen — und zwei Uhren
      // gehen auseinander.
      const schlag = Math.floor(offset + 1e-9)
      marken.push({
        time: beatTimes[start + schlag] + (offset - schlag) * beatSeconds,
        gedaempft: gedaempft.has(offset),
      })
    }
  }
  return marken.sort((a, b) => a.time - b.time)
}

/**
 * Wann die Anschläge fallen müssten, auf der Uhr des Metronoms.
 *
 * Die Schlagzeitpunkte kommen vom Metronom selbst — es plant sie im Voraus auf
 * der Audio-Uhr, also sind sie exakt. Selbst hochzurechnen hiesse, eine zweite
 * Uhr zu führen, und zwei Uhren gehen auseinander.
 */
export function patternTimes(beatTimes: number[], figur: Rhythmusfigur, beatSeconds: number): number[] {
  return patternMarks(beatTimes, figur, beatSeconds).map((marke) => marke.time)
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

/**
 * Um welchen Faktor eine normale Note lauter sein muss als eine gedämpfte,
 * damit die Dämpfung als gespielt gilt.
 *
 * Aus einer Messung gegen das echte Worklet: eine Dead Note trennt sich sauber
 * gespielt um Faktor 4,5, unter starker Verzerrung noch um 1,54. Die Streuung
 * *innerhalb* einer Gruppe gleich lauter Anschläge liegt bei 1,03 bis 1,13.
 * Der Wert hier liegt zwischen beidem — hoch genug, dass ungedämpftes Spiel
 * nicht durchrutscht, niedrig genug für eine verzerrte Gitarre.
 */
export const DAEMPFUNG_MINDESTENS = 1.35

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
  /**
   * Um wie viel die normalen Anschläge lauter waren als die gedämpften.
   * `null`, wenn die Figur keine Dämpfung verlangt oder nichts zu messen war.
   */
  daempfung: number | null
  /** Konstante Verzögerung in ms, aus dem Einzähler. Zählt nicht als Fehler. */
  versatzMs: number
  /** Schwankung um diesen Versatz, in ms. Das ist die Spielqualität. */
  streuungMs: number
  richtig: boolean
}

/**
 * Wie deutlich die gedämpften Anschläge leiser waren als die übrigen.
 *
 * Kein Zuordnen über den Treffer-Abgleich, sondern über die Nähe: jeder
 * gehörte Anschlag zählt zu der Gruppe, deren erwarteter Nachbar ihm am
 * nächsten liegt. Das kommt ohne die Innereien des Abgleichs aus und
 * verhält sich gutmütig, wenn ein Anschlag knapp danebenliegt.
 *
 * Verglichen werden Mediane, nicht Mittelwerte: ein einzelner Ausreisser —
 * eine mitklingende Saite, ein Streifschlag — darf das Urteil nicht drehen.
 *
 * `null`, wenn die Figur gar keine Dämpfung verlangt oder eine der beiden
 * Gruppen leer bleibt. Eine erfundene Zahl wäre hier schlimmer als keine.
 */
export function daempfungsVerhaeltnis(
  anschlaege: Anschlag[],
  marken: Erwartung[],
  versatzSekunden = 0,
): number | null {
  if (!marken.some((marke) => marke.gedaempft)) return null

  const leise: number[] = []
  const laut: number[] = []
  for (const anschlag of anschlaege) {
    const zeit = anschlag.time - versatzSekunden
    let naechste: Erwartung | null = null
    let abstand = Number.POSITIVE_INFINITY
    for (const marke of marken) {
      const weg = Math.abs(marke.time - zeit)
      if (weg < abstand) {
        abstand = weg
        naechste = marke
      }
    }
    if (!naechste) continue
    ;(naechste.gedaempft ? leise : laut).push(anschlag.level)
  }

  if (leise.length === 0 || laut.length === 0) return null
  const unten = median(leise)
  if (unten <= 0) return null
  return median(laut) / unten
}

export interface FigurEingaben {
  /** Alle gehörten Anschläge, auf der Audio-Uhr. */
  onsets: number[]
  /**
   * Dieselben Anschläge mit ihrem Pegel. Nur nötig, wenn die Figur Dämpfung
   * verlangt — ohne Mikrofonpegel bleibt die Dämpfung schlicht ungemessen.
   */
  anschlaege?: Anschlag[]
  /** Die erwarteten Anschläge mit ihrer Dämpfungsangabe. */
  marken?: Erwartung[]
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
  anschlaege,
  marken,
  einzaehler,
  erwartet,
  toleranz,
}: FigurEingaben): FigurBewertung {
  const leer: FigurBewertung = {
    erwartet: erwartet.length,
    treffer: 0,
    trefferquote: 0,
    genauigkeit: 0,
    daempfung: null,
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

  // Dämpfung nur, wenn die Figur sie verlangt *und* Pegel vorliegen. Ohne
  // Mikrofonpegel bleibt sie ungemessen statt geraten.
  const daempfung =
    marken && anschlaege
      ? daempfungsVerhaeltnis(
          anschlaege.filter((anschlag) => anschlag.time >= grenze),
          marken,
          versatz,
        )
      : null

  return {
    erwartet: erwartet.length,
    treffer: analyse.hits,
    trefferquote: analyse.hitRate,
    genauigkeit,
    daempfung,
    versatzMs: Math.round(versatz * 1000),
    streuungMs: analyse.spreadMs,
    richtig:
      analyse.hitRate >= TREFFERQUOTE_RICHTIG &&
      genauigkeit >= GENAUIGKEIT_RICHTIG &&
      // Verlangt die Figur keine Dämpfung, ist nichts zu erfüllen. Verlangt
      // sie welche und es liegen keine Pegel vor, gilt sie als nicht erbracht:
      // eine ungemessene Bedingung darf nicht stillschweigend als erfüllt
      // durchgehen.
      (!marken?.some((marke) => marke.gedaempft) ||
        (daempfung !== null && daempfung >= DAEMPFUNG_MINDESTENS)),
  }
}
