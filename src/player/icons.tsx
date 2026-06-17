import type { TransferType } from "../types";

// Custom, unified-style transfer icons (no emoji): a dark glyph on a white
// rounded badge, sized in `em` so it scales with the surrounding text.
// metro/tra/thsr are front-view trains (HSR streamlined), bus is a bus front,
// other is a transfer/cycle arrow pair.

const DARK = "#1a1a1a";

function Glyph({ type }: { type: TransferType }) {
  switch (type) {
    case "thsr":
      return (
        <>
          <path d="M12 2.5c-3.6 0-5.5 2.6-5.5 6.2V17a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3V8.7c0-3.6-1.9-6.2-5.5-6.2Z" fill={DARK} />
          <path d="M8 9.2c2.6-1.5 5.4-1.5 8 0V12H8Z" fill="#fff" />
          <circle cx="9.5" cy="15" r="1.4" fill="#fff" />
          <circle cx="14.5" cy="15" r="1.4" fill="#fff" />
          <rect x="8" y="20" width="2.4" height="2.6" rx="0.6" fill={DARK} />
          <rect x="13.6" y="20" width="2.4" height="2.6" rx="0.6" fill={DARK} />
        </>
      );
    case "bus":
      return (
        <>
          <rect x="4.5" y="3" width="15" height="15" rx="2.6" fill={DARK} />
          <rect x="6.6" y="5.4" width="10.8" height="4.6" rx="1" fill="#fff" />
          <circle cx="8.3" cy="13.2" r="1.3" fill="#fff" />
          <circle cx="15.7" cy="13.2" r="1.3" fill="#fff" />
          <rect x="6" y="17.6" width="3" height="3.2" rx="1" fill={DARK} />
          <rect x="15" y="17.6" width="3" height="3.2" rx="1" fill={DARK} />
        </>
      );
    case "other":
      return (
        <g fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 10.5A6 6 0 0 1 16.5 7" />
          <path d="M16.8 3.6V7.3h-3.7" />
          <path d="M18 13.5A6 6 0 0 1 7.5 17" />
          <path d="M7.2 20.4V16.7h3.7" />
        </g>
      );
    case "metro":
    case "tra":
    default:
      return (
        <>
          {type === "tra" && <rect x="10.6" y="1.4" width="2.8" height="2" rx="0.6" fill={DARK} />}
          <rect x="5" y="3" width="14" height="16" rx="4" fill={DARK} />
          <rect x="7.5" y="5.6" width="9" height="5" rx="1.6" fill="#fff" />
          <circle cx="9" cy="14.2" r="1.5" fill="#fff" />
          <circle cx="15" cy="14.2" r="1.5" fill="#fff" />
          <rect x="7" y="19" width="2.6" height="2.8" rx="0.6" fill={DARK} />
          <rect x="14.4" y="19" width="2.6" height="2.8" rx="0.6" fill={DARK} />
        </>
      );
  }
}

export function TransferIcon({ type, size = 1 }: { type: TransferType; size?: number }) {
  return (
    <span className="transfer-icon" style={{ fontSize: `${size}em` }} aria-hidden>
      <svg viewBox="0 0 24 24" width="1em" height="1em">
        <Glyph type={type} />
      </svg>
    </span>
  );
}
