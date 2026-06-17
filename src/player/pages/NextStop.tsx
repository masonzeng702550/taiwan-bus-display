import type { RouteFile, Stop } from "../../types";

// "Next Stop" screen: optional fare bar across the top, then the upcoming stop
// name large in Chinese with the English reading beneath.
export function NextStop({ route, stop }: { route: RouteFile; stop: Stop }) {
  const showFare = route.settings.showFare && !!stop.fare;
  return (
    <div className="screen next-stop">
      {showFare && (
        <div className="fare-bar">
          <span>
            大人 <small>Adult</small>：{stop.fare!.adult} 元
          </span>
          <span>
            小兒 <small>Child</small>：{stop.fare!.child} 元
          </span>
        </div>
      )}
      <div className="next-label">
        次は <small>Next Stop:</small>
      </div>
      <div className="next-box">
        <div className="stop-zh fit">{stop.name.zh}</div>
        <div className="divider-line" />
        <div className="stop-en">{stop.name.en}</div>
      </div>
    </div>
  );
}
