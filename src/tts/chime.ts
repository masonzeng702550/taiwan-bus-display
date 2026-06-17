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

function tone(c: AudioContext, freq: number, at: number, dur: number, peak = 0.26): void {
  // Warm, deep electronic timbre: a sawtooth run through a gentle low-pass
  // (cuts the shrill/emergency-beep harmonics) plus a sine an octave below for
  // weight. Soft attack so there's no harsh click.
  const out = c.createGain();
  out.connect(c.destination);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 950;
  lp.Q.value = 0.6;
  lp.connect(out);

  const main = c.createOscillator();
  main.type = "sawtooth";
  main.frequency.value = freq;
  main.connect(lp);

  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.value = freq / 2;
  const subGain = c.createGain();
  subGain.gain.value = 0.7;
  sub.connect(subGain);
  subGain.connect(out);

  out.gain.setValueAtTime(0.0001, at);
  out.gain.linearRampToValueAtTime(peak, at + 0.025);
  out.gain.setValueAtTime(peak, at + dur * 0.55);
  out.gain.exponentialRampToValueAtTime(0.0001, at + dur);

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
    // Rising four-note arpeggio in a low register (C4 · E4 · G4 · C5).
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((f, i) => tone(c, f, now + i * 0.17, 0.36, 0.26));
    total = notes.length * 0.17 + 0.4;
  } else {
    // Deep, low two-tone "ding-dong" (E4 → A3) with a long, mellow decay.
    tone(c, 329.63, now, 0.6, 0.3);
    tone(c, 220.0, now + 0.36, 0.9, 0.32);
    total = 1.1;
  }
  return new Promise((resolve) => setTimeout(resolve, total * 1000));
}
