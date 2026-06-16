import type { RouteFile } from "../../types";
import { TransferIcon } from "../icons";

// "Stop List" screen: destination banner + route number badge, then the next
// few upcoming stops. The nearest (next) stop is highlighted in the accent
// colour at the bottom, matching the reference Kyoto layout.
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
        <div className="arc" aria-hidden />
        {rows.map((s, idx) => {
          const isNext = idx === rows.length - 1;
          return (
            <div key={s.seq} className={`list-row${isNext ? " next" : ""}`}>
              <span className="dot" aria-hidden />
              <div className="row-text">
                <div className="row-name">
                  {isNext && <span className="next-tag">次は Next</span>}
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
  );
}
