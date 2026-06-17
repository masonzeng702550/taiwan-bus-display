import type { I18n } from "../types";

export type Locale = "zh" | "ja";

// Which text goes where on the display, by locale.
//  zh (Taiwan): big = Chinese,  right = Japanese,        bottom = English
//  ja (Japan):  big = Japanese, right = hiragana reading, bottom = English
export function primaryText(i: I18n, locale: Locale): string {
  return locale === "ja" ? i.ja : i.zh;
}

export function readingText(i: I18n, locale: Locale): string {
  return locale === "ja" ? i.jaReading ?? "" : i.ja;
}

export function subText(i: I18n): string {
  return i.en;
}
