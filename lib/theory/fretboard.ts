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
 * Deutsche Tonnamen: H, nicht B.
 *
 * Das ist keine Kleinigkeit, sondern die häufigste Verwechslung überhaupt —
 * englische Tabulaturen schreiben B für dasselbe, was hier H heisst, und B
 * bedeutet auf Deutsch den Ton einen Halbton darunter. Eine eigene Karte
 * erklärt genau das, und `verwechselungshinweis` fängt den Fall in der
 * Rückmeldung ab, statt ihn stillschweigend gelten zu lassen.
 */
export const TOENE = ["C", "Cis", "D", "Dis", "E", "F", "Fis", "G", "Gis", "A", "Ais", "H"] as const

/** Dieselben Töne als Tiefalterationen — für Tonarten, die sie so schreiben. */
export const TOENE_B = ["C", "Des", "D", "Es", "E", "F", "Ges", "G", "As", "A", "B", "H"] as const

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
export const SAITENNAMEN = ["e", "h", "g", "d", "A", "E"] as const

/** Grundtöne als Halbtonabstand von C. B ist deutsch: der Ton unter H. */
const STAMMTOENE: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 10, H: 11,
}

/**
 * Nimmt eine getippte Antwort an, wie sie jemand tatsächlich schreibt.
 *
 * `fis`, `Fis`, `F#` sind derselbe Ton, und `Eb` dasselbe wie `Es`. Gerechnet
 * wird über Stammton plus Vorzeichen, nicht über Zeichenkettenersatz: aus `Eb`
 * würde sonst `Ees`, und die deutschen Tiefalterationen sind unregelmässig
 * genug (Es, As, B), dass jede Ersetzungsregel irgendwo danebenliegt.
 *
 * **`B` ist hier Ais**, nicht H — so heisst es auf Deutsch. Dass englische
 * Tabulaturen B für H schreiben, ist die häufigste Verwechslung überhaupt;
 * `verwechselungshinweis` erkennt sie, damit die Rückmeldung sie aufklären
 * kann, statt sie stillschweigend durchgehen zu lassen.
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
 * Ob jemand über H und B gestolpert ist.
 *
 * Genau dieser Fall darf nicht als "leider falsch" durchgehen: wer aus
 * englischen Tabulaturen liest, hat den richtigen Ton gemeint und die falsche
 * Sprache getippt. Die Rückmeldung sagt das dann.
 */
export function verwechselungshinweis(eingabe: string, richtig: Ton): string | null {
  const getippt = eingabe.trim().toUpperCase()
  if (getippt === "B" && richtig === "H") {
    return "Englische Tabulaturen schreiben B für diesen Ton. Auf Deutsch heisst er H — und B ist der Ton einen Halbton darunter."
  }
  if (getippt === "H" && richtig === "Ais") {
    return "Auf Deutsch heisst dieser Ton B (oder Ais). H liegt einen Halbton höher."
  }
  return null
}

/** Ob zwei Stellen dieselbe sind. */
export function sameGriff(a: Griff, b: Griff): boolean {
  return a.saite === b.saite && a.bund === b.bund
}
