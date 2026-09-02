import { dayKey } from "./progress"
import type { PracticeLog } from "./types"

export interface CalendarDay {
  /** YYYY-MM-DD, lokale Zeit. */
  key: string
  date: Date
  /** Gespielte Minuten an diesem Tag. 0 heisst: nicht geübt. */
  minutes: number
  isToday: boolean
  /** Tage nach heute in der laufenden Woche — das Raster ist immer voll. */
  isFuture: boolean
}

export interface CalendarOptions {
  weeks?: number
  now?: Date
}

/**
 * Das Raster für den Übungskalender.
 *
 * Sieben Zeilen (Montag oben), eine Spalte je Woche — die Reihenfolge ist
 * deshalb spaltenweise, passend zu `grid-auto-flow: column`. Die laufende
 * Woche wird bis Sonntag aufgefüllt, damit das Raster nicht ausfranst; die
 * Tage danach sind als Zukunft markiert.
 */
export function practiceCalendar(log: PracticeLog, options: CalendarOptions = {}): CalendarDay[] {
  const weeks = options.weeks ?? 16
  const now = options.now ?? new Date()

  const minutesByDay = new Map<string, number>()
  for (const result of log.results) {
    const key = dayKey(new Date(result.at))
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + result.seconds / 60)
  }

  // Montag der laufenden Woche, dann so viele Wochen zurück wie gefordert.
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - mondayIndex(start) - (weeks - 1) * 7)

  const todayKey = dayKey(now)
  const days: CalendarDay[] = []

  for (let offset = 0; offset < weeks * 7; offset += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + offset)
    const key = dayKey(date)

    days.push({
      key,
      date,
      minutes: Math.round(minutesByDay.get(key) ?? 0),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    })
  }

  return days
}

/** 0 = Montag … 6 = Sonntag. `getDay()` zählt ab Sonntag. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}
