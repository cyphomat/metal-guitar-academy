/**
 * Energy-based onset detection, running in the audio thread.
 *
 * Why a worklet and not an AnalyserNode polled from React: the main thread
 * wakes at best every 16 ms, which is a quarter of a sixteenth note at 200 bpm.
 * Here we see every 128-sample block — 2.7 ms at 48 kHz — and `currentTime` is
 * the same clock the metronome schedules its clicks on, so a deviation
 * measured here is real and not an artefact of when JavaScript happened to run.
 */
class OnsetProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    const opts = (options && options.processorOptions) || {}

    /** How far above the running baseline a block has to jump to count. */
    this.threshold = opts.threshold ?? 3.0
    /** Absolute floor, so room noise in silence never triggers. */
    this.floor = opts.floor ?? 0.012
    /** Minimum gap between onsets, seconds. Kills double-triggers on one pick. */
    this.refractory = opts.refractory ?? 0.045

    this.baseline = 0
    this.lastOnsetTime = -1
    this.peakSinceReport = 0
    this.blocksSinceReport = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || input.length === 0 || !input[0]) return true

    const channel = input[0]
    let sum = 0
    for (let i = 0; i < channel.length; i += 1) sum += channel[i] * channel[i]
    const rms = Math.sqrt(sum / channel.length)

    if (rms > this.peakSinceReport) this.peakSinceReport = rms

    const isTransient =
      rms > this.floor &&
      rms > this.baseline * this.threshold &&
      currentTime - this.lastOnsetTime > this.refractory

    if (isTransient) {
      this.lastOnsetTime = currentTime
      this.port.postMessage({ type: "onset", time: currentTime, level: rms })
    }

    // Asymmetric follower: rises slowly so a sustained note does not become the
    // new normal mid-phrase, falls quickly so the next pick still stands out.
    const coefficient = rms > this.baseline ? 0.04 : 0.25
    this.baseline += (rms - this.baseline) * coefficient

    // A level read every ~21 ms is plenty for a meter and keeps the message
    // port from becoming the expensive part of the loop.
    this.blocksSinceReport += 1
    if (this.blocksSinceReport >= 8) {
      this.port.postMessage({ type: "level", level: this.peakSinceReport })
      this.peakSinceReport = 0
      this.blocksSinceReport = 0
    }

    return true
  }
}

registerProcessor("onset-processor", OnsetProcessor)
