import type { RouteFile } from "../types";

// All sample routes are JSON files under ./samples/. They are loaded eagerly so
// adding a new file there automatically makes it available in the editor's
// "載入範例" picker — no code change needed.
const modules = import.meta.glob("./samples/*.json", { eager: true }) as Record<string, { default: RouteFile }>;

const all: RouteFile[] = Object.values(modules).map((m) => m.default);

function label(r: RouteFile): string {
  const dir = r.route.direction === "outbound" ? "去程" : "返程";
  return `${r.route.number} ${dir}（→${r.route.destination.zh}）`;
}

export const SAMPLE_ROUTES: { label: string; route: RouteFile }[] = all
  .slice()
  .sort(
    (a, b) =>
      a.route.number.localeCompare(b.route.number, undefined, { numeric: true }) ||
      a.route.direction.localeCompare(b.route.direction),
  )
  .map((r) => ({ label: label(r), route: r }));

export const SAMPLE_ROUTE: RouteFile =
  all.find((r) => r.route.id === "307" && r.route.direction === "outbound") ?? all[0];
