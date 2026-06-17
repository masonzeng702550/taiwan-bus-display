// "Ding-dong" bus chime via Web Audio (no audio files needed). Two descending
// sine tones with a soft envelope, played before the next-stop announcement.

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

/** Play the chime; resolves when it has finished. */
export function playChime(): Promise<void> {
  const c = ensureCtx();
  if (!c) return Promise.resolve();
  if (c.state === "suspended") void c.resume();

  const now = c.currentTime;
  const tones = [
    { freq: 1174.7, start: 0, dur: 0.38 }, // D6 (ding)
    { freq: 880.0, start: 0.32, dur: 0.55 }, // A5 (dong)
  ];
  for (const { freq, start, dur } of tones) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(c.destination);
    const t = now + start;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
  return new Promise((resolve) => setTimeout(resolve, 900));
}
