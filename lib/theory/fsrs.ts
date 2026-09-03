/**
 * FSRS-6, portiert aus der Referenz (open-spaced-repetition/py-fsrs, MIT).
 *
 * Drei Zahlen je Karte: Schwierigkeit, Stabilität, Abrufbarkeit. Der nächste
 * Termin fällt aus der Vergessenskurve — kein Leichtigkeitsfaktor, kein
 * selbstgebautes Intervall.
 *
 * **Ohne Lernschritte.** Die Referenz kennt Zwischenschritte im Minutenabstand
 * für das Pauken in einer Sitzung. Riffforge fragt viermal am Tag und danach
 * morgen wieder — ein Schritt "in zehn Minuten nochmal" käme nie zustande.
 * Dieser Port entspricht deshalb `Scheduler(learning_steps=(),
 * relearning_steps=())`: dieselben Formeln, nur ohne einen Zustandsautomaten,
 * den hier niemand durchläuft. Gegen genau diese Einstellung prüfen die Tests.
 *
 * **Ohne Optimierer.** Der passt die Parameter an die eigene Historie an und
 * braucht Tausende Antworten. Die Standardwerte stammen aus sehr viel fremder
 * Wiederholung und sind der bessere Startpunkt.
 */

/** Die Standardparameter von FSRS-6. Reihenfolge wie in der Referenz. */
export const DEFAULT_PARAMETERS: readonly number[] = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835,
  0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
]

const STABILITY_MIN = 0.001
const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 10
const TAG_MS = 86_400_000

/**
 * Wie sicher man sich beim Wiedersehen sein will. 0,9 ist der Vorgabewert der
 * Referenz: höher heisst mehr Wiederholungen für wenig zusätzliches Behalten.
 */
export const DESIRED_RETENTION = 0.9

/** Höchstabstand in Tagen. Hundert Jahre — praktisch keine Grenze. */
const MAXIMUM_INTERVAL = 36_500

/**
 * Die vier Antworten. Dieselben Stufen wie beim Drill, damit man nicht zwei
 * Skalen im Kopf haben muss.
 */
export const GRADES = [
  { value: 1, label: "Nochmal", hint: "Wusste ich nicht" },
  { value: 2, label: "Schwer", hint: "Mit Mühe" },
  { value: 3, label: "Gut", hint: "Sass" },
  { value: 4, label: "Leicht", hint: "Sofort da" },
] as const

export type Grade = (typeof GRADES)[number]["value"]

export interface CardState {
  /** Tage, bis die Abrufbarkeit auf 90 % gefallen ist. Null: noch nie gesehen. */
  stability: number | null
  /** 1 bis 10. Null: noch nie gesehen. */
  difficulty: number | null
  /** Wann sie das nächste Mal drankommt, ISO. */
  due: string
  /** Wann sie zuletzt drankam, ISO. Null: noch nie. */
  lastReview: string | null
}

export function newCard(now: Date = new Date()): CardState {
  return { stability: null, difficulty: null, due: now.toISOString(), lastReview: null }
}

const decay = (p: readonly number[]) => -p[20]
const factor = (p: readonly number[]) => 0.9 ** (1 / decay(p)) - 1

const clampStability = (stability: number) => Math.max(stability, STABILITY_MIN)
const clampDifficulty = (difficulty: number) =>
  Math.min(Math.max(difficulty, MIN_DIFFICULTY), MAX_DIFFICULTY)

/**
 * Volle Tage seit einem Zeitpunkt, abgerundet — wie `timedelta.days` in der
 * Referenz. Neunzehn Stunden sind null Tage, nicht ein Tag.
 */
function elapsedDays(from: string, to: Date): number {
  const tage = (to.getTime() - Date.parse(from)) / TAG_MS
  return Number.isNaN(tage) ? 0 : Math.floor(tage)
}

/**
 * Wie wahrscheinlich die Karte jetzt noch sitzt.
 *
 * `R(t,S) = (1 + FACTOR · t/S)^DECAY` — die Vergessenskurve als Potenzfunktion.
 * Ohne Vorgeschichte ist die Antwort 0, nicht 1: was man nie gewusst hat, weiss
 * man auch nicht mehr.
 */
export function retrievability(
  card: CardState,
  now: Date = new Date(),
  parameters: readonly number[] = DEFAULT_PARAMETERS,
): number {
  if (card.lastReview === null || card.stability === null) return 0
  const tage = Math.max(0, elapsedDays(card.lastReview, now))
  return (1 + factor(parameters) * tage / card.stability) ** decay(parameters)
}

