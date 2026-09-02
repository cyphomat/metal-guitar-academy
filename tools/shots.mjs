/**
 * Nimmt die Bildschirme für die README auf — echte Seiten mit Beispieldaten,
 * keine Mockups. Der Übungs-Log wird vorher in localStorage gelegt, damit die
 * App zeigt, wie sie nach ein paar Wochen aussieht.
 *
 * Aufruf:
 *   pnpm build && (cd out && python3 -m http.server 3100 &)
 *   node tools/shots.mjs
 *
 * Braucht playwright und einen Chromium — bewusst keine Abhängigkeit des
 * Projekts, das Werkzeug läuft nur hier:
 *   npx playwright install chromium
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:3100'
const OUT = process.argv[3] ?? 'assets/screens'
const PHONE = { width: 430, height: 932 }

/** Zwei Wochen Übung, mit Fortschritt und einem wackeligen Tag. */
function sampleLog() {
  const day = (back, hour = 20) => {
    const d = new Date()
    d.setDate(d.getDate() - back)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }
  const r = (drillId, technique, bpm, rating, back, timing) => ({
    drillId, technique, bpm, rating, seconds: 300, at: day(back),
    ...(timing ? { timing } : {}),
  })
  const t = (score, spread, offset = 34, trend = 'steady') => ({
    hits: 46, expected: 48, spreadMs: spread, offsetMs: offset, score, trend,
  })

  return {
    version: 1,
    results: [
      r('warmup-chromatic', 'warmup', 84, 3, 12),
      r('tech-downpicking', 'downpicking', 105, 2, 12, t(58, 31)),
      r('riff-dirge', 'downpicking', 75, 3, 12),

      r('warmup-string-skip', 'warmup', 90, 3, 9),
      r('tech-palm-mute', 'palm-mute', 116, 3, 9, t(71, 21)),
      r('riff-chromatic-crawl', 'palm-mute', 98, 3, 9),

      r('warmup-chromatic', 'warmup', 92, 4, 5),
      r('tech-gallop', 'gallop', 104, 3, 5, t(74, 19)),
      r('riff-ironclad', 'gallop', 92, 2, 5),

      r('warmup-chromatic', 'warmup', 96, 3, 2),
      r('tech-downpicking', 'downpicking', 125, 3, 2, t(81, 15)),
      r('riff-dirge', 'downpicking', 95, 3, 2),

      r('warmup-string-skip', 'warmup', 100, 4, 1),
      r('tech-power-chord-shifts', 'power-chords', 112, 3, 1, t(86, 12)),
      r('riff-escape', 'pentatonic', 70, 3, 1),
    ],
  }
}

/**
 * Ein Signal, das Chromium als Mikrofon durchreicht: kurze perkussive
 * Transienten in exakt dem Klick-Abstand des Drills. Das Fake-Geraet von
 * Chromium liefert sonst einen Dauerton, und der Timing-Bildschirm zeigt
 * Zufallszahlen statt einer echten Messung.
 */
async function pulseWav({ periodSeconds, seconds = 24, rate = 48000 }) {
  const samples = new Int16Array(Math.floor(seconds * rate))
  let seed = 7
  const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x3fffffff) - 1

  for (let pulse = 0; pulse * periodSeconds < seconds; pulse += 1) {
    const start = Math.floor(pulse * periodSeconds * rate)
    const length = Math.floor(0.035 * rate)
    for (let i = 0; i < length && start + i < samples.length; i += 1) {
      const envelope = Math.exp(-i / (0.006 * rate))
      samples[start + i] = Math.max(-32767, Math.min(32767, envelope * noise() * 0.85 * 32767))
    }
  }

  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + samples.byteLength, 4)
  header.write('WAVEfmt ', 8)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(rate, 24)
  header.writeUInt32LE(rate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(samples.byteLength, 40)

  const path = join(tmpdir(), 'mga-shots-mic.wav')
  await writeFile(path, Buffer.concat([header, Buffer.from(samples.buffer)]))
  return path
}

/**
 * MESS-DRILL — die Pulse müssen exakt auf dem Klick liegen, sonst zeigt der
 * Timing-Bildschirm eine echte, aber sinnlose Messung.
 *
 * Alternate Picking: startBpm 60, subdivision 2 → ein Klick alle 60/60/2 s.
 * Das gilt nur, solange der Beispiel-Log für diesen Drill *leer* bleibt —
 * mit Vorgeschichte verschiebt nextBpm() das Starttempo.
 */
const MESS_DRILL = 'tech-alternate-picking'
const micFile = await pulseWav({ periodSeconds: 60 / 60 / 2 })

const browser = await chromium.launch({
  // Ohne gesetzten Pfad nimmt Playwright seinen eigenen Chromium.
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    `--use-file-for-fake-audio-capture=${micFile}%noloop`,
  ],
})
const ctx = await browser.newContext({
  viewport: PHONE,
  deviceScaleFactor: 2,
  permissions: ['microphone'],
})

// Muss vor dem ersten Laden stehen: die App liest den Log beim Mounten.
await ctx.addInitScript((log) => {
  localStorage.setItem('mga.practice-log.v1', JSON.stringify(log))
}, sampleLog())

await mkdir(OUT, { recursive: true })
const page = await ctx.newPage()
const shot = async (name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`${OUT}/${name}.png`)
}

// 1 — Die Ansage
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await shot('heute')

// 2 — Im Block, Mikrofon an
await page.goto(`${BASE}/session/?drill=${MESS_DRILL}&minutes=10`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.getByRole('button', { name: /Timing messen/ }).click()
await page.waitForTimeout(1400)
await page.getByRole('button', { name: /^Los$/ }).click()
await page.waitForTimeout(3000)
await shot('block')

// 3 — Was das Mikrofon gehört hat. Lange genug laufen lassen, damit genug
// Anschläge für eine belastbare Messung zusammenkommen.
await page.waitForTimeout(9000)
await page.getByRole('button', { name: /Beenden/ }).click()
await page.waitForTimeout(900)
await shot('timing')

// 4 — Danach
await page.getByText('Sauber', { exact: true }).click()
await page.waitForTimeout(900)
await shot('feierabend')

// 5 — Der Katalog
await page.goto(`${BASE}/drills/`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await shot('drills')

// 6 — Sicherung
await page.goto(`${BASE}/daten/`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await shot('daten')

await browser.close()
