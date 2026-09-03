import type { TheoryAnswer, TheoryLog } from "./types"

/**
 * Zwei Antwort-Logs zusammenführen.
 *
 * Dieselbe Bauart wie beim Übungs-Log, und aus demselben Grund: eine Antwort
 * entsteht einmal, ändert sich nie und trägt Karte plus Zeitstempel. Zwei
 * Geräte, die unabhängig abgefragt wurden, haben beide recht — also wird
 * vereinigt statt überschrieben.
 *
 * Weil der Kartenstand aus dem Log *abgespielt* wird, ergibt die Vereinigung
 * auf beiden Geräten von selbst denselben Stand. Ein gespeicherter Zustand
 * müsste sich hier einigen.
 */
export function mergeTheoryLogs(a: TheoryLog, b: TheoryLog): TheoryLog {
  const byKey = new Map<string, TheoryAnswer>()
  for (const answer of [...a.answers, ...b.answers]) {
    byKey.set(keyOf(answer), answer)
  }

  return {
    version: 1,
    answers: [...byKey.values()].sort((x, y) => Date.parse(x.at) - Date.parse(y.at)),
  }
}

/**
 * Identität einer Antwort. Dieselbe Karte zur selben Sekunde ist dieselbe
 * Antwort — zwei Anläufe an einem Tag tragen verschiedene Zeitstempel.
 */
function keyOf(answer: TheoryAnswer): string {
  return `${answer.cardId}@${answer.at}`
}
