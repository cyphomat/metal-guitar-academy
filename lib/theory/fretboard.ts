/**
 * Das Griffbrett als Rechnung.
 *
 * Alle richtigen Antworten im Katalog fallen aus diesen Funktionen, statt von
 * Hand getippt zu sein. Ein Tippfehler in einer Tabelle mit hundert Tönen
 * fällt niemandem auf; ein Fehler hier fällt in den Tests auf.
 *
 * Saite 1 ist die hohe e-Saite, 6 die tiefe E — wie in jeder Tabulatur.
 */

import type { Griff } from "./types"

/**
 * Englische Tonnamen: B, nicht H.
 *
 * Metal-Repertoire kommt in Tabulaturen, und die sind praktisch ausnahmslos
 * englisch beschriftet. Wer hier H läse und dort B, müsste bei jedem Riff
 * übersetzen — und ausgerechnet an der Stelle, wo die deutsche Schreibweise
 * ein B für einen ganz anderen Ton vergibt.
 *
 * Deutsche Eingaben nimmt `parseTon` trotzdem an, und
 * `verwechselungshinweis` klärt den Fall in der Rückmeldung auf, statt ihn
 * stillschweigend gelten zu lassen.
 */
export const TOENE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const

/** Dieselben Töne als Tiefalterationen — für Tonarten, die sie so schreiben. */
export const TOENE_B = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const

export type Ton = (typeof TOENE)[number]

/**
 * MIDI-Nummern der Leersaiten in Standardstimmung, Saite 1 bis 6.
 * e4 = 64, h3 = 59, g3 = 55, d3 = 50, A2 = 45, E2 = 40.
 */
const LEERSAITEN = [64, 59, 55, 50, 45, 40] as const

/** Wie viele Bünde die App zeigt. Darüber wiederholt sich ohnehin alles. */
export const HOECHSTER_BUND = 15

export function midiAt(griff: Griff): number {
  return LEERSAITEN[griff.saite - 1] + griff.bund
}

/** Der Tonname an einer Stelle — ohne Oktavzahl, die interessiert hier nicht. */
export function noteAt(griff: Griff): Ton {
  return TOENE[midiAt(griff) % 12]
}

/**
 * Alle Stellen, an denen dieser Ton liegt.
 *
 * Auf der Gitarre hat derselbe Ton bis zu sechs Orte. Wer einen davon trifft,
 * hat recht — deshalb gibt es hier eine Liste und keine einzelne Antwort.
 */
export function positionsOf(ton: Ton, bisBund: number = HOECHSTER_BUND): Griff[] {
  const gesucht = TOENE.indexOf(ton)
  const treffer: Griff[] = []
  for (let saite = 1; saite <= 6; saite += 1) {
    for (let bund = 0; bund <= bisBund; bund += 1) {
      const griff = { saite, bund } as Griff
      if (midiAt(griff) % 12 === gesucht) treffer.push(griff)
    }
  }
  return treffer
}

/**
 * Die Intervalle, in Halbtönen gezählt.
 *
 * Die Kurzform ist die, die Musiker sprechen: Stufenzahl mit Vorzeichen.
 * Ohne sie müsste man bei jedem Riff "übermässige Quarte" sagen.
 */
export const INTERVALLE = [
  { halbtoene: 0, name: "Prime", kurz: "1" },
  { halbtoene: 1, name: "kleine Sekunde", kurz: "♭2" },
  { halbtoene: 2, name: "grosse Sekunde", kurz: "2" },
  { halbtoene: 3, name: "kleine Terz", kurz: "♭3" },
  { halbtoene: 4, name: "grosse Terz", kurz: "3" },
  { halbtoene: 5, name: "Quarte", kurz: "4" },
  { halbtoene: 6, name: "Tritonus", kurz: "♭5" },
  { halbtoene: 7, name: "Quinte", kurz: "5" },
  { halbtoene: 8, name: "kleine Sexte", kurz: "♭6" },
  { halbtoene: 9, name: "grosse Sexte", kurz: "6" },
  { halbtoene: 10, name: "kleine Septime", kurz: "♭7" },
  { halbtoene: 11, name: "grosse Septime", kurz: "7" },
  { halbtoene: 12, name: "Oktave", kurz: "8" },
] as const

