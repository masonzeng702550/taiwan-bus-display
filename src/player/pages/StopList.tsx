import type { RouteFile } from "../../types";
import { TransferIcon } from "../icons";

// "Stop List" screen: destination banner + route number badge, then the next
// few upcoming stops on a curved yellow rail. Orange oval markers sit on the
// rail for upcoming stops; the nearest (next) stop gets a teal "次は" circle
// and teal text at the bottom — matching the reference Kyoto layout.
export function StopList({ route, currentSeq }: { route: RouteFile; currentSeq: number }) {
  const count = route.settings.stopListCount;
  const upcoming = route.stops.filter((s) => s.seq >= currentSeq).slice(0, count);
  // Render far -> near (top to bottom); the last item is the next stop.
  const rows = [...upcoming].reverse();

  return (
    <div className="screen stop-list">
      <div className="route-banner">
        <span className="dest">{route.route.destination.zh}　行き</span>
        <span className="route-badge">{route.route.number}</span>
      </div>
      <div className="list-body">
        {/* Curved yellow rail: right edge vertical (markers sit here), left edge bulges out. */}
        <svg className="rail" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="railFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0a81e" />
              <stop offset="55%" stopColor="#f5d020" />
              <stop offset="100%" stopColor="#6b5a10" />
            </linearGradient>
          </defs>
          <path d="M100,0 L100,1000 C20,820 20,180 100,0 Z" fill="url(#railFill)" />
        </svg>
        <div className="rows">
          {rows.map((s, idx) => {
            const isNext = idx === rows.length - 1;
            return (
              <div key={s.seq} className={`list-row${isNext ? " next" : ""}`}>
                <span className="marker">
                  {isNext ? (
                    <span className="next-circle">
                      次は<span className="next-en">Next Stop</span>
                    </span>
                  ) : (
                    <span className="dot" />
                  )}
                </span>
                <div className="row-text">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
