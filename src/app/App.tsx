import { useEffect, useState } from "react";
import type { RouteFile } from "../types";
import { loadRoute, saveRoute } from "../data/storage";
import { Editor } from "../editor/Editor";
import { Player } from "../player/Player";

type View = "editor" | "player";

function viewFromHash(): View {
  return location.hash.replace("#/", "") === "player" ? "player" : "editor";
}

export function App() {
  const [route, setRoute] = useState<RouteFile>(() => loadRoute());
  const [view, setView] = useState<View>(viewFromHash);

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (v: View) => {
    location.hash = v === "player" ? "#/player" : "#/editor";
    setView(v);
  };

  const onChange = (r: RouteFile) => {
    setRoute(r);
    saveRoute(r);
  };

  return view === "player" ? (
    <Player route={route} onExit={() => go("editor")} />
  ) : (
    <Editor route={route} onChange={onChange} onPlay={() => go("player")} />
  );
}