export type Intervall = (typeof INTERVALLE)[number]

export function intervallOf(halbtoene: number): Intervall {
  const rest = ((halbtoene % 12) + 12) % 12
  return INTERVALLE[halbtoene === 12 ? 12 : rest]
}

/**
 * Alle Stellen, die vom Grundton aus dieses Intervall bilden.
 *
 * Bewusst über den Tonnamen gerechnet und nicht über die MIDI-Nummer: gesucht
 * ist der *Ton*, nicht die Lage. Eine Quinte eine Oktave höher ist immer noch
 * die Quinte.
 */
export function positionsOfInterval(
  grundton: Griff,
  halbtoene: number,
  bisBund: number = HOECHSTER_BUND,
): Griff[] {
  const ziel = TOENE[(midiAt(grundton) + halbtoene) % 12]
  return positionsOf(ziel, bisBund)
}

/**
 * Wie viele Halbtöne zwischen zwei Stellen liegen, als Intervall innerhalb
 * einer Oktave. Die Richtung ist egal: gefragt ist der Abstand, nicht wer
 * oben liegt.
 *
 * Ein voller Oktavabstand heisst Oktave, nicht Prime. Modulo zuerst zu rechnen
 * hätte beides gleich gemacht — und die Oktavform ist ausgerechnet das, was
 * hier abgefragt wird.
 */
export function intervalBetween(a: Griff, b: Griff): Intervall {
  const abstand = Math.abs(midiAt(b) - midiAt(a))
  if (abstand !== 0 && abstand % 12 === 0) return INTERVALLE[12]
  return intervallOf(abstand % 12)
}

/** Die Namen der Leersaiten, von der hohen zur tiefen. */
export const SAITENNAMEN = ["e", "B", "G", "D", "A", "E"] as const

/**
 * Grundtöne als Halbtonabstand von C.
 *
 * B ist englisch gemeint, also der Ton über A. H steht daneben, weil deutsche
 * Notenhefte ihn so schreiben — dieselbe Taste, anderer Buchstabe.
 */
const STAMMTOENE: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11,
}

/**
 * Nimmt eine getippte Antwort an, wie sie jemand tatsächlich schreibt.
 *
 * `f#`, `F#`, `Fis` sind derselbe Ton, und `Eb` dasselbe wie `Es`. Gerechnet
 * wird über Stammton plus Vorzeichen, nicht über Zeichenkettenersatz: aus `Eb`
 * würde sonst `Ees`, und die deutschen Tiefalterationen sind unregelmässig
 * genug (Es, As, B), dass jede Ersetzungsregel irgendwo danebenliegt.
 *
 * **`B` ist hier der Ton über A**, englisch gelesen. Wer aus deutschen Noten
 * kommt, meint mit `B` womöglich `A#` — `verwechselungshinweis` erkennt den
 * Fall und klärt ihn auf, statt ihn stillschweigend gelten zu lassen.
 */
