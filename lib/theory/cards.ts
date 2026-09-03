import { positionsOf, positionsOfInterval } from "./fretboard"
import type { Griff, TheoryCard } from "./types"

/**
 * Der Katalog, Stufe 1 und 2.
 *
 * Jeder Eintrag ist ein Begriff, eine Erklärung von zwei bis drei Sätzen und
 * eine Frage. Der Text ist das, was **nach** der Antwort kommt — Abfragen
 * behält sich besser als Nachlesen, und deshalb steht hier keine Lektion mit
 * einem Quiz daneben.
 *
 * Alles selbst geschrieben, im jeweiligen Stil, ohne abgeschriebene Tabs —
 * dieselbe Regel wie für die Drills.
 *
 * Die richtigen Antworten auf dem Griffbrett sind **gerechnet**, nicht
 * getippt: `positionsOf` und `positionsOfInterval` liefern jede Stelle, an der
 * der gesuchte Ton liegt. Wer eine davon trifft, hat recht — auf der Gitarre
 * hat derselbe Ton bis zu sechs Orte, und nur den nächstgelegenen gelten zu
 * lassen wäre schlicht falsch.
 */

const griff = (saite: number, bund: number) => ({ saite, bund }) as Griff

export const THEORY_CARDS: TheoryCard[] = [
  // ─────────────────────────────────────────────── Stufe 1: Das Material
  {
    id: "m-halbton",
    stufe: 1,
    begriff: "Halbton und Ganzton",
    erklaerung:
      "Ein Bund ist ein Halbton — der kleinste Schritt, den die Gitarre kennt. Ein Ganzton sind zwei Bünde. Jede Tonleiter, jeder Akkord und jedes Riff ist am Ende nur eine bestimmte Folge dieser beiden Schritte, und deshalb lohnt es sich, sie nicht als Theorie zu behandeln, sondern als Entfernung auf dem Hals.",
    frage: {
      art: "eingabe",
      text: "Wie viele Bünde ist ein Ganzton?",
      richtig: ["2", "zwei"],
    },
  },
  {
    id: "m-chromatisch",
    stufe: 1,
    begriff: "Die zwölf Töne",
    erklaerung:
      "Zwischen einem Ton und demselben Ton eine Oktave höher liegen zwölf Halbtöne. Danach fängt alles von vorn an, nur höher. Auf der Gitarre heisst das: was du am 3. Bund spielst, findest du am 15. wieder.",
    frage: {
      art: "eingabe",
      text: "Wie viele verschiedene Töne gibt es, bevor sich alles wiederholt?",
      richtig: ["12", "zwölf", "zwoelf"],
    },
  },
  {
    id: "m-stammtoene",
    stufe: 1,
    begriff: "Wo die Halbtonschritte sitzen",
    erklaerung:
      "Die Stammtöne heissen C D E F G A H. Zwischen ihnen liegt überall ein Ganzton — ausser zwischen E und F und zwischen H und C, da ist es nur ein Halbton. Das ist der Grund, warum die weissen Tasten am Klavier ungleich verteilt wirken, und auf dem Griffbrett der Grund, warum manche Töne direkt nebeneinander liegen.",
    frage: {
      art: "auswahl",
      text: "Zwischen welchen beiden Paaren liegt nur ein Halbton?",
      auswahl: ["E–F und H–C", "C–D und G–A", "F–G und A–H", "D–E und G–A"],
      richtig: ["E–F und H–C"],
    },
  },
  {
    id: "m-h-oder-b",
    stufe: 1,
    begriff: "H oder B",
    erklaerung:
      "Auf Deutsch heisst der Ton über A ganz einfach H. Englische Tabulaturen — also fast alle, die du im Netz findest — schreiben dafür B. Und B bedeutet auf Deutsch den Ton einen Halbton darunter. Wer beides mischt, greift irgendwann den falschen Ton und sucht lange nach dem Grund.",
    frage: {
      art: "eingabe",
      text: "Eine englische Tabulatur schreibt „B“. Wie heisst dieser Ton auf Deutsch?",
      richtig: ["H"],
    },
  },
  {
    id: "m-oktave",
    stufe: 1,
    begriff: "Oktave",
    erklaerung:
      "Zwei Töne im Oktavabstand tragen denselben Namen und klingen wie derselbe Ton in zwei Höhen — die Schwingung ist genau doppelt so schnell. Deshalb kannst du ein Riff eine Oktave höher spielen, und es bleibt dasselbe Riff.",
    frage: {
      art: "eingabe",
      text: "Wie viele Halbtöne umfasst eine Oktave?",
      richtig: ["12", "zwölf", "zwoelf"],
    },
  },
  {
    id: "m-leersaiten",
    stufe: 1,
    begriff: "Die sechs Leersaiten",
    erklaerung:
      "In Standardstimmung heissen die Saiten von der dicksten zur dünnsten E A d g h e. Die tiefe und die hohe heissen beide E — sie liegen zwei Oktaven auseinander. Merken lohnt sich, weil fast jede Bezeichnung auf dem Hals von hier aus gezählt wird.",
    frage: {
      art: "eingabe",
      text: "Wie heisst die zweitdickste Saite in Standardstimmung?",
      richtig: ["A"],
    },
  },
  {
    id: "m-e-saite",
    stufe: 1,
    begriff: "Töne auf der tiefen E-Saite",
    erklaerung:
      "Auf der tiefen E-Saite liegen die Grundtöne der meisten Powerchords. Drei Marken reichen als Gerüst: 3. Bund G, 5. Bund A, 7. Bund H. Der Rest ergibt sich durch Zählen in Halbtönen.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt G auf der tiefen E-Saite?",
      richtig: [griff(6, 3)],
    },
  },
  {
    id: "m-a-saite",
    stufe: 1,
    begriff: "Töne auf der A-Saite",
    erklaerung:
      "Die A-Saite trägt die zweite Hälfte der Powerchord-Grundtöne. Auch hier drei Marken: 3. Bund C, 5. Bund D, 7. Bund E. Mit E- und A-Saite zusammen findest du jeden gebräuchlichen Grundton, ohne zu suchen.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt D auf der A-Saite?",
      richtig: [griff(5, 5)],
    },
  },
  {
    id: "m-bund-halbton",
    stufe: 1,
    begriff: "Ein Bund weiter",
    erklaerung:
      "Jeder Bund höher ist genau ein Halbton höher — egal auf welcher Saite, egal an welcher Stelle des Halses. Das klingt banal, ist aber der Grund, warum sich auf der Gitarre jede Form verschieben lässt und dabei richtig bleibt.",
    frage: {
      art: "griffbrett",
      text: "Die A-Saite leer klingt A. Wo liegt Ais, also einen Halbton höher, auf derselben Saite?",
      richtig: [griff(5, 1)],
    },
  },
  {
    id: "m-zwoelfter",
    stufe: 1,
    begriff: "Der 12. Bund",
    erklaerung:
      "Am 12. Bund ist die Saite genau halbiert, und dort beginnt alles von vorn: derselbe Ton wie leer, eine Oktave höher. Deshalb tragen fast alle Gitarren dort eine doppelte Einlage — es ist die Mitte des Halses, nicht nur eine Markierung unter vielen.",
    frage: {
      art: "griffbrett",
      text: "Die tiefe E-Saite leer klingt E. Wo liegt dasselbe E eine Oktave höher auf derselben Saite?",
      richtig: [griff(6, 12)],
    },
  },
  {
    id: "m-oktavform",
    stufe: 1,
    begriff: "Die Oktavform",
    erklaerung:
      "Von einem Ton auf der E- oder A-Saite aus liegt derselbe Ton zwei Saiten höher und zwei Bünde weiter. Diese eine Form spart das Auswendiglernen des halben Halses: Grundton finden, Form anwenden, fertig.",
    frage: {
      art: "griffbrett",
      text: "Auf der A-Saite im 5. Bund liegt D. Zeig dasselbe D auf der D- oder g-Saite.",
      gegeben: [griff(5, 5)],
      richtig: positionsOfInterval(griff(5, 5), 12).filter(
        (stelle) => stelle.saite === 4 || stelle.saite === 3,
      ),
    },
  },
  {
    id: "m-enharmonik",
    stufe: 1,
    begriff: "Zwei Namen, ein Bund",
    erklaerung:
      "Fis und Ges sind derselbe Bund. Welcher Name richtig ist, hängt an der Tonart — man will in einer Tonleiter jeden Buchstaben genau einmal verwenden. Fürs Greifen ist es egal, fürs Aufschreiben nicht.",
    frage: {
      art: "auswahl",
      text: "Welcher Ton liegt auf demselben Bund wie Gis?",
      auswahl: ["As", "Ges", "G", "A"],
      richtig: ["As"],
    },
  },

  // ─────────────────────────────────────────────────── Stufe 2: Intervalle
  {
    id: "i-was",
    stufe: 2,
    begriff: "Was ein Intervall ist",
    erklaerung:
      "Ein Intervall ist der Abstand zwischen zwei Tönen, gemessen in Halbtönen. Nicht die Töne selbst tragen den Charakter, sondern ihr Abstand: dieselbe Form klingt überall auf dem Hals gleich, nur höher oder tiefer. Deshalb ist das Griffbrett vor allem eine Karte von Abständen.",
    frage: {
      art: "eingabe",
      text: "Worin wird ein Intervall gemessen?",
      richtig: ["Halbtöne", "Halbtönen", "Halbton", "Halbtoene", "Halbtoenen"],
    },
  },
  {
    id: "i-terz",
    stufe: 2,
    begriff: "Die Terz entscheidet",
    erklaerung:
      "Vier Halbtöne über dem Grundton liegt die grosse Terz, drei Halbtöne die kleine. Dieser eine Halbton ist der Unterschied zwischen Dur und Moll — mehr braucht es nicht, damit ein Akkord hell oder düster klingt.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne umfasst die kleine Terz?",
      auswahl: ["3", "4", "2", "5"],
      richtig: ["3"],
    },
  },
  {
    id: "i-quinte",
    stufe: 2,
    begriff: "Die Quinte",
    erklaerung:
      "Sieben Halbtöne über dem Grundton liegt die Quinte — nach der Oktave der stabilste Abstand überhaupt. Sie ist der zweite Ton jedes Powerchords, und weil sie so wenig Eigenfarbe hat, überlebt sie jede Verzerrung.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig die Quinte dazu auf der A-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 7).filter((stelle) => stelle.saite === 5),
    },
  },
  {
    id: "i-quinte-form",
    stufe: 2,
    begriff: "Die Quintform",
    erklaerung:
      "Eine Saite höher und zwei Bünde weiter — das ist die Quinte, und zwar überall auf dem Hals gleich. Genau diese Form greift die Hand beim Powerchord, ohne dass man sie je bewusst gelernt hätte.",
    frage: {
      art: "eingabe",
      text: "Wie viele Bünde weiter liegt die Quinte, wenn du eine Saite höher gehst?",
      richtig: ["2", "zwei"],
    },
    technique: "power-chords",
  },
  {
    id: "i-tritonus",
    stufe: 2,
    begriff: "Tritonus",
    erklaerung:
      "Sechs Halbtöne — genau die halbe Oktave, und der einzige Abstand, der sich selbst umkehrt. Er hat keine Auflösungsrichtung und klingt deshalb ungelöst; im Metal ist das kein Makel, sondern das Werkzeug.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig den Tritonus dazu auf der A-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 6).filter((stelle) => stelle.saite === 5),
    },
  },
  {
    id: "i-sekunde",
    stufe: 2,
    begriff: "Die Sekunde",
    erklaerung:
      "Ein Halbton ist die kleine Sekunde, zwei die grosse. Die kleine ist der schärfste Reibungsabstand, den es gibt — im Phrygischen sitzt sie direkt über dem Grundton und macht dort die ganze Drohung.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne umfasst die kleine Sekunde?",
      auswahl: ["1", "2", "3", "0"],
      richtig: ["1"],
    },
  },
  {
    id: "i-quarte",
    stufe: 2,
    begriff: "Die Quarte",
    erklaerung:
      "Fünf Halbtöne. Auf der Gitarre ist sie überall dort versteckt, wo zwei benachbarte Leersaiten zusammenklingen — E zu A, A zu d, d zu g sind alle Quarten. Genau deshalb liegen Formen auf diesen Saitenpaaren immer gleich.",
    frage: {
      art: "auswahl",
      text: "Welches Intervall liegt zwischen der leeren A-Saite und der leeren d-Saite?",
      auswahl: ["Quarte", "Quinte", "grosse Terz", "Tritonus"],
      richtig: ["Quarte"],
    },
  },
  {
    id: "i-septime",
    stufe: 2,
    begriff: "Die kleine Septime",
    erklaerung:
      "Zehn Halbtöne über dem Grundton. Sie klingt offen und ungelöst, ohne scharf zu sein — der Grund, warum sie in fast jeder Moll- und Bluesskala vorkommt und warum ein Riff mit ♭7 nach Rock klingt statt nach Kirchenlied.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne umfasst die kleine Septime?",
      auswahl: ["10", "11", "9", "12"],
      richtig: ["10"],
    },
  },
  {
    id: "i-umkehrung",
    stufe: 2,
    begriff: "Umkehrung",
    erklaerung:
      "Nimmst du den unteren Ton eines Intervalls eine Oktave höher, wird aus der Quinte eine Quarte und aus der grossen Terz eine kleine Sexte. Zusammen ergeben Intervall und Umkehrung immer zwölf Halbtöne. Deshalb muss man nur die Hälfte wirklich lernen.",
    frage: {
      art: "auswahl",
      text: "Was wird aus einer Quinte, wenn man sie umkehrt?",
      auswahl: ["Quarte", "Quinte", "kleine Terz", "grosse Sexte"],
      richtig: ["Quarte"],
    },
  },
  {
    id: "i-knick",
    stufe: 2,
    begriff: "Der Knick zur h-Saite",
    erklaerung:
      "Fünf der sechs Saiten liegen eine Quarte auseinander — nur zwischen der g- und der h-Saite ist es eine grosse Terz. Deshalb wandert jede Form, die diese beiden Saiten überspannt, um einen Bund. Es ist die einzige Ausnahme auf dem ganzen Hals, und sie erklärt fast jeden Griff, der sich falsch anfühlt.",
    frage: {
      art: "auswahl",
      text: "Zwischen welchen beiden Saiten liegt keine Quarte?",
      auswahl: ["g und h", "A und d", "d und g", "h und e"],
      richtig: ["g und h"],
    },
  },
  {
    id: "i-oktavform-hoch",
    stufe: 2,
    begriff: "Oktave über den Knick",
    erklaerung:
      "Die Oktavform von der d-Saite aus liegt zwei Saiten höher und drei Bünde weiter, nicht zwei — weil der Weg über die h-Saite führt. Dieselbe Form, ein Bund verschoben: das ist der Knick in der Praxis.",
    frage: {
      art: "griffbrett",
      text: "Auf der d-Saite im 5. Bund liegt G. Zeig dasselbe G auf der h-Saite.",
      gegeben: [griff(4, 5)],
      richtig: positionsOf("G").filter((stelle) => stelle.saite === 2 && stelle.bund <= 12),
    },
  },
  {
    id: "i-messen",
    stufe: 2,
    begriff: "Ein Intervall abzählen",
    erklaerung:
      "Wenn du den Namen nicht weisst, zähl die Bünde. Beide Töne auf dieselbe Saite gedacht, Bünde zählen, fertig — die Zahl ist das Intervall. Das ist langsam, aber es geht immer, und mit der Zeit erkennt das Auge die Form vor dem Zählen.",
    frage: {
      art: "auswahl",
      text: "Vom 3. zum 10. Bund derselben Saite: welches Intervall ist das?",
      auswahl: ["Quinte", "Quarte", "kleine Sexte", "grosse Sexte"],
      richtig: ["Quinte"],
    },
  },
]

/** Karten einer Stufe. */
export function cardsOfStufe(stufe: number): TheoryCard[] {
  return THEORY_CARDS.filter((card) => card.stufe === stufe)
}

export function cardById(id: string): TheoryCard | undefined {
  return THEORY_CARDS.find((card) => card.id === id)
}
