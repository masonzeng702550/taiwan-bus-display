import type { Lang, RouteFile, Stop } from "../types";
import { localeFor, nextStop, routeStart, transferLine } from "./templates";

// Sequential speech engine built on the Web Speech API (SpeechSynthesis).
// Phrases play one after another (never overlapping); a new request cancels
// whatever is currently playing.

export interface Phrase {
  lang: Lang;
  text: string;
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

function bestVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const locale = localeFor(lang).toLowerCase();
  const prefix = locale.slice(0, 2);
  return (
    cachedVoices.find((v) => v.lang.toLowerCase() === locale) ??
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  );
}

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
      const v = bestVoice(p.lang);
      if (v) u.voice = v;
      u.onend = next;
      u.onerror = next;
      synth!.speak(u);
    };
    next();
  });
}

// --- High level announcement helpers -------------------------------------

export function announceRouteStart(route: RouteFile): Promise<void> {
  const langs = pickLangs(route);
  return speakSequence(
    langs.map((lang) => ({ lang, text: routeStart(route, lang) })),
    route.settings.ttsRate,
  );
}

export function announceNextStop(route: RouteFile, stop: Stop, arrived = false): Promise<void> {
  const langs = pickLangs(route);
  const phrases: Phrase[] = [];
  for (const lang of langs) {
    phrases.push({ lang, text: nextStop(stop, lang, arrived) });
    for (const t of stop.transfers ?? []) {
      phrases.push({ lang, text: transferLine(t, lang) });
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
