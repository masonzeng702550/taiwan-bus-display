import type { I18n, Lang } from "../types";

// Lightweight client-side translation using the free MyMemory API (CORS-enabled,
// no key needed). Quality is best-effort — Japanese results in particular should
// be reviewed, since Taiwan place names are transliterations rather than real
// translations. Kept pluggable so a better provider can be swapped in later.

const MM_LANG: Record<Lang, string> = {
  zh: "zh-TW",
  en: "en-GB",
  ja: "ja-JP",
};

async function translateText(text: string, from: Lang, to: Lang): Promise<string> {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    `&langpair=${MM_LANG[from]}|${MM_LANG[to]}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate failed: ${res.status}`);
  const data = (await res.json()) as { responseData?: { translatedText?: string } };
  return data.responseData?.translatedText?.trim() ?? "";
}

const PRIORITY: Lang[] = ["zh", "en", "ja"];

/** Returns the source language to translate FROM: the first non-empty field. */
function sourceLang(i18n: I18n): Lang | null {
  return PRIORITY.find((l) => i18n[l].trim().length > 0) ?? null;
}

/** Fill any empty language fields by translating from the first filled one.
 *  Never overwrites text the user already entered. No-op if all filled / all empty. */
export async function fillEmptyLanguages(i18n: I18n): Promise<I18n> {
  const src = sourceLang(i18n);
  if (!src) return i18n;
  const targets = PRIORITY.filter((l) => l !== src && i18n[l].trim().length === 0);
  if (!targets.length) return i18n;

  const result: I18n = { ...i18n };
  for (const t of targets) {
    try {
      const translated = await translateText(i18n[src], src, t);
      if (translated) result[t] = translated;
    } catch {
      /* leave the field empty on failure; user can retry or type manually */
    }
  }
  return result;
}

/** True if at least one field is filled and at least one is empty. */
export function needsFill(i18n: I18n): boolean {
  const filled = PRIORITY.filter((l) => i18n[l].trim().length > 0).length;
  return filled > 0 && filled < PRIORITY.length;
}
