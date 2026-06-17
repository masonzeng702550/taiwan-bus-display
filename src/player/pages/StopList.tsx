import type { RouteFile } from "../../types";
import { TransferIcon } from "../icons";

// "Stop List" screen. The left rail matches the reference Kyoto layout: orange
// oval markers step diagonally down-and-left (top marker furthest right, the
// next stop's teal circle at the bottom-left), sitting on a curved golden band,
// with thin connector lines running right to each station name.
export function StopList({ route, currentSeq }: { route: RouteFile; currentSeq: number }) {
  const count = route.settings.stopListCount;
  const upcoming = route.stops.filter((s) => s.seq >= currentSeq).slice(0, count);
  // Render far -> near (top to bottom); the last item is the next stop.
  const rows = [...upcoming].reverse();
  const n = rows.length;

  // Marker horizontal position (% of rail zone): top is rightmost, bottom-left.
  const markerX = (idx: number) => (n > 1 ? 62 - (idx / (n - 1)) * 46 : 40);
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
                <stop offset="0%" stopColor="#f2a51c" />
                <stop offset="55%" stopColor="#f6d22a" />
                <stop offset="100%" stopColor="#5e4f12" />
              </linearGradient>
            </defs>
            <path d="M70,-2 C44,22 26,56 14,102 L44,102 C30,56 52,22 84,-2 Z" fill="url(#railFill)" />
          </svg>
          {rows.map((s, idx) => {
            const isNext = idx === n - 1;
            const x = markerX(idx);
            const y = rowY(idx);
            return (
              <div key={s.seq}>
                <span className="connector" style={{ top: `${y}%`, left: `${x}%` }} />
                <span
                  className={isNext ? "next-circle" : "dot"}
                  style={{ top: `${y}%`, left: `${x}%` }}
                >
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
                <div className="row-name">
                  {s.name.zh}
                  {s.transfers?.length ? (
                    <span className="row-transfers">
                      {s.transfers.map((t, i) => (
                        <TransferIcon key={i} type={t.type} />
                      ))}
                    </span>
                  ) : null}
                </div>
                <div className="row-en">{s.name.en}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
