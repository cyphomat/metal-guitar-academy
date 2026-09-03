import { describe, expect, it } from "vitest"
import { theorieEinschuebe } from "@/lib/session/theory-slots"
import { DRILLS } from "@/lib/session/drills"
import type { BlockKind, SessionBlock } from "@/lib/session/types"

function block(kind: BlockKind): SessionBlock {
  const drill = DRILLS.find((eintrag) => eintrag.kind === kind)!
  return { drill, seconds: 180, bpm: 100, round: 1, rounds: 1 }
}

describe("theorieEinschuebe", () => {
  it("hat bei leerem Plan nichts zu setzen", () => {
    expect(theorieEinschuebe([])).toEqual([])
  })

  it("setzt die erste Portion nach dem Warm-up, vor den ersten echten Block", () => {
    const plan = [block("warmup"), block("technique"), block("riff")]
    const [erste] = theorieEinschuebe(plan)
    expect(erste.vorIndex).toBe(1)
  })

  it("grundiert die erste Portion auf die Technik des folgenden Blocks", () => {
    const plan = [block("warmup"), block("technique"), block("riff")]
    const [erste] = theorieEinschuebe(plan)
    expect(erste.technique).toBe(plan[1].drill.technique)
  })

  it("setzt die zweite Portion nach dem ersten Riff", () => {
    const plan = [block("warmup"), block("technique"), block("riff"), block("technique")]
    const einschuebe = theorieEinschuebe(plan)
    expect(einschuebe.map((eintrag) => eintrag.vorIndex)).toEqual([1, 3])
  })

  it("mischt bei der zweiten Portion quer, statt zu grundieren", () => {
    const plan = [block("warmup"), block("technique"), block("riff"), block("technique")]
    expect(theorieEinschuebe(plan)[1].technique).toBeNull()
  })

  it("hängt keine Portion hinter den letzten Block", () => {
    // Nach dem Riff kommt nichts mehr — dann ist die Session zu Ende, und
    // Fragen davor wären nur eine Verzögerung des Abschlusses.
    const plan = [block("warmup"), block("technique"), block("riff")]
    expect(theorieEinschuebe(plan)).toHaveLength(1)
  })

  it("setzt niemals zwei Portionen an dieselbe Stelle", () => {
    const plan = [block("warmup"), block("riff"), block("technique")]
    const stellen = theorieEinschuebe(plan).map((eintrag) => eintrag.vorIndex)
    expect(new Set(stellen).size).toBe(stellen.length)
  })

  it("lässt eine fokussierte Session ganz in Ruhe", () => {
    // Wer gezielt einen Drill wählt, will ihn spielen — und nicht erst
    // gefragt werden.
    const plan = [block("warmup"), block("technique"), block("riff"), block("technique")]
    expect(theorieEinschuebe(plan, { fokussiert: true })).toEqual([])
  })

  it("lässt einen reinen Warm-up-Plan in Ruhe", () => {
    expect(theorieEinschuebe([block("warmup")])).toEqual([])
  })

  it("bleibt bei mehr als vier Fragen je Session nicht hängen", () => {
    // Auch ein langer Plan bekommt zwei Portionen, nicht mehr.
    const lang = [
      block("warmup"),
      block("technique"),
      block("riff"),
      block("technique"),
      block("riff"),
      block("technique"),
    ]
    expect(theorieEinschuebe(lang)).toHaveLength(2)
  })
})