function initialStability(grade: Grade, p: readonly number[]): number {
  return clampStability(p[grade - 1])
}

function initialDifficulty(grade: number, p: readonly number[], clamp: boolean): number {
  const difficulty = p[4] - Math.E ** (p[5] * (grade - 1)) + 1
  return clamp ? clampDifficulty(difficulty) : difficulty
}

function nextDifficulty(difficulty: number, grade: Grade, p: readonly number[]): number {
  // Dämpfung: je schwerer eine Karte schon ist, desto weniger bewegt sie eine
  // einzelne Antwort noch.
  const delta = -(p[6] * (grade - 3))
  const gedaempft = difficulty + ((10 - difficulty) * delta) / 9
  // Rückzug zur Mitte: ohne ihn driftet jede Karte über die Jahre an den Rand.
  const leicht = initialDifficulty(4, p, false)
  return clampDifficulty(p[7] * leicht + (1 - p[7]) * gedaempft)
}

function recallStability(
  difficulty: number,
  stability: number,
  r: number,
  grade: Grade,
  p: readonly number[],
): number {
  const schwerAbzug = grade === 2 ? p[15] : 1
  const leichtBonus = grade === 4 ? p[16] : 1
  return (
    stability *
    (1 +
      Math.E ** p[8] *
        (11 - difficulty) *
        stability ** -p[9] *
        (Math.E ** ((1 - r) * p[10]) - 1) *
        schwerAbzug *
        leichtBonus)
  )
}

function forgetStability(
  difficulty: number,
  stability: number,
  r: number,
  p: readonly number[],
): number {
  const langfristig =
    p[11] * difficulty ** -p[12] * ((stability + 1) ** p[13] - 1) * Math.E ** ((1 - r) * p[14])
  const kurzfristig = stability / Math.E ** (p[17] * p[18])
  return Math.min(langfristig, kurzfristig)
}

/** Zweite Antwort am selben Tag: eigene Formel, sonst zählt der Tag doppelt. */
function shortTermStability(stability: number, grade: Grade, p: readonly number[]): number {
  let zuwachs = Math.E ** (p[17] * (grade - 3 + p[18])) * stability ** -p[19]
  if (grade >= 2) zuwachs = Math.max(zuwachs, 1)
  return clampStability(stability * zuwachs)
}

/** Der Abstand in vollen Tagen, aufgelöst nach der gewünschten Behaltensrate. */
export function intervalDays(
  stability: number,
  desiredRetention: number = DESIRED_RETENTION,
  parameters: readonly number[] = DEFAULT_PARAMETERS,
): number {
  const tage = (stability / factor(parameters)) * (desiredRetention ** (1 / decay(parameters)) - 1)
  return Math.min(Math.max(Math.round(tage), 1), MAXIMUM_INTERVAL)
}

/**
 * Eine Antwort verarbeiten: neue Schwierigkeit, neue Stabilität, neuer Termin.
 *
 * Rein — `now` kommt herein, nichts wird gelesen oder geschrieben.
 */
export function review(
  card: CardState,
  grade: Grade,
  now: Date = new Date(),
  desiredRetention: number = DESIRED_RETENTION,
  parameters: readonly number[] = DEFAULT_PARAMETERS,
): CardState {
  let stability: number
  let difficulty: number

  if (card.stability === null || card.difficulty === null || card.lastReview === null) {
    stability = initialStability(grade, parameters)
    difficulty = initialDifficulty(grade, parameters, true)
  } else if (elapsedDays(card.lastReview, now) < 1) {
    stability = shortTermStability(card.stability, grade, parameters)
    difficulty = nextDifficulty(card.difficulty, grade, parameters)
  } else {
    const r = retrievability(card, now, parameters)
    stability = clampStability(
      grade === 1
        ? forgetStability(card.difficulty, card.stability, r, parameters)
        : recallStability(card.difficulty, card.stability, r, grade, parameters),
    )
    difficulty = nextDifficulty(card.difficulty, grade, parameters)
  }

  const tage = intervalDays(stability, desiredRetention, parameters)
  return {
    stability,
    difficulty,
    lastReview: now.toISOString(),
    due: new Date(now.getTime() + tage * TAG_MS).toISOString(),
  }
}

/** Ist die Karte fällig? */
export function isDue(card: CardState, now: Date = new Date()): boolean {
  return Date.parse(card.due) <= now.getTime()
}
