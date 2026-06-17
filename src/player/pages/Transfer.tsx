import type { Transfer as TransferData } from "../../types";
import { TransferIcon } from "../icons";
import { FitText } from "../FitText";

// "Transfer" screen: header bar, then the connecting operator (icon + name)
// and the station name large in Chinese with the English reading beneath.
export function Transfer({ transfer }: { transfer: TransferData }) {
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
            <div className="op-zh">{transfer.operator.zh}</div>
            <div className="op-en">{transfer.operator.en}</div>
          </div>
        </div>
        {transfer.station && (
          <>
            <div className="divider-line" />
            <FitText className="station-zh" max={120} recalcKey={transfer.station.zh}>{transfer.station.zh}</FitText>
            <FitText className="station-en" max={56} recalcKey={transfer.station.en}>{transfer.station.en}</FitText>
          </>
        )}
      </div>
    </div>
  );
}
