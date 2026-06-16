import type { Theme } from "../types";

// Built-in operator colour themes. `bgColor` is kept near-black to match the
// look of real in-vehicle LCD panels. Values are approximations of operator
// identity colours and can be fine-tuned later.
export const THEMES: Theme[] = [
  {
    id: "tpe-union",
    name: "台北聯營 / 大都會客運",
    primary: "#9b30ff",
    headerGradient: ["#7b1fa2", "#b14aff"],
    accent: "#ff8c00",
    textColor: "#ffffff",
    bgColor: "#000000",
    dividerColor: "#9b30ff",
  },
  {
    id: "kingbus",
    name: "桃園 / 國光客運（長途）",
    primary: "#c8102e",
    headerGradient: ["#9e0b22", "#e2243d"],
    accent: "#ffd200",
    textColor: "#ffffff",
    bgColor: "#000000",
    dividerColor: "#c8102e",
  },
  {
    id: "teal",
    name: "通用 · 青綠",
    primary: "#008c8c",
    headerGradient: ["#00696e", "#00b3a6"],
    accent: "#ffd200",
    textColor: "#ffffff",
    bgColor: "#000000",
    dividerColor: "#008c8c",
  },
];

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Inject the active theme as CSS custom properties on a root element. */
export function themeToCssVars(t: Theme): Record<string, string> {
  return {
    "--c-primary": t.primary,
    "--c-grad-a": t.headerGradient?.[0] ?? t.primary,
    "--c-grad-b": t.headerGradient?.[1] ?? t.primary,
    "--c-accent": t.accent,
    "--c-text": t.textColor,
    "--c-bg": t.bgColor,
    "--c-divider": t.dividerColor,
  };
}