export function parseTon(eingabe: string): Ton | null {
  const roh = eingabe.trim().replace(/\s+/g, "")
  const treffer = roh.match(/^([a-hA-H])(is|es|s|#|b|♯|♭)?$/)
  if (!treffer) return null

  const stamm = STAMMTOENE[treffer[1].toUpperCase()]
  if (stamm === undefined) return null

  const zeichen = (treffer[2] ?? "").toLowerCase()
  const versetzung = zeichen === "is" || zeichen === "#" || zeichen === "♯" ? 1
    : zeichen === "" ? 0
    : -1

  return TOENE[(((stamm + versetzung) % 12) + 12) % 12]
}

/**
 * Ob jemand über die deutsche und die englische Schreibweise gestolpert ist.
 *
 * Genau dieser Fall darf nicht als blosses "leider falsch" durchgehen: der
 * richtige Ton war gemeint, nur die falsche Sprache getippt. Die Rückmeldung
 * sagt das dann.
 */
export function verwechselungshinweis(eingabe: string, richtig: Ton): string | null {
  const getippt = eingabe.trim().toUpperCase()
  // Deutsche Noten schreiben H für den Ton, der hier B heisst — richtig
  // gemeint, nur anders geschrieben.
  if (getippt === "H" && richtig === "B") {
    return "Gemeint hast du das Richtige: was deutsche Noten H nennen, heisst in Tabulaturen B. Hier gilt die englische Schreibweise."
  }
  // Und umgekehrt: deutsches B ist englisches A#.
  if (getippt === "B" && richtig === "A#") {
    return "In deutschen Noten heisst dieser Ton B — hier steht er als A# (oder Bb). Das englische B liegt einen Halbton höher."
  }
  return null
}

/** Ob zwei Stellen dieselbe sind. */
export function sameGriff(a: Griff, b: Griff): boolean {
  return a.saite === b.saite && a.bund === b.bund
}

/**
 * Die Moll-Pentatonik in Halbtönen über dem Grundton.
 * Grundton, kleine Terz, Quarte, Quinte, kleine Septime.
 */
export const PENTATONIK = [0, 3, 5, 7, 10] as const

/** Die fünf Lagen, in der Reihenfolge, in der sie am Hals aufeinander folgen. */
export type Lage = 1 | 2 | 3 | 4 | 5

/**
 * Eine Lage der Moll-Pentatonik, gerechnet statt getippt.
 *
 * Die fünf Lagen unterscheiden sich nur darin, welche Stufe auf der tiefen
 * E-Saite den untersten Ton stellt: Lage 1 den Grundton, Lage 2 die kleine
 * Terz, Lage 3 die Quarte, Lage 4 die Quinte, Lage 5 die kleine Septime. Von
 * dort nimmt jede Saite die zwei tiefsten Pentatoniktöne, die noch in die Lage
 * fallen — zwei je Saite, zwölf insgesamt.
 *
 * Der Boden liegt einen Bund unter dem Anker und gilt für alle Saiten gleich.
 * Dieser eine Bund Spielraum ist es, der den Knick zur B-Saite und die
 * verschobenen Lagen überhaupt aufgehen lässt; ohne ihn fiele Lage 2 auseinander.
 *
 * Die fünf Lagen laufen im Kreis: welche am Hals zuunterst liegt, hängt am
 * Grundton. Bei A-Moll ist es Lage 4, weil deren Anker — die Quinte E — auf der
 * leeren E-Saite liegt. `abBund` sucht den Anker deshalb erst ab einem Bund,
 * und genau damit lässt sich nachweisen, dass zwei Lagen aneinander anschliessen.
 *
 * Eine Tabelle mit fünf Lagen mal zwölf Grundtönen wäre die Sorte Datenmenge,
 * in der ein falscher Bund niemandem auffiele.
 */
export function pentatonikLage(grundton: Ton, lage: Lage, abBund = 0, bisBund = 24): Griff[] {
  const wurzel = TOENE.indexOf(grundton)
  const gehoert = (griff: Griff) =>
    PENTATONIK.includes(((midiAt(griff) - wurzel) % 12 + 12) % 12 as (typeof PENTATONIK)[number])

  const frets = (saite: number) => {
    const treffer: number[] = []
    for (let bund = 0; bund <= bisBund; bund += 1) {
      if (gehoert({ saite, bund } as Griff)) treffer.push(bund)
    }
    return treffer
  }

  // Der Anker: die tiefste Stelle auf der E-Saite, an der die Stufe dieser
  // Lage liegt.
  const stufe = PENTATONIK[lage - 1]
  const anker = frets(6).find(
    (bund) =>
      bund >= abBund &&
      ((midiAt({ saite: 6, bund } as Griff) - wurzel) % 12 + 12) % 12 === stufe,
  )
  if (anker === undefined) return []

  const boden = Math.max(0, anker - 1)
  const griffe: Griff[] = []
  for (let saite = 6; saite >= 1; saite -= 1) {
    for (const bund of frets(saite).filter((b) => b >= boden).slice(0, 2)) {
      griffe.push({ saite, bund } as Griff)
    }
  }
  return griffe
}

/** Die Stellen einer Lage, an denen eine bestimmte Stufe liegt. */
export function stufeInLage(
  grundton: Ton,
  lage: Lage,
  halbtoene: number,
  abBund = 0,
  bisBund = 24,
): Griff[] {
  const wurzel = TOENE.indexOf(grundton)
  return pentatonikLage(grundton, lage, abBund, bisBund).filter(
    (griff) => ((midiAt(griff) - wurzel) % 12 + 12) % 12 === halbtoene,
  )
}
