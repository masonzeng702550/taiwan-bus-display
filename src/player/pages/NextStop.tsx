import type { Lang, RouteFile, Stop } from "../../types";
import { FitText } from "../FitText";
import { primaryText, subText, type Locale } from "../display";

// "Next Stop" screen: optional fare bar across the top, then the upcoming stop
// name large (Chinese, or Japanese for Japan routes) with English beneath.
// Both names are kept on a single line, shrinking to fit.
export function NextStop({ route, stop, locale, langs }: { route: RouteFile; stop: Stop; locale: Locale; langs: Lang[] }) {
  const showFare = route.settings.showFare && !!stop.fare;
  const big = primaryText(stop.name, locale);
  const showEn = langs.includes("en");
  const unit = locale === "ja" ? "円" : "元";
  return (
    <div className="screen next-stop">
      {showFare && (
        <div className="fare-bar">
          <span>
            大人 <small>Adult</small>：{stop.fare!.adult} {unit}
          </span>
          <span>
            小兒 <small>Child</small>：{stop.fare!.child} {unit}
          </span>
        </div>
      )}
      <div className="next-label">
        次は <small>Next Stop:</small>
      </div>
      <div className="next-box">
        <FitText className="stop-zh" max={120} recalcKey={big}>{big}</FitText>
        {showEn && <div className="divider-line" />}
        {showEn && <FitText className="stop-en" max={56} recalcKey={subText(stop.name)}>{subText(stop.name)}</FitText>}
      </div>
    </div>
  );
}
