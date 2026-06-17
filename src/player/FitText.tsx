import { useLayoutEffect, useRef, type ReactNode } from "react";

// Renders text on a single line, shrinking the font size until it fits the
// available width (down to `min`). Recomputes on container resize and whenever
// `recalcKey` changes.
export function FitText({
  children,
  max,
  min = 12,
  className,
  recalcKey,
}: {
  children: ReactNode;
  max: number;
  min?: number;
  className?: string;
  recalcKey?: string | number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = `${max}px`;
      let guard = 0;
      while (el.scrollWidth > el.clientWidth + 1 && guard < 16) {
        const cur = parseFloat(el.style.fontSize);
        const next = Math.max(min, cur * (el.clientWidth / el.scrollWidth) - 0.5);
        if (next >= cur) break;
        el.style.fontSize = `${next}px`;
        guard++;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [recalcKey, max, min]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ whiteSpace: "nowrap", overflow: "hidden", width: "100%", boxSizing: "border-box" }}
    >
      {children}
    </div>
  );
}
