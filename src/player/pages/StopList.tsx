import type { Lang, RouteFile } from "../../types";
import { TransferIcon } from "../icons";
import { FitText } from "../FitText";
import { primaryText, readingText, subText, type Locale } from "../display";

// "Stop List" screen. The left rail matches the reference Kyoto layout: a thick
// curved golden band, large orange ovals (dark-outlined) sitting on it stepping
// down-and-left, and the next stop's teal circle at the bottom. Connector lines
// run right to each station name and become the separator between zh and en.
export function StopList({ route, currentSeq, locale, langs }: { route: RouteFile; currentSeq: number; locale: Locale; langs: Lang[] }) {
  const showReading = langs.includes("ja");
  const showEn = langs.includes("en");
  const count = route.settings.stopListCount;
  const upcoming = route.stops.filter((s) => s.seq >= currentSeq).slice(0, count);
  // Render far -> near (top to bottom); the last item is the next stop.
  const rows = [...upcoming].reverse();
  const n = rows.length;

  // Place each marker on the band's actual centreline. The band centreline is a
  // cubic bezier (the average of the band's two edges); evaluate it at each row's
  // vertical position so the circles sit on the curve rather than a straight line.
  const rowY = (idx: number) => ((idx + 0.5) / n) * 100;
  const bez = (a: number, b: number, c: number, d: number, t: number) => {
    const u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  };
  const markerX = (idx: number) => {
    const yPct = rowY(idx);
    let lo = 0, hi = 1;
    for (let i = 0; i < 28; i++) {
      const m = (lo + hi) / 2;
      if (bez(-6, 28, 62, 106, m) < yPct) lo = m;
      else hi = m;
    }
    return bez(64, 43, 30, 21, (lo + hi) / 2); // centreline x at that y
  };

  return (
    <div className="screen stop-list">
      <div className="route-banner">
        <span className="dest">{primaryText(route.route.destination, locale)}　行き</span>
        <span className="route-badge">{route.route.number}</span>
      </div>
      <div className="list-body">
        <div className="rail-zone">
          <svg className="rail-band" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="railFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef9a1e" />
                <stop offset="24%" stopColor="#f6cf2b" />
                <stop offset="62%" stopColor="#f8e85e" />
                <stop offset="100%" stopColor="#ecd221" />
              </linearGradient>
            </defs>
            <path d="M78,-6 C58,28 46,62 38,106 L4,106 C14,62 28,28 50,-6 Z" fill="url(#railFill)" />
          </svg>
          {rows.map((s, idx) => {
            const isNext = idx === n - 1;
            const x = markerX(idx);
            const y = rowY(idx);
            return (
              <div key={s.seq}>
                <span className="connector" style={{ top: `${y}%`, left: `${x}%` }} />
                <span className={isNext ? "next-circle" : "dot"} style={{ top: `${y}%`, left: `${x}%` }}>
                  {isNext && (
                    <>
                      次は<span className="next-en">Next Stop</span>
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className="rows">
          {rows.map((s, idx) => {
            const isNext = idx === n - 1;
            return (
              <div key={s.seq} className={`list-row${isNext ? " next" : ""}`}>
                <div className="row-top">
                  <div className="zh-wrap">
                    <FitText className="row-zh" max={isNext ? 72 : 54} recalcKey={primaryText(s.name, locale)}>
                      {primaryText(s.name, locale)}
                      {s.transfers?.length ? (
                        <span className="row-transfers">
                          {s.transfers.map((t, i) => (
                            <TransferIcon key={i} type={t.type} />
                          ))}
                        </span>
                      ) : null}
                    </FitText>
                  </div>
                  {showReading && readingText(s.name, locale) && (
                    <div className="ja-wrap">
                      <FitText className="row-ja" max={isNext ? 32 : 27} recalcKey={readingText(s.name, locale)}>
                        {readingText(s.name, locale)}
                      </FitText>
                    </div>
                  )}
                </div>
                <div className="row-sep" />
                {showEn && (
                  <div className="row-en-box">
                    <FitText className="row-en" max={isNext ? 34 : 28} recalcKey={subText(s.name)}>
                      {subText(s.name)}
                    </FitText>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
