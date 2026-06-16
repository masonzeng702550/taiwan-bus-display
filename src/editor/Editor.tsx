import { useRef, useState } from "react";
import type { RouteFile, Stop, Theme, Transfer, TransferType } from "../types";
import { THEMES, themeById, themeToCssVars } from "../data/themes";
import { exportRoute, parseRouteFile, saveRoute } from "../data/storage";
import { fillEmptyLanguages, needsFill } from "../data/translate";
import { SAMPLE_ROUTES } from "../data/sampleRoute";
import { NextStop } from "../player/pages/NextStop";

const TRANSFER_TYPES: TransferType[] = ["metro", "tra", "thsr", "bus", "other"];

function blankStop(seq: number): Stop {
  return {
    seq,
    name: { zh: "", en: "", ja: "" },
    fare: { adult: 15, child: 8 },
    transfers: [],
    gps: { lat: 0, lng: 0, radius: 60 },
  };
}

export function Editor({
  route,
  onChange,
  onPlay,
}: {
  route: RouteFile;
  onChange: (r: RouteFile) => void;
  onPlay: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const update = (patch: Partial<RouteFile>) => onChange({ ...route, ...patch });

  const setTheme = (theme: Theme) =>
    update({ theme, operator: { ...route.operator, themeId: theme.id } });

  const setStops = (stops: Stop[]) => update({ stops: stops.map((s, i) => ({ ...s, seq: i + 1 })) });

  const updateStop = (idx: number, patch: Partial<Stop>) =>
    setStops(route.stops.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const handleImport = (file: File) => {
    file.text().then((text) => {
      try {
        onChange(parseRouteFile(text));
        setImportError("");
      } catch (e) {
        setImportError((e as Error).message);
      }
    });
  };

  const translateAll = async () => {
    setBulkBusy(true);
    try {
      const next = [...route.stops];
      for (let i = 0; i < next.length; i++) {
        if (needsFill(next[i].name)) next[i] = { ...next[i], name: await fillEmptyLanguages(next[i].name) };
      }
      setStops(next);
    } finally {
      setBulkBusy(false);
    }
  };

  const cssVars = themeToCssVars(route.theme) as React.CSSProperties;

  return (
    <div className="editor">
      <header className="editor-top">
        <h1>台灣巴士車內資訊顯示系統</h1>
        <div className="top-actions">
          <select
            defaultValue=""
            onChange={(e) => {
              const s = SAMPLE_ROUTES[+e.target.value];
              if (s) onChange(structuredClone(s.route));
              e.target.value = "";
            }}
          >
            <option value="" disabled>載入範例…</option>
            {SAMPLE_ROUTES.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
          </select>
          <button onClick={() => { saveRoute(route); }}>儲存</button>
          <button onClick={() => exportRoute(route)}>匯出 JSON</button>
          <button onClick={() => fileRef.current?.click()}>匯入 JSON</button>
          <button className="primary" onClick={() => { saveRoute(route); onPlay(); }}>▶ 開始播放</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>
      </header>
      {importError && <p className="error">匯入失敗：{importError}</p>}

      <div className="editor-grid">
        <section className="panel">
          <h2>① 業者與配色</h2>
          <label>業者名稱（中）<input value={route.operator.name.zh} onChange={(e) => update({ operator: { ...route.operator, name: { ...route.operator.name, zh: e.target.value } } })} /></label>
          <label>業者名稱（英）<input value={route.operator.name.en} onChange={(e) => update({ operator: { ...route.operator, name: { ...route.operator.name, en: e.target.value } } })} /></label>
          <label>業者名稱（日）<input value={route.operator.name.ja} onChange={(e) => update({ operator: { ...route.operator, name: { ...route.operator.name, ja: e.target.value } } })} /></label>

          <label>內建主題
            <select value={THEMES.some((t) => t.id === route.theme.id) ? route.theme.id : "custom"} onChange={(e) => e.target.value !== "custom" && setTheme(themeById(e.target.value))}>
              {THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              <option value="custom">自訂</option>
            </select>
          </label>
          <div className="color-row">
            <ColorField label="主色" value={route.theme.primary} onChange={(v) => setTheme({ ...route.theme, id: "custom", primary: v })} />
            <ColorField label="強調" value={route.theme.accent} onChange={(v) => setTheme({ ...route.theme, id: "custom", accent: v })} />
            <ColorField label="文字" value={route.theme.textColor} onChange={(v) => setTheme({ ...route.theme, id: "custom", textColor: v })} />
            <ColorField label="背景" value={route.theme.bgColor} onChange={(v) => setTheme({ ...route.theme, id: "custom", bgColor: v })} />
            <ColorField label="分隔線" value={route.theme.dividerColor} onChange={(v) => setTheme({ ...route.theme, id: "custom", dividerColor: v })} />
          </div>
        </section>

        <section className="panel">
          <h2>② 路線資料</h2>
          <label>路線號<input value={route.route.number} onChange={(e) => update({ route: { ...route.route, number: e.target.value, id: e.target.value } })} /></label>
          <label>方向
            <select value={route.route.direction} onChange={(e) => update({ route: { ...route.route, direction: e.target.value as "outbound" | "inbound" } })}>
              <option value="outbound">去程</option>
              <option value="inbound">返程</option>
            </select>
          </label>
          <label>終點（中）<input value={route.route.destination.zh} onChange={(e) => update({ route: { ...route.route, destination: { ...route.route.destination, zh: e.target.value } } })} /></label>
          <label>終點（英）<input value={route.route.destination.en} onChange={(e) => update({ route: { ...route.route, destination: { ...route.route.destination, en: e.target.value } } })} /></label>
          <label>終點（日）<input value={route.route.destination.ja} onChange={(e) => update({ route: { ...route.route, destination: { ...route.route.destination, ja: e.target.value } } })} /></label>
          <label className="check"><input type="checkbox" checked={route.settings.showFare} onChange={(e) => update({ settings: { ...route.settings, showFare: e.target.checked } })} />顯示票價列</label>
        </section>

        <section className="panel preview" style={cssVars}>
          <h2>即時預覽（下一站）</h2>
          <div className="preview-frame">
            {route.stops[0] && <NextStop route={route} stop={route.stops[0]} />}
          </div>
        </section>
      </div>

      <section className="panel stops-panel">
        <div className="stops-head">
          <h2>③ 站序與轉乘（{route.stops.length} 站）</h2>
          <div className="stops-head-actions">
            <button onClick={translateAll} disabled={bulkBusy} title="將每站缺少的語言自動翻譯填入">
              {bulkBusy ? "翻譯中…" : "🌐 翻譯所有空白欄位"}
            </button>
            <button onClick={() => setStops([...route.stops, blankStop(route.stops.length + 1)])}>＋ 新增站</button>
          </div>
        </div>
        <p className="hint-text">提示：在任一語言欄位輸入站名後切換到其他欄位，會自動翻譯填入空白的另外兩種語言（日文為機器翻譯，建議檢查）。</p>
        <div className="stops-table">
          {route.stops.map((s, idx) => (
            <StopRow
              key={idx}
              stop={s}
              idx={idx}
              total={route.stops.length}
              onUpdate={(patch) => updateStop(idx, patch)}
              onMove={(dir) => {
                const j = idx + dir;
                if (j < 0 || j >= route.stops.length) return;
                const arr = [...route.stops];
                [arr[idx], arr[j]] = [arr[j], arr[idx]];
                setStops(arr);
              }}
              onRemove={() => setStops(route.stops.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="color-field">
      <span>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function StopRow({
  stop,
  idx,
  total,
  onUpdate,
  onMove,
  onRemove,
}: {
  stop: Stop;
  idx: number;
  total: number;
  onUpdate: (patch: Partial<Stop>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const setName = (k: "zh" | "en" | "ja" | "jaReading") => (v: string) =>
    onUpdate({ name: { ...stop.name, [k]: v } });

  const autofill = async () => {
    if (busy || !needsFill(stop.name)) return;
    setBusy(true);
    try {
      onUpdate({ name: await fillEmptyLanguages(stop.name) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stop-row">
      <div className="stop-main">
        <span className="seq">{idx + 1}</span>
        <input className="cell" placeholder="站名（中）" value={stop.name.zh} onChange={(e) => setName("zh")(e.target.value)} onBlur={autofill} />
        <input className="cell" placeholder="English" value={stop.name.en} onChange={(e) => setName("en")(e.target.value)} onBlur={autofill} />
        <input className="cell" placeholder="日本語" value={stop.name.ja} onChange={(e) => setName("ja")(e.target.value)} onBlur={autofill} />
        <button className="icon" onClick={autofill} disabled={busy} title="自動翻譯空白語言">{busy ? "…" : "譯"}</button>
        <button className="icon" onClick={() => onMove(-1)} disabled={idx === 0}>↑</button>
        <button className="icon" onClick={() => onMove(1)} disabled={idx === total - 1}>↓</button>
        <button className="icon" onClick={() => setOpen((o) => !o)}>{open ? "▲" : "▼"}</button>
        <button className="icon danger" onClick={onRemove}>✕</button>
      </div>
      {open && (
        <div className="stop-detail">
          <div className="detail-row">
            <label>日文讀音<input value={stop.name.jaReading ?? ""} onChange={(e) => setName("jaReading")(e.target.value)} /></label>
            <label>全票<input type="number" value={stop.fare?.adult ?? 0} onChange={(e) => onUpdate({ fare: { adult: +e.target.value, child: stop.fare?.child ?? 0 } })} /></label>
            <label>半票<input type="number" value={stop.fare?.child ?? 0} onChange={(e) => onUpdate({ fare: { adult: stop.fare?.adult ?? 0, child: +e.target.value } })} /></label>
          </div>
          <div className="detail-row">
            <label>緯度 lat<input type="number" step="0.0001" value={stop.gps?.lat ?? 0} onChange={(e) => onUpdate({ gps: { lat: +e.target.value, lng: stop.gps?.lng ?? 0, radius: stop.gps?.radius ?? 60 } })} /></label>
            <label>經度 lng<input type="number" step="0.0001" value={stop.gps?.lng ?? 0} onChange={(e) => onUpdate({ gps: { lat: stop.gps?.lat ?? 0, lng: +e.target.value, radius: stop.gps?.radius ?? 60 } })} /></label>
            <label>觸發半徑 m<input type="number" value={stop.gps?.radius ?? 60} onChange={(e) => onUpdate({ gps: { lat: stop.gps?.lat ?? 0, lng: stop.gps?.lng ?? 0, radius: +e.target.value } })} /></label>
          </div>
          <TransferEditor transfers={stop.transfers ?? []} onChange={(transfers) => onUpdate({ transfers })} />
        </div>
      )}
    </div>
  );
}

function TransferEditor({ transfers, onChange }: { transfers: Transfer[]; onChange: (t: Transfer[]) => void }) {
  const add = () =>
    onChange([...transfers, { type: "metro", operator: { zh: "", en: "", ja: "" }, station: { zh: "", en: "", ja: "" } }]);
  const set = (i: number, patch: Partial<Transfer>) => onChange(transfers.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  return (
    <div className="transfer-editor">
      <div className="te-head"><strong>轉乘</strong><button onClick={add}>＋ 加轉乘</button></div>
      {transfers.map((t, i) => (
        <div key={i} className="te-row">
          <select value={t.type} onChange={(e) => set(i, { type: e.target.value as TransferType })}>
            {TRANSFER_TYPES.map((tt) => <option key={tt} value={tt}>{tt}</option>)}
          </select>
          <input placeholder="業者（中）" value={t.operator.zh} onChange={(e) => set(i, { operator: { ...t.operator, zh: e.target.value } })} />
          <input placeholder="Operator (en)" value={t.operator.en} onChange={(e) => set(i, { operator: { ...t.operator, en: e.target.value } })} />
          <input placeholder="事業者（日）" value={t.operator.ja} onChange={(e) => set(i, { operator: { ...t.operator, ja: e.target.value } })} />
          <input placeholder="車站（中）" value={t.station?.zh ?? ""} onChange={(e) => set(i, { station: { zh: e.target.value, en: t.station?.en ?? "", ja: t.station?.ja ?? "" } })} />
          <button className="icon danger" onClick={() => onChange(transfers.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
    </div>
  );
}
