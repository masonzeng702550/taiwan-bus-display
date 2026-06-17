import type { Lang, RouteFile, Stop } from "../types";
import { localeFor, nextStop, routeStart, transferLine } from "./templates";
import { playChime } from "./chime";

// Sequential speech engine built on the Web Speech API (SpeechSynthesis).
// Phrases play one after another (never overlapping); a new request cancels
// whatever is currently playing.

export interface Phrase {
  lang: Lang;
  text: string;
  /** Optional preferred voice (by display name); falls back to auto-pick. */
  voiceName?: string;
}

// Sensible default voices (macOS names) used when a language has no explicit
// choice. Auto-pick prefers these before falling back to any locale match.
export const DEFAULT_VOICE_NAMES: Record<Lang, string> = {
  zh: "美佳",
  en: "Samantha",
  ja: "O-Ren",
};

// Curated announcement-quality voices per language. When a language has an
// allowlist, only those voices are offered (falling back to the full curated
// list if none are installed on this device).
const VOICE_ALLOWLIST: Partial<Record<Lang, string[]>> = {
  zh: ["美佳", "Mei-Jia", "Li-Mu", "Tingting", "Ting-Ting", "婷婷", "Sinji", "Sin-ji"],
  en: ["Samantha", "Alex", "Daniel", "Karen", "Moira", "Tessa", "Serena", "Rishi", "Veena", "Allison", "Ava", "Nathan", "Noelle", "Joelle", "Aaron", "Nicky"],
  ja: ["O-Ren", "Kyoko", "Otoya", "Hattori"],
};

// Higher-quality / natural voices that sound like real announcements, matched
// by name marker regardless of language (network or downloaded premium voices).
const QUALITY_VOICE = /google|siri|enhanced|premium|natural|网络|網路|網絡/i;

// Novelty / joke voices that are unsuitable for announcements (macOS). Hidden
// from the picker so only usable voices are offered.
const BLOCKED_VOICES = new Set(
  [
    "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos",
    "Deranged", "Good News", "Hysterical", "Jester", "Junior", "Kathy",
    "Organ", "Pipe Organ", "Princess", "Ralph", "Superstar", "Trinoids",
    "Whisper", "Wobble", "Zarvox",
  ].map((n) => n.toLowerCase()),
);

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;

export function ttsSupported(): boolean {
  return !!synth;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
function refreshVoices() {
  if (synth) cachedVoices = synth.getVoices();
}
if (synth) {
  refreshVoices();
  synth.onvoiceschanged = refreshVoices;
}

/** Which of the requested languages actually have a usable voice installed. */
export function availableLanguages(langs: Lang[]): Lang[] {
  if (!synth) return [];
  if (!cachedVoices.length) refreshVoices();
  return langs.filter((l) => {
    const prefix = localeFor(l).slice(0, 2).toLowerCase();
    return cachedVoices.some((v) => v.lang.toLowerCase().startsWith(prefix));
  });
}

/** Installed, announcement-suitable voices for a language (for the picker). */
export function voicesForLang(lang: Lang): SpeechSynthesisVoice[] {
  if (!cachedVoices.length) refreshVoices();
  const prefix = localeFor(lang).slice(0, 2).toLowerCase();
  const inLang = cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const allow = VOICE_ALLOWLIST[lang];
  if (allow) {
    const picked = inLang.filter((v) => allow.includes(v.name) || QUALITY_VOICE.test(v.name));
    if (picked.length) return picked;
  }
  return inLang.filter((v) => !BLOCKED_VOICES.has(v.name.toLowerCase()));
}

function bestVoice(lang: Lang, voiceName?: string): SpeechSynthesisVoice | undefined {
  // Explicit choice, then the language default, then any locale match.
  const wanted = voiceName || DEFAULT_VOICE_NAMES[lang];
  if (wanted) {
    const byName = cachedVoices.find((v) => v.name === wanted);
    if (byName) return byName;
  }
  const locale = localeFor(lang).toLowerCase();
  const prefix = locale.slice(0, 2);
  return (
    cachedVoices.find((v) => v.lang.toLowerCase() === locale) ??
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  );
}

/** Speak a one-off sample phrase, used by the editor's "試聽" buttons. */
export function speakSample(lang: Lang, voiceName: string | undefined, rate = 1): void {
  speakSequence([{ lang, text: SAMPLE_TEXT[lang], voiceName }], rate);
}

const SAMPLE_TEXT: Record<Lang, string> = {
  zh: "下一站，台北車站。",
  en: "Next stop, Taipei Main Station.",
  ja: "次は、台北駅です。",
};

export function cancel(): void {
  synth?.cancel();
}

/** Speak a list of phrases sequentially. Returns a promise resolving when the
 *  whole sequence has finished (or been cancelled). */
export function speakSequence(phrases: Phrase[], rate = 1): Promise<void> {
  if (!synth || !phrases.length) return Promise.resolve();
  synth.cancel();
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= phrases.length) return resolve();
      const p = phrases[i++];
      const u = new SpeechSynthesisUtterance(p.text);
      u.lang = localeFor(p.lang);
      u.rate = rate;
      const v = bestVoice(p.lang, p.voiceName);
      if (v) u.voice = v;
      u.onend = next;
      u.onerror = next;
      synth!.speak(u);
    };
    next();
  });
}

// --- High level announcement helpers -------------------------------------

function voiceFor(route: RouteFile, lang: Lang): string | undefined {
  return route.settings.voices?.[lang];
}

export function announceRouteStart(route: RouteFile): Promise<void> {
  const langs = pickLangs(route);
  return speakSequence(
    langs.map((lang) => ({ lang, text: routeStart(route, lang), voiceName: voiceFor(route, lang) })),
    route.settings.ttsRate,
  );
}

export async function announceNextStop(route: RouteFile, stop: Stop, arrived = false): Promise<void> {
  const langs = pickLangs(route);
  const isTransferStop = !!stop.transfers?.length;
  const phrases: Phrase[] = [];
  for (const lang of langs) {
    const voiceName = voiceFor(route, lang);
    phrases.push({ lang, text: nextStop(stop, lang, arrived), voiceName });
    for (const t of stop.transfers ?? []) {
      phrases.push({ lang, text: transferLine(t, lang), voiceName });
    }
    // At important (transfer) stops, re-introduce the route after the stop info.
    if (isTransferStop) {
      phrases.push({ lang, text: routeStart(route, lang), voiceName });
    }
  }
  await playChime(route.settings.chime ?? "dingdong"); // chime before the next-stop announcement
  return speakSequence(phrases, route.settings.ttsRate);
}

function pickLangs(route: RouteFile): Lang[] {
  const avail = availableLanguages(route.settings.languages);
  // If voice detection found nothing (some browsers populate late), fall back
  // to the configured order and let the browser do its best.
  return avail.length ? route.settings.languages.filter((l) => avail.includes(l)) : route.settings.languages;
}
