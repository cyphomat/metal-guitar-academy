/**
 * Owns the one AudioContext the app uses.
 *
 * This matters more than it looks: the metronome schedules clicks against
 * `AudioContext.currentTime`, and the onset detector timestamps what the
 * microphone hears against the same clock. Two contexts would drift against
 * each other and every timing measurement would be noise.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null

  /**
   * Creates the context on first call. Must run inside a user gesture —
   * browsers refuse to start audio otherwise, and iOS leaves a context created
   * outside one permanently suspended.
   */
  async resume(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume()
    }
    return this.ctx
  }

  get context(): AudioContext | null {
    return this.ctx
  }

  /** Current audio-clock time in seconds, or 0 before the context exists. */
  now(): number {
    return this.ctx?.currentTime ?? 0
  }

  async close(): Promise<void> {
    const ctx = this.ctx
    this.ctx = null
    await ctx?.close().catch(() => {})
  }
}
