/**
 * Music Theory Validation Utilities
 * Ensures accuracy of musical data and chord representations
 */

// Standard tuning in Hz (scientific pitch notation)
export const STANDARD_TUNING_FREQUENCIES = {
  E2: 82.41, // Low E string
  A2: 110.0, // A string
  D3: 146.83, // D string
  G3: 196.0, // G string
  B3: 246.94, // B string
  E4: 329.63, // High E string
}

// Semitone values from C (0-11)
export const NOTE_SEMITONES = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
} as const

// Validated chord intervals (semitones from root)
export const CHORD_INTERVALS = {
  // Triads
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],

  // Suspended chords
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],

  // 7th chords
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],

  // Extended chords
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
  dominant9: [0, 4, 7, 10, 14],

  // Add chords
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
} as const

// Standard guitar tuning (string index to semitone from C)
export const GUITAR_TUNING = [
  4, // E4 (1st string - high E)
  11, // B3 (2nd string)
  7, // G3 (3rd string)
  2, // D3 (4th string)
  9, // A2 (5th string)
  4, // E2 (6th string - low E)
] as const

export interface ChordValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface ChordPosition {
  string: number // 0-5 (high E to low E)
  fret: number // 0-24
  note: string
  interval: string
  frequency: number
}

/**
 * Validates a chord construction against music theory rules
 */
export function validateChord(
  rootNote: string,
  chordType: keyof typeof CHORD_INTERVALS,
  positions: ChordPosition[],
): ChordValidationResult {
  const result: ChordValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  }

  // Validate root note
  if (!(rootNote in NOTE_SEMITONES)) {
    result.errors.push(`Invalid root note: ${rootNote}`)
    result.isValid = false
  }

  // Validate chord type
  if (!(chordType in CHORD_INTERVALS)) {
    result.errors.push(`Invalid chord type: ${chordType}`)
    result.isValid = false
  }

  if (!result.isValid) return result

  const expectedIntervals = CHORD_INTERVALS[chordType]
  const rootSemitone = NOTE_SEMITONES[rootNote as keyof typeof NOTE_SEMITONES]

  // Calculate expected notes
  const expectedNotes = expectedIntervals.map((interval) => (rootSemitone + interval) % 12)

  // Validate positions
  const foundIntervals = new Set<number>()

  positions.forEach((pos, index) => {
    // Validate string range
    if (pos.string < 0 || pos.string > 5) {
      result.errors.push(`Invalid string number: ${pos.string}`)
      result.isValid = false
    }

    // Validate fret range
    if (pos.fret < 0 || pos.fret > 24) {
      result.errors.push(`Invalid fret number: ${pos.fret}`)
      result.isValid = false
    }

    // Calculate actual note
    const stringOpenNote = GUITAR_TUNING[pos.string]
    const actualNote = (stringOpenNote + pos.fret) % 12
    const intervalFromRoot = (actualNote - rootSemitone + 12) % 12

    foundIntervals.add(intervalFromRoot)

    // Check if note belongs to chord
    if (!expectedNotes.includes(actualNote)) {
      result.warnings.push(
        `Note at string ${pos.string + 1}, fret ${pos.fret} (${pos.note}) is not in ${rootNote} ${chordType}`,
      )
    }
  })

  // Check for missing essential intervals
  const essentialIntervals = expectedIntervals.slice(0, 3) // Root, 3rd, 5th
  essentialIntervals.forEach((interval) => {
    if (!foundIntervals.has(interval)) {
      const intervalNames = [
        "root",
        "minor 2nd",
        "major 2nd",
        "minor 3rd",
        "major 3rd",
        "perfect 4th",
        "tritone",
        "perfect 5th",
      ]
      result.warnings.push(`Missing essential interval: ${intervalNames[interval] || `interval ${interval}`}`)
    }
  })

  // Check for playability
  const fretSpread = Math.max(...positions.map((p) => p.fret)) - Math.min(...positions.map((p) => p.fret))
  if (fretSpread > 4) {
    result.warnings.push(`Large fret spread (${fretSpread} frets) - may be difficult to play`)
  }

  return result
}

/**
 * Calculates the frequency of a note at a specific fret and string
 */
export function calculateNoteFrequency(string: number, fret: number): number {
  const baseFrequencies = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41] // E4 to E2
  const baseFreq = baseFrequencies[string]
  return baseFreq * Math.pow(2, fret / 12)
}

/**
 * Gets the note name for a given semitone value
 */
export function getSemitoneName(semitone: number, useFlats = false): string {
  const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

  const normalizedSemitone = ((semitone % 12) + 12) % 12
  return useFlats ? flatNames[normalizedSemitone] : sharpNames[normalizedSemitone]
}

/**
 * Validates interval calculations
 */
export function validateInterval(note1: string, note2: string, expectedInterval: number): boolean {
  const semitone1 = NOTE_SEMITONES[note1 as keyof typeof NOTE_SEMITONES]
  const semitone2 = NOTE_SEMITONES[note2 as keyof typeof NOTE_SEMITONES]

  if (semitone1 === undefined || semitone2 === undefined) return false

  const actualInterval = (semitone2 - semitone1 + 12) % 12
  return actualInterval === expectedInterval
}

/**
 * Suggests alternative chord voicings
 */
export function getAlternativeVoicings(rootNote: string, chordType: keyof typeof CHORD_INTERVALS): ChordPosition[][] {
  const intervals = CHORD_INTERVALS[chordType]
  const rootSemitone = NOTE_SEMITONES[rootNote as keyof typeof NOTE_SEMITONES]
  const voicings: ChordPosition[][] = []

  // Generate common voicing patterns
  const voicingPatterns = [
    // Root position (low to high)
    [5, 4, 3], // Low E, A, D strings
    [4, 3, 2], // A, D, G strings
    [3, 2, 1], // D, G, B strings

    // Barre chord patterns
    [5, 4, 3, 2, 1, 0], // All strings
  ]

  voicingPatterns.forEach((stringPattern) => {
    const voicing: ChordPosition[] = []

    stringPattern.forEach((stringIndex, posIndex) => {
      if (posIndex < intervals.length) {
        const targetSemitone = (rootSemitone + intervals[posIndex]) % 12

        // Find fret for this note on this string
        for (let fret = 0; fret <= 12; fret++) {
          const noteSemitone = (GUITAR_TUNING[stringIndex] + fret) % 12
          if (noteSemitone === targetSemitone) {
            voicing.push({
              string: stringIndex,
              fret,
              note: getSemitoneName(targetSemitone),
              interval: getIntervalName(intervals[posIndex]),
              frequency: calculateNoteFrequency(stringIndex, fret),
            })
            break
          }
        }
      }
    })

    if (voicing.length >= 3) {
      // At least a triad
      voicings.push(voicing)
    }
  })

  return voicings
}

/**
 * Gets interval name from semitone distance
 */
function getIntervalName(semitones: number): string {
  const intervalNames = {
    0: "R", // Root
    1: "b2", // Minor 2nd
    2: "2", // Major 2nd
    3: "b3", // Minor 3rd
    4: "3", // Major 3rd
    5: "4", // Perfect 4th
    6: "b5", // Tritone
    7: "5", // Perfect 5th
    8: "b6", // Minor 6th
    9: "6", // Major 6th
    10: "b7", // Minor 7th
    11: "7", // Major 7th
    12: "R", // Octave
    14: "9", // 9th
    16: "11", // 11th
    17: "b13", // Flat 13th
    18: "13", // 13th
  }

  return intervalNames[semitones as keyof typeof intervalNames] || `+${semitones}`
}
