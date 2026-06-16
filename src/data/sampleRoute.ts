import type { RouteFile } from "../types";
import outbound from "./samples/route-307-outbound.json";
import inbound from "./samples/route-307-inbound.json";

// Real-world sample: Taipei Bus route 307 (Banqiao ↔ Zhuangjing Village).
// Chinese & English from the operator; Japanese is a best-effort translation.
export const SAMPLE_ROUTES: { label: string; route: RouteFile }[] = [
  { label: "307 去程（板橋→莊敬里）", route: outbound as RouteFile },
  { label: "307 返程（莊敬里→板橋）", route: inbound as RouteFile },
];

export const SAMPLE_ROUTE: RouteFile = outbound as RouteFile;
