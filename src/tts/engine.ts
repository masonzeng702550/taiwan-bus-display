import type { Lang, RouteFile, Stop } from "../types";
import { localeFor, nextStop, routeStart, transferLine } from "./templates";

// Sequential speech engine built on the Web Speech API (SpeechSynthesis).
// Phrases play one after another (never overlapping); a new request cancels
// whatever is currently playing.

export interface Phrase {
  lang: Lang;
  text: string;
  /** Optional preferred voice (voiceURI); falls back to auto-pick. */
  voiceURI?: string;
}

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

/** All installed voices that match a language (for the editor's picker). */
export function voicesForLang(lang: Lang): SpeechSynthesisVoice[] {
  if (!cachedVoices.length) refreshVoices();
  const prefix = localeFor(lang).slice(0, 2).toLowerCase();
  return cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
}

function bestVoice(lang: Lang, voiceURI?: string): SpeechSynthesisVoice | undefined {
  if (voiceURI) {
    const chosen = cachedVoices.find((v) => v.voiceURI === voiceURI);
    if (chosen) return chosen;
  }
  const locale = localeFor(lang).toLowerCase();
  const prefix = locale.slice(0, 2);
  return (
    cachedVoices.find((v) => v.lang.toLowerCase() === locale) ??
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  );
}

/** Speak a one-off sample phrase, used by the editor's "試聽" buttons. */
export function speakSample(lang: Lang, voiceURI: string | undefined, rate = 1): void {
  speakSequence([{ lang, text: SAMPLE_TEXT[lang], voiceURI }], rate);
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
      const v = bestVoice(p.lang, p.voiceURI);
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
    langs.map((lang) => ({ lang, text: routeStart(route, lang), voiceURI: voiceFor(route, lang) })),
    route.settings.ttsRate,
  );
}

export function announceNextStop(route: RouteFile, stop: Stop, arrived = false): Promise<void> {
  const langs = pickLangs(route);
  const phrases: Phrase[] = [];
  for (const lang of langs) {
    const voiceURI = voiceFor(route, lang);
    phrases.push({ lang, text: nextStop(stop, lang, arrived), voiceURI });
    for (const t of stop.transfers ?? []) {
      phrases.push({ lang, text: transferLine(t, lang), voiceURI });
    }
  }
  return speakSequence(phrases, route.settings.ttsRate);
}

function pickLangs(route: RouteFile): Lang[] {
  const avail = availableLanguages(route.settings.languages);
  // If voice detection found nothing (some browsers populate late), fall back
  // to the configured order and let the browser do its best.
  return avail.length ? route.settings.languages.filter((l) => avail.includes(l)) : route.settings.languages;
}
