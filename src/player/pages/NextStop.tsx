import type { RouteFile, Stop } from "../../types";
import { FitText } from "../FitText";
import { primaryText, subText, type Locale } from "../display";

// "Next Stop" screen: optional fare bar across the top, then the upcoming stop
// name large (Chinese, or Japanese for Japan routes) with English beneath.
// Both names are kept on a single line, shrinking to fit.
export function NextStop({ route, stop, locale }: { route: RouteFile; stop: Stop; locale: Locale }) {
  const showFare = route.settings.showFare && !!stop.fare;
  const big = primaryText(stop.name, locale);
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
        <FitText className="stop-zh" max={120} recalcKey={big}>{big}</FitText>
        <div className="divider-line" />
        <FitText className="stop-en" max={56} recalcKey={subText(stop.name)}>{subText(stop.name)}</FitText>
      </div>
    </div>
  );
}
