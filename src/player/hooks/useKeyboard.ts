import { useEffect } from "react";

export interface KeyHandlers {
  onAdvance: () => void;
  onPrev: () => void;
  onPage: (page: 1 | 2 | 3) => void;
  onReannounce: () => void;
  onRouteStart: () => void;
  onToggleFullscreen: () => void;
  onTogglePause: () => void;
  onToggleMode: () => void;
}

export function useKeyboard(h: KeyHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "ArrowRight":
          e.preventDefault();
          h.onAdvance();
          break;
        case "ArrowLeft":
          h.onPrev();
          break;
        case "1":
          h.onPage(1);
          break;
        case "2":
          h.onPage(2);
          break;
        case "3":
          h.onPage(3);
          break;
        case "a":
        case "A":
          h.onReannounce();
          break;
        case "s":
        case "S":
          h.onRouteStart();
          break;
        case "f":
        case "F":
          h.onToggleFullscreen();
          break;
        case "p":
        case "P":
          h.onTogglePause();
          break;
        case "m":
        case "M":
          h.onToggleMode();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [h]);
}
