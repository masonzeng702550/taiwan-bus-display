// Boarding/next-stop chimes via Web Audio (no audio files needed).
// Two styles: a deep two-tone "ding-dong", or an ascending four-note scale.

export type ChimeType = "dingdong" | "ascending";

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Resume/create the AudioContext within a user gesture so playback is allowed. */
export function unlockAudio(): void {
  const c = ensureCtx();
  if (c && c.state === "suspended") void c.resume();
}

function tone(c: AudioContext, freq: number, at: number, dur: number, peak = 0.22): void {
  // Electronic timbre: a square wave (buzzy, synth-like) plus a triangle an
  // octave below for body — deliberately NOT a pure sine bell/xylophone tone.
  const gain = c.createGain();
  gain.connect(c.destination);

  const main = c.createOscillator();
  main.type = "square";
  main.frequency.value = freq;
  main.connect(gain);

  const sub = c.createOscillator();
  sub.type = "triangle";
  sub.frequency.value = freq / 2;
  const subGain = c.createGain();
  subGain.gain.value = 0.5;
  sub.connect(subGain);
  subGain.connect(gain);

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.012);
  gain.gain.setValueAtTime(peak, at + dur * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

  main.start(at);
  sub.start(at);
  main.stop(at + dur + 0.05);
  sub.stop(at + dur + 0.05);
}

/** Play the selected chime; resolves when it has finished. */
export function playChime(type: ChimeType = "dingdong"): Promise<void> {
  const c = ensureCtx();
  if (!c) return Promise.resolve();
  if (c.state === "suspended") void c.resume();
  const now = c.currentTime;

  let total: number;
  if (type === "ascending") {
    // Rising four-note arpeggio (C5 · E5 · G5 · C6).
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => tone(c, f, now + i * 0.16, 0.34, 0.28));
    total = notes.length * 0.16 + 0.35;
  } else {
    // Deep two-tone "ding-dong" (E5 → A4) with a long, mellow decay.
    tone(c, 659.25, now, 0.55, 0.32);
    tone(c, 440.0, now + 0.34, 0.8, 0.34);
    total = 1.0;
  }
  return new Promise((resolve) => setTimeout(resolve, total * 1000));
}
