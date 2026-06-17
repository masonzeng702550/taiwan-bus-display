import type { Lang, Transfer as TransferData } from "../../types";
import { TransferIcon } from "../icons";
import { FitText } from "../FitText";
import { primaryText, subText, type Locale } from "../display";

// "Transfer" screen: header bar, then the connecting operator (icon + name)
// and the station name large in Chinese with the English reading beneath.
export function Transfer({ transfer, locale, langs }: { transfer: TransferData; locale: Locale; langs: Lang[] }) {
  const showEn = langs.includes("en");
  return (
    <div className="screen transfer">
      <div className="transfer-header">
        轉乘資訊　のりかえのご案内 <small>/ Transfer</small>
      </div>
      <div className="transfer-body">
        <div className="op-row">
          <span className="op-icon">
            <TransferIcon type={transfer.type} size={1.4} />
          </span>
          <div className="op-text">
            <div className="op-zh">{primaryText(transfer.operator, locale)}</div>
            {showEn && <div className="op-en">{subText(transfer.operator)}</div>}
          </div>
        </div>
        {transfer.station && (
          <>
            <div className="divider-line" />
            <FitText className="station-zh" max={120} recalcKey={primaryText(transfer.station, locale)}>{primaryText(transfer.station, locale)}</FitText>
            {showEn && <FitText className="station-en" max={56} recalcKey={subText(transfer.station)}>{subText(transfer.station)}</FitText>}
          </>
        )}
      </div>
    </div>
  );
}
