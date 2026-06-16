import type { RouteFile } from "../types";
import { SAMPLE_ROUTE } from "./sampleRoute";

const KEY = "tbid:lastRoute";

export function loadRoute(): RouteFile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(SAMPLE_ROUTE);
    const parsed = JSON.parse(raw) as RouteFile;
    if (parsed?.schemaVersion === 1 && Array.isArray(parsed.stops)) return parsed;
  } catch {
    /* fall through to sample */
  }
  return structuredClone(SAMPLE_ROUTE);
}

export function saveRoute(route: RouteFile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(route));
  } catch {
    /* storage may be full or blocked; ignore for MVP */
  }
}

export function exportRoute(route: RouteFile): void {
  const blob = new Blob([JSON.stringify(route, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `route-${route.route.id || "untitled"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseRouteFile(text: string): RouteFile {
  const parsed = JSON.parse(text) as RouteFile;
  if (parsed?.schemaVersion !== 1 || !Array.isArray(parsed.stops)) {
    throw new Error("不是有效的路線檔（schemaVersion 必須為 1 且含 stops）");
  }
  return parsed;
}
