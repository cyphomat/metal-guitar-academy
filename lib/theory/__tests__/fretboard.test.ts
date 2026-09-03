import { describe, expect, it } from "vitest"
import {
  HOECHSTER_BUND,
  intervalBetween,
  intervallOf,
  midiAt,
  noteAt,
  parseTon,
  positionsOf,
  positionsOfInterval,
  sameGriff,
  SAITENNAMEN,
  verwechselungshinweis,
} from "@/lib/theory/fretboard"
import type { Griff } from "@/lib/theory/types"

const g = (saite: number, bund: number) => ({ saite, bund }) as Griff

describe("noteAt", () => {
  it("kennt die Leersaiten", () => {
    const leer = [1, 2, 3, 4, 5, 6].map((saite) => noteAt(g(saite, 0)))
    expect(leer).toEqual(["E", "B", "G", "D", "A", "E"])
  })

  it("stimmt mit den angezeigten Saitennamen überein", () => {
    // Sonst steht auf dem Griffbrett etwas anderes, als die Rechnung meint.
    expect(SAITENNAMEN.map((name) => name.toUpperCase())).toEqual(
      [1, 2, 3, 4, 5, 6].map((saite) => noteAt(g(saite, 0))),
    )
  })

  it("findet die üblichen Grundtöne auf den tiefen Saiten", () => {
    expect(noteAt(g(6, 3))).toBe("G")
    expect(noteAt(g(6, 5))).toBe("A")
    expect(noteAt(g(5, 3))).toBe("C")
    expect(noteAt(g(5, 5))).toBe("D")
    expect(noteAt(g(5, 7))).toBe("E")
  })

  it("kommt am 12. Bund wieder bei der Leersaite an", () => {
    for (let saite = 1; saite <= 6; saite += 1) {
      expect(noteAt(g(saite, 12))).toBe(noteAt(g(saite, 0)))
      expect(midiAt(g(saite, 12))).toBe(midiAt(g(saite, 0)) + 12)
    }
  })

  it("schreibt Kreuztöne englisch", () => {
    expect(noteAt(g(6, 1))).toBe("F")
    expect(noteAt(g(6, 2))).toBe("F#")
    // Der Ton über A heisst B, nicht H — die Tabulatur-Schreibweise.
    expect(noteAt(g(6, 7))).toBe("B")
  })
})

describe("positionsOf", () => {
  it("findet denselben Ton mehrfach auf dem Hals", () => {
    const stellen = positionsOf("A")
    expect(stellen.length).toBeGreaterThan(4)
    expect(stellen.every((stelle) => noteAt(stelle) === "A")).toBe(true)
  })

  it("nimmt die Leersaite mit", () => {
    expect(positionsOf("E")).toContainEqual({ saite: 6, bund: 0 })
  })

  it("hält sich an die Bundgrenze", () => {
    expect(positionsOf("A", 5).every((stelle) => stelle.bund <= 5)).toBe(true)
    expect(positionsOf("A").every((stelle) => stelle.bund <= HOECHSTER_BUND)).toBe(true)
  })
})

describe("Intervalle", () => {
  it("nennt die für Metal wichtigen beim Namen", () => {
    expect(intervallOf(7).name).toBe("Quinte")
    expect(intervallOf(6).name).toBe("Tritonus")
    expect(intervallOf(3).kurz).toBe("♭3")
    expect(intervallOf(1).kurz).toBe("♭2")
  })

  it("unterscheidet Oktave von Prime", () => {
    expect(intervallOf(12).name).toBe("Oktave")
    expect(intervallOf(0).name).toBe("Prime")
  })

  it("misst zwischen zwei Stellen", () => {
    // A-Saite 5. Bund ist D, D-Saite 7. Bund ist A — eine Quinte.
    expect(intervalBetween(g(5, 5), g(4, 7)).name).toBe("Quinte")
    // Powerchord-Griff: Grundton und zwei Bünde weiter auf der nächsten Saite.
    expect(intervalBetween(g(6, 3), g(5, 5)).name).toBe("Quinte")
    // Der Tritonus liegt einen Bund unter der Quinte.
    expect(intervalBetween(g(6, 3), g(5, 4)).name).toBe("Tritonus")
  })

  it("nennt einen vollen Oktavabstand Oktave, nicht Prime", () => {
    // Modulo zuerst zu rechnen macht beides gleich — und die Oktavform ist
    // genau das, was der Katalog abfragt.
    expect(intervalBetween(g(4, 5), g(2, 8)).name).toBe("Oktave")
    expect(intervalBetween(g(6, 0), g(6, 12)).name).toBe("Oktave")
    expect(intervalBetween(g(6, 3), g(6, 3)).name).toBe("Prime")
  })

  it("misst in beide Richtungen gleich", () => {
    expect(intervalBetween(g(5, 5), g(4, 7))).toEqual(intervalBetween(g(4, 7), g(5, 5)))
  })
})

