// Core data model for a single bus route. One route == one RouteFile (JSON).

export type Lang = "zh" | "en" | "ja";

export interface I18n {
  zh: string;
  en: string;
  ja: string;
  /** Optional reading hints to make TTS sound natural. */
  zhReading?: string;
  jaReading?: string;
}

export type TransferType = "metro" | "tra" | "thsr" | "bus" | "other";

export interface Transfer {
  type: TransferType;
  operator: I18n;
  station?: I18n;
  line?: I18n;
}

export interface Fare {
  adult: number;
  child: number;
}

export interface Gps {
  lat: number;
  lng: number;
  /** Trigger radius in metres for GPS auto mode. */
  radius: number;
}

export interface Stop {
  seq: number;
  name: I18n;
  isTerminal?: boolean;
  fare?: Fare;
  transfers?: Transfer[];
  gps?: Gps;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  headerGradient?: [string, string];
  accent: string;
  textColor: string;
  bgColor: string;
  dividerColor: string;
}

export interface PlaybackSettings {
  cycleSeconds: { nextStop: number; stopList: number; transfer: number };
  languages: Lang[];
  ttsRate: number;
  showFare: boolean;
  stopListCount: number;
  /** Preferred TTS voice (by display name) per language; empty = auto-pick. */
  voices?: Partial<Record<Lang, string>>;
}

export interface RouteFile {
  schemaVersion: 1;
  operator: { id: string; name: I18n; themeId: string };
  theme: Theme;
  route: {
    id: string;
    number: string;
    name: I18n;
    direction: "outbound" | "inbound";
    destination: I18n;
  };
  stops: Stop[];
  settings: PlaybackSettings;
}

export const DEFAULT_SETTINGS: PlaybackSettings = {
  cycleSeconds: { nextStop: 6, stopList: 6, transfer: 6 },
  languages: ["zh", "en", "ja"],
  ttsRate: 1,
  showFare: true,
  stopListCount: 4,
  voices: { zh: "Li-Mu", en: "Samantha", ja: "O-Ren" },
};
