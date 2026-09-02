import type { AudioEngine } from "./audio-engine"

export type MicStatus = "idle" | "starting" | "listening" | "denied" | "unsupported" | "error"

export interface OnsetDetectorCallbacks {
  /** Fires per detected attack, timestamped on the shared audio clock. */
  onOnset?: (time: number, level: number) => void
  /** Peak level, roughly every 21 ms, for a meter. */
  onLevel?: (level: number) => void
  onStatus?: (status: MicStatus, detail?: string) => void
}

/**
 * Listens to the microphone and reports note attacks.
 *
 * Deliberately does not try to hear *what* was played — with a distorted
 * guitar, pitch tracking is unreliable, while transients are easy to see. For
 * rhythm work, when a note starts is the whole question anyway.
 */
export class OnsetDetector {
  private engine: AudioEngine
  private callbacks: OnsetDetectorCallbacks
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private node: AudioWorkletNode | null = null
  private sink: GainNode | null = null
  private status: MicStatus = "idle"

  constructor(engine: AudioEngine, callbacks: OnsetDetectorCallbacks = {}) {
    this.engine = engine
    this.callbacks = callbacks
  }

  get currentStatus(): MicStatus {
    return this.status
  }

  private setStatus(status: MicStatus, detail?: string): void {
    this.status = status
    this.callbacks.onStatus?.(status, detail)
  }

  async start(): Promise<boolean> {
    if (this.status === "listening" || this.status === "starting") return true

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.setStatus("unsupported", "Dieser Browser gibt keinen Mikrofonzugriff frei.")
      return false
    }

    this.setStatus("starting")

    try {
      const ctx = await this.engine.resume()

      // All three cleanups are off on purpose. Echo cancellation and noise
      // suppression are tuned for speech: they duck exactly the transients we
      // are looking for, and automatic gain makes level comparisons meaningless.
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      await ctx.audioWorklet.addModule("/worklets/onset-processor.js")

      this.source = ctx.createMediaStreamSource(this.stream)
      this.node = new AudioWorkletNode(ctx, "onset-processor")
      this.node.port.onmessage = (event: MessageEvent) => {
        const data = event.data
        if (data?.type === "onset") this.callbacks.onOnset?.(data.time, data.level)
        else if (data?.type === "level") this.callbacks.onLevel?.(data.level)
      }

      // Silent sink. The graph only pulls nodes that reach the destination, but
      // routing the microphone to the speakers would howl.
      this.sink = ctx.createGain()
      this.sink.gain.value = 0

      this.source.connect(this.node)
      this.node.connect(this.sink)
      this.sink.connect(ctx.destination)

      this.setStatus("listening")
      return true
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ""
      if (name === "NotAllowedError" || name === "SecurityError") {
        this.setStatus("denied", "Mikrofonzugriff abgelehnt.")
      } else if (name === "NotFoundError") {
        this.setStatus("error", "Kein Mikrofon gefunden.")
      } else {
        this.setStatus("error", error instanceof Error ? error.message : "Mikrofon nicht verfügbar.")
      }
      this.stop()
      return false
    }
  }

  stop(): void {
    this.node?.port.close()
    this.node?.disconnect()
    this.source?.disconnect()
    this.sink?.disconnect()
    this.stream?.getTracks().forEach((track) => track.stop())

    this.node = null
    this.source = null
    this.sink = null
    this.stream = null

    if (this.status === "listening" || this.status === "starting") {
      this.setStatus("idle")
    }
  }
}
