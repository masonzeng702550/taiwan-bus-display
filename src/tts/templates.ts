import type { I18n, Lang, RouteFile, Stop, Transfer } from "../types";

// Announcement text builders. Only three kinds are produced:
// route start, next-stop, and transfer. No ads / etiquette / fare notices.

const BCP47: Record<Lang, string> = {
  zh: "zh-TW",
  en: "en-US",
  ja: "ja-JP",
};

export function localeFor(lang: Lang): string {
  return BCP47[lang];
}

function pick(i18n: I18n, lang: Lang): string {
  return i18n[lang];
}

/** Prefer an explicit reading hint (zhReading / jaReading) when available so
 *  TTS pronounces names more naturally; otherwise fall back to the display text. */
function spoken(i18n: I18n, lang: Lang): string {
  if (lang === "ja" && i18n.jaReading) return i18n.jaReading;
  if (lang === "zh" && i18n.zhReading) return i18n.zhReading;
  return pick(i18n, lang);
}

export function routeStart(route: RouteFile, lang: Lang): string {
  const op = pick(route.operator.name, lang);
  const dest = spoken(route.route.destination, lang);
  const num = route.route.number;
  switch (lang) {
    case "zh":
      return `歡迎搭乘${op}，本車${num}路，往${dest}方向。`;
    case "en":
      return `Welcome aboard. This is route ${num} bound for ${dest}.`;
    case "ja":
      return `ご乗車ありがとうございます。このバスは${num}系統、${dest}ゆきです。`;
  }
}

export function nextStop(stop: Stop, lang: Lang, arrived = false): string {
  const name = spoken(stop.name, lang);
  if (stop.isTerminal) {
    // Terminal stop gets a distinct "final stop / please alight" announcement.
    switch (lang) {
      case "zh":
        return arrived ? `終點站，${name}到了，請所有旅客下車。` : `下一站，${name}，為本班車終點站。`;
      case "en":
        return arrived
          ? `This is the final stop, ${name}. Please alight. Thank you for riding.`
          : `The next stop, ${name}, is the last stop on this route.`;
      case "ja":
        return arrived
          ? `終点、${name}です。ご乗車ありがとうございました。`
          : `次は、終点、${name}です。`;
    }
  }
  switch (lang) {
    case "zh":
      return arrived ? `${name}到了。` : `下一站，${name}。`;
    case "en":
      return arrived ? `Now arriving at ${name}.` : `Next stop, ${name}.`;
    case "ja":
      return arrived ? `まもなく、${name}です。` : `次は、${name}です。`;
  }
}

export function transferLine(t: Transfer, lang: Lang): string {
  const op = pick(t.operator, lang);
  switch (lang) {
    case "zh":
      return `於本站可轉乘${op}。`;
    case "en":
      return `Transfer here for ${op}.`;
    case "ja":
      return `${op}は、お乗り換えください。`;
  }
}
