import type { SessionBlock, Technique } from "./types"

/**
 * Wo die Wissensfragen in den Ablauf gehören.
 *
 * Nicht als Blöcke — eine Frage hat kein Tempo, keine Bewertung und keinen
 * Eintrag im Übungs-Log. Sie sitzt *zwischen* den Blöcken, dort wo man das
 * Plektrum ohnehin absetzt.
 *
 * Zwei Portionen, mehr nicht. Die Viertelstunde ist das Produkt; wer mehr
 * abfragen will, bekommt es unter *Wissen*, aber die Session wächst nicht.
 */

/** Wie viele Fragen eine Portion umfasst. Vier pro Session, rund 80 Sekunden. */
export const FRAGEN_JE_PORTION = 2

export interface TheorieEinschub {
  /** Vor welchem Block die Portion kommt. */
  vorIndex: number
  /**
   * Worauf grundiert wird: die Technik des Blocks, der gleich folgt. Null
   * heisst quer durch alles, was fällig ist.
   *
   * Das ist der Bezug zum Gespielten — Theorie ohne ihn bleibt ein eigenes
   * Hobby. Ein Filter ist es nicht: passt nichts, kommt trotzdem etwas.
   */
  technique: Technique | null
}

/**
 * Die zwei Stellen im Plan.
 *
 * Die erste liegt vor dem ersten richtigen Block — nach dem Warm-up, wenn die
 * Hände warm sind und der Kopf noch frei ist — und fragt zu dem, was gleich
 * kommt. Die zweite liegt nach dem ersten Riff, also mitten drin, und nimmt
 * einfach das Fälligste.
 *
 * Ein Plan ohne genug Blöcke bekommt entsprechend weniger. Eine fokussierte
 * Session — ein einzeln gewählter Drill — bekommt gar keine.
 */
export function theorieEinschuebe(
  blocks: SessionBlock[],
  options: { fokussiert?: boolean } = {},
): TheorieEinschub[] {
  // Ein gezielt gewählter einzelner Drill bekommt keine Fragen. Wer auf
  // "Gallop" tippt, will Gallop spielen — die Durchmischung gehört in die
  // Tages-Session, nicht in eine Absicht.
  if (options.fokussiert) return []
  if (blocks.length === 0) return []

  const einschuebe: TheorieEinschub[] = []

  const ersterEchte = blocks.findIndex((block) => block.drill.kind !== "warmup")
  if (ersterEchte >= 0) {
    einschuebe.push({ vorIndex: ersterEchte, technique: blocks[ersterEchte].drill.technique })
  }

  const erstesRiff = blocks.findIndex((block) => block.drill.kind === "riff")
  const nachDemRiff = erstesRiff >= 0 ? erstesRiff + 1 : -1
  if (
    nachDemRiff > 0 &&
    nachDemRiff < blocks.length &&
    !einschuebe.some((einschub) => einschub.vorIndex === nachDemRiff)
  ) {
    einschuebe.push({ vorIndex: nachDemRiff, technique: null })
  }

  return einschuebe
}
