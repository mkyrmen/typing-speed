"use client";

import { createMechanicalKeyWav } from "./mechanicalKeyWav";

type PreloadState = "idle" | "loading" | "ready" | "failed";

class TypingSoundEngine {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private gain: GainNode | null = null;
  private state: PreloadState = "idle";
  private preloadPromise: Promise<void> | null = null;

  get preloadState() {
    return this.state;
  }

  private ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0.24;
    gain.connect(ctx.destination);
    this.ctx = ctx;
    this.gain = gain;
    return ctx;
  }

  async preload() {
    if (this.state === "ready") return;
    if (this.preloadPromise) return this.preloadPromise;

    this.state = "loading";
    this.preloadPromise = (async () => {
      try {
        const ctx = this.ensureContext();
        const wav = createMechanicalKeyWav();
        const decoded = await ctx.decodeAudioData(wav.slice(0));
        this.buffer = decoded;
        this.state = "ready";
      } catch {
        this.state = "failed";
      } finally {
        this.preloadPromise = null;
      }
    })();

    return this.preloadPromise;
  }

  async unlock() {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }
  }

  play() {
    if (this.state !== "ready" || !this.ctx || !this.gain || !this.buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.connect(this.gain);
    src.start();
  }
}

export const typingSound = new TypingSoundEngine();

