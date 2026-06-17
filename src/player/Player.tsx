import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RouteFile } from "../types";
import { themeToCssVars } from "../data/themes";
import {
  announceNextStop,
  announceRouteStart,
  availableLanguages,
  cancel,
  ttsSupported,
} from "../tts/engine";
import { unlockAudio } from "../tts/chime";
import { useFullscreen } from "./hooks/useFullscreen";
import { useKeyboard } from "./hooks/useKeyboard";
import { useGeolocation } from "./hooks/useGeolocation";
import { NextStop } from "./pages/NextStop";
import { StopList } from "./pages/StopList";
import { Transfer } from "./pages/Transfer";

type Page = "nextStop" | "stopList" | "transfer";

export function Player({ route, onExit }: { route: RouteFile; onExit: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(rootRef);

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<"manual" | "gps">("manual");
  const [currentSeq, setCurrentSeq] = useState(route.stops[0]?.seq ?? 1);
  const [page, setPage] = useState<Page>("nextStop");
  const [transferIdx, setTransferIdx] = useState(0);

  const lastSeq = route.stops[route.stops.length - 1]?.seq ?? 1;
  const currentStop = useMemo(
    () => route.stops.find((s) => s.seq === currentSeq) ?? route.stops[0],
    [route.stops, currentSeq],
  );
  const transfers = currentStop?.transfers ?? [];

  // Ordered page sequence for auto-cycling; transfer pages only when present.
  const sequence = useMemo<Array<{ page: Page; transferIdx: number }>>(() => {
    const seq: Array<{ page: Page; transferIdx: number }> = [
      { page: "nextStop", transferIdx: 0 },
      { page: "stopList", transferIdx: 0 },
    ];
    transfers.forEach((_, i) => seq.push({ page: "transfer", transferIdx: i }));
    return seq;
  }, [transfers]);

  const announce = useCallback(
    (arrived = false) => {
      if (currentStop) void announceNextStop(route, currentStop, arrived);
    },
    [route, currentStop],
  );

  const advance = useCallback(() => {
    setCurrentSeq((s) => {
      const ns = Math.min(s + 1, lastSeq);
      return ns;
    });
    setPage("nextStop");
    setTransferIdx(0);
  }, [lastSeq]);

  const prev = useCallback(() => {
    setCurrentSeq((s) => Math.max(s - 1, route.stops[0]?.seq ?? 1));
    setPage("nextStop");
    setTransferIdx(0);
  }, [route.stops]);

  // Announce whenever the upcoming stop changes (after start).
  useEffect(() => {
    if (started) announce(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeq, started]);

  // Auto page cycling.
  useEffect(() => {
    if (!started || paused) return;
    const idx = sequence.findIndex((x) => x.page === page && x.transferIdx === transferIdx);
    const cur = sequence[idx === -1 ? 0 : idx];
    const ms =
      route.settings.cycleSeconds[cur.page === "nextStop" ? "nextStop" : cur.page === "stopList" ? "stopList" : "transfer"] *
      1000;
    const timer = window.setTimeout(() => {
      const nextIdx = (idx + 1) % sequence.length;
      const n = sequence[nextIdx];
      setPage(n.page);
      setTransferIdx(n.transferIdx);
    }, ms);
    return () => window.clearTimeout(timer);
  }, [started, paused, page, transferIdx, sequence, route.settings.cycleSeconds]);

  useGeolocation(started && mode === "gps", route.stops, (seq) => {
    setCurrentSeq(seq);
    setPage("nextStop");
    setTransferIdx(0);
    const stop = route.stops.find((s) => s.seq === seq);
    if (stop) void announceNextStop(route, stop, true);
  });

  useKeyboard({
    onAdvance: advance,
    onPrev: prev,
    onPage: (p) => setPage(p === 1 ? "nextStop" : p === 2 ? "stopList" : "transfer"),
    onReannounce: () => announce(false),
    onRouteStart: () => void announceRouteStart(route),
    onToggleFullscreen: toggleFullscreen,
    onTogglePause: () => setPaused((p) => !p),
    onToggleMode: () => setMode((m) => (m === "manual" ? "gps" : "manual")),
  });

  useEffect(() => () => cancel(), []);

  const cssVars = themeToCssVars(route.theme) as React.CSSProperties;

  const handleStart = () => {
    setStarted(true);
    // First user gesture unlocks audio (TTS + Web Audio chime).
    unlockAudio();
    void announceRouteStart(route).then(() => announce(false));
    void rootRef.current?.requestFullscreen?.().catch(() => {});
  };

  const missing = ttsSupported()
    ? route.settings.languages.filter((l) => !availableLanguages(route.settings.languages).includes(l))
    : route.settings.languages;

  return (
    <div ref={rootRef} className={`player${started ? " playing" : ""}`} style={cssVars}>
      {!started ? (
        <div className="start-gate">
          <h1>{route.route.number}　{route.route.destination.zh}</h1>
          <p>{route.operator.name.zh}</p>
          <button className="start-btn" onClick={handleStart}>
            ▶ 開始播放（解鎖語音並全螢幕）
          </button>
          {!ttsSupported() && <p className="warn">此瀏覽器不支援語音合成，將只顯示畫面。</p>}
          {ttsSupported() && missing.length > 0 && (
            <p className="warn">未偵測到語音：{missing.join(" / ")}（仍會嘗試播放）</p>
          )}
          <p className="hint">空白/→ 到站 · ←上一站 · 1/2/3 切頁 · A 重播 · S 開始告知 · F 全螢幕 · P 暫停 · M GPS</p>
          <button className="link-btn" onClick={onExit}>← 回設定</button>
        </div>
      ) : (
        <>
          {page === "nextStop" && currentStop && <NextStop route={route} stop={currentStop} />}
          {page === "stopList" && <StopList route={route} currentSeq={currentSeq} />}
          {page === "transfer" && transfers[transferIdx] && <Transfer transfer={transfers[transferIdx]} />}
          <div className="player-hud">
            <span>{mode === "gps" ? "GPS" : "手動"}{paused ? " · 暫停" : ""}{isFullscreen ? "" : " · 視窗"}</span>
            <button className="link-btn" onClick={onExit}>← 設定</button>
          </div>
        </>
      )}
    </div>
  );
}