describe("positionsOfInterval", () => {
  it("findet die Quinte zum Grundton", () => {
    const grundton = g(5, 5) // D
    const quinten = positionsOfInterval(grundton, 7)
    expect(quinten.every((stelle) => noteAt(stelle) === "A")).toBe(true)
    // Der Standardgriff: eine Saite höher, zwei Bünde weiter.
    expect(quinten).toContainEqual({ saite: 4, bund: 7 })
  })

  it("nimmt jede Lage, nicht nur die nächstgelegene", () => {
    // Eine Quinte eine Oktave höher ist immer noch die Quinte.
    const quinten = positionsOfInterval(g(6, 0), 7)
    expect(quinten.length).toBeGreaterThan(3)
  })

  it("findet die Oktave", () => {
    const oktaven = positionsOfInterval(g(6, 5), 12)
    // A-Saite 5. Bund ist D; zwei Saiten höher und zwei Bünde weiter auch.
    expect(oktaven).toContainEqual({ saite: 4, bund: 7 })
  })
})

describe("parseTon", () => {
  it("nimmt die Tabulatur-Schreibweise", () => {
    expect(parseTon("F#")).toBe("F#")
    expect(parseTon("f#")).toBe("F#")
    expect(parseTon(" a ")).toBe("A")
  })

  it("nimmt auch deutsch getippte Kreuze", () => {
    expect(parseTon("Fis")).toBe("F#")
    expect(parseTon("cis")).toBe("C#")
  })

  it("nimmt Tiefalterationen in beiden Schreibweisen", () => {
    expect(parseTon("Eb")).toBe("D#")
    expect(parseTon("Es")).toBe("D#")
    expect(parseTon("Gb")).toBe("F#")
    expect(parseTon("Ges")).toBe("F#")
  })

  it("liest B englisch, also als den Ton über A", () => {
    expect(parseTon("B")).toBe("B")
    // Deutsches H meint denselben Ton — angenommen, aber englisch benannt.
    expect(parseTon("H")).toBe("B")
    // Und das deutsche B liegt einen Halbton tiefer: hier Bb.
    expect(parseTon("Bb")).toBe("A#")
  })

  it("kommt mit unregelmässigen Tiefalterationen klar", () => {
    expect(parseTon("As")).toBe("G#")
    expect(parseTon("Ab")).toBe("G#")
    expect(parseTon("Des")).toBe("C#")
  })

  it("gibt bei Unsinn null zurück", () => {
    expect(parseTon("")).toBeNull()
    expect(parseTon("Q")).toBeNull()
    expect(parseTon("42")).toBeNull()
  })
})

describe("verwechselungshinweis", () => {
  it("erkennt deutsches H für englisches B", () => {
    expect(verwechselungshinweis("H", "B")).toMatch(/deutsche Noten H nennen/i)
  })

  it("erkennt deutsches B für englisches A#", () => {
    expect(verwechselungshinweis("B", "A#")).toMatch(/heisst dieser Ton B/i)
  })

  it("schweigt, wenn nichts verwechselt wurde", () => {
    expect(verwechselungshinweis("B", "B")).toBeNull()
    expect(verwechselungshinweis("C", "D")).toBeNull()
  })
})

describe("sameGriff", () => {
  it("vergleicht Saite und Bund", () => {
    expect(sameGriff(g(5, 5), g(5, 5))).toBe(true)
    expect(sameGriff(g(5, 5), g(4, 5))).toBe(false)
    expect(sameGriff(g(5, 5), g(5, 7))).toBe(false)
  })
})
