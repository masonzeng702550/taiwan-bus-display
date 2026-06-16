import type { TransferType } from "../types";

// Minimal inline glyphs for transfer types. Kept as text/emoji to avoid asset
// dependencies; swap for SVG icons later if desired.
const GLYPH: Record<TransferType, string> = {
  metro: "Ⓜ",
  tra: "🚆",
  thsr: "🚄",
  bus: "🚌",
  other: "🔁",
};

export function TransferIcon({ type, size = 1 }: { type: TransferType; size?: number }) {
  return (
    <span className="transfer-icon" style={{ fontSize: `${size}em` }} aria-hidden>
      {GLYPH[type]}
    </span>
  );
}

const LABEL: Record<TransferType, { zh: string; en: string }> = {
  metro: { zh: "捷運", en: "Metro" },
  tra: { zh: "台鐵", en: "Railway" },
  thsr: { zh: "高鐵", en: "HSR" },
  bus: { zh: "客運", en: "Bus" },
  other: { zh: "轉乘", en: "Transfer" },
};

export function transferTypeLabel(type: TransferType) {
  return LABEL[type];
}
