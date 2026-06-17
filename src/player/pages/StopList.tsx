import type { RouteFile } from "../../types";
import { TransferIcon } from "../icons";
import { FitText } from "../FitText";

// "Stop List" screen. The left rail matches the reference Kyoto layout: a thick
// curved golden band, large orange ovals (dark-outlined) sitting on it stepping
// down-and-left, and the next stop's teal circle at the bottom. Connector lines
// run right to each station name and become the separator between zh and en.
export function StopList({ route, currentSeq }: { route: RouteFile; currentSeq: number }) {
  const count = route.settings.stopListCount;
  const upcoming = route.stops.filter((s) => s.seq >= currentSeq).slice(0, count);
  // Render far -> near (top to bottom); the last item is the next stop.
  const rows = [...upcoming].reverse();
  const n = rows.length;

  // Marker position along the band centreline (% of rail zone): top is right.
  const markerX = (idx: number) => (n > 1 ? 60 - (idx / (n - 1)) * 38 : 40);
  const rowY = (idx: number) => ((idx + 0.5) / n) * 100;

  return (
    <div className="screen stop-list">
      <div className="route-banner">
        <span className="dest">{route.route.destination.zh}　行き</span>
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
            <path d="M76,-6 C57,28 45,62 37,106 L7,106 C15,62 29,28 50,-6 Z" fill="url(#railFill)" />
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
                    <FitText className="row-zh" max={isNext ? 72 : 54} recalcKey={s.name.zh}>
                      {s.name.zh}
                      {s.transfers?.length ? (
                        <span className="row-transfers">
                          {s.transfers.map((t, i) => (
                            <TransferIcon key={i} type={t.type} />
                          ))}
                        </span>
                      ) : null}
                    </FitText>
                  </div>
                  {s.name.ja && (
                    <div className="ja-wrap">
                      <FitText className="row-ja" max={isNext ? 32 : 27} recalcKey={s.name.ja}>
                        {s.name.ja}
                      </FitText>
                    </div>
                  )}
                </div>
                <div className="row-sep" />
                <div className="row-en-box">
                  <FitText className="row-en" max={isNext ? 34 : 28} recalcKey={s.name.en}>
                    {s.name.en}
                  </FitText>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
