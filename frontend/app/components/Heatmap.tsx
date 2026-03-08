"use client";

import { useState, useRef, useEffect } from "react";

export default function Heatmap({ data, accent, border, muted }: { data: Record<string, number>; accent: string; border: string; muted: string; bg: string }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; cx: number; cy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(11);

  const DAYS = 7;
  const GAP = 2;

  // Build grid — no weekday padding, Jan 1 → Dec 31
  const cells: { date: string; count: number }[] = [];
  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: data[key] ?? 0 });
  }
  while (cells.length % DAYS !== 0) cells.push({ date: "", count: -1 });

  const WEEKS = cells.length / DAYS;
  const columns: { date: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) columns.push(cells.slice(w * DAYS, w * DAYS + DAYS));

  // Compute cell size to exactly fit the container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      // width = WEEKS * cell + (WEEKS - 1) * gap → cell = (width - (WEEKS-1)*gap) / WEEKS
      const computed = Math.floor((width - (WEEKS - 1) * GAP) / WEEKS);
      setCellSize(Math.max(4, computed));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [WEEKS]);

  const max = Math.max(1, ...Object.values(data).filter(Boolean));
  const getColor = (count: number) => {
    if (count <= 0) return border;
    // More completions = more opaque (solid), fewer = more transparent
    const intensity = count / max; // 0..1
    const alpha = Math.round((0.2 + intensity * 0.8) * 255).toString(16).padStart(2, "0");
    return accent + alpha;
  };

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  columns.forEach((week, wi) => {
    const firstReal = week.find(c => c.count >= 0);
    if (firstReal) {
      const m = new Date(firstReal.date + "T12:00:00").getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: new Date(firstReal.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" }), col: wi });
        lastMonth = m;
      }
    }
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Activity</p>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          style={{ fontSize: 12, color: muted, background: "transparent", border: `1px solid ${border}`, borderRadius: 4, padding: "2px 8px", fontFamily: "inherit", cursor: "pointer" }}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div ref={containerRef}>
        {/* Month labels */}
        <div style={{ display: "flex", gap: GAP, marginBottom: 4 }}>
          {columns.map((_, wi) => {
            const lbl = monthLabels.find(m => m.col === wi);
            return (
              <div key={wi} style={{ width: cellSize, flexShrink: 0, fontSize: 9, color: muted, whiteSpace: "nowrap", overflow: "visible" }}>
                {lbl?.label ?? ""}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ display: "flex", gap: GAP }}>
          {columns.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {week.map((cell, di) => (
                <div
                  key={di}
                  style={{
                    width: cellSize, height: cellSize, borderRadius: 2, flexShrink: 0,
                    background: cell.count >= 0 ? getColor(cell.count) : "transparent",
                  }}
                  onMouseEnter={cell.count >= 0 ? e => setTooltip({ date: cell.date, count: cell.count, cx: e.clientX, cy: e.clientY }) : undefined}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {tooltip && tooltip.count > 0 && (
        <div style={{
          position: "fixed", pointerEvents: "none", zIndex: 1000,
          left: tooltip.cx + 12, top: tooltip.cy - 32,
          background: "#1a1a1a", color: "#fff", fontSize: 11, padding: "4px 8px", borderRadius: 4, whiteSpace: "nowrap",
        }}>
          {tooltip.count} completion{tooltip.count !== 1 ? "s" : ""} · {new Date(tooltip.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      )}
    </div>
  );
}