"use client";

import { useState } from "react";

export default function Heatmap({ data, accent, border, muted }: { data: Record<string, number>; accent: string; border: string; muted: string; bg: string }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; cx: number; cy: number } | null>(null);

  const DAYS = 7;
  const CELL = 4;
  const GAP = 1;

  const startDate = new Date(selectedYear, 0, 1);
  const startDay = startDate.getDay(); // 0=Sun
  const cells: ({ date: string; count: number } | null)[] = Array(startDay).fill(null);
  const endDate = new Date(selectedYear, 11, 31);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: data[key] ?? 0 });
  }
  while (cells.length % DAYS !== 0) cells.push(null);

  const WEEKS = cells.length / DAYS;
  const columns: ({ date: string; count: number } | null)[][] = [];
  for (let w = 0; w < WEEKS; w++) columns.push(cells.slice(w * DAYS, w * DAYS + DAYS));

  const max = Math.max(1, ...Object.values(data).filter(Boolean));
  const getColor = (count: number) => {
    if (count === 0) return border;
    const intensity = Math.ceil((count / max) * 4);
    const alphas = ["40", "70", "a0", "d0"];
    return accent + (alphas[Math.min(intensity - 1, 3)] ?? "d0");
  };

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  columns.forEach((week, wi) => {
    const firstReal = week.find(c => c !== null);
    if (firstReal) {
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: new Date(firstReal.date).toLocaleDateString("en-US", { month: "short" }), col: wi });
        lastMonth = m;
      }
    }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Completions</p>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          style={{ fontSize: 11, color: muted, background: "transparent", border: `1px solid ${border}`, borderRadius: 4, padding: "2px 6px", fontFamily: "inherit", cursor: "pointer" }}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ overflowX: "auto", overflowY: "visible" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", gap: 0 }}>
          {/* Month label row */}
          <div style={{ display: "flex", gap: GAP, marginBottom: 3 }}>
            {columns.map((_, wi) => {
              const lbl = monthLabels.find(m => m.col === wi);
              return (
                <div key={wi} style={{ width: CELL, flexShrink: 0, fontSize: 8, color: muted, whiteSpace: "nowrap", overflow: "visible" }}>
                  {lbl?.label ?? ""}
                </div>
              );
            })}
          </div>
          {/* Day columns */}
          <div style={{ display: "flex", gap: GAP }}>
            {columns.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    style={{ width: CELL, height: CELL, borderRadius: 1, flexShrink: 0, background: cell ? getColor(cell.count) : "transparent" }}
                    onMouseEnter={cell ? e => setTooltip({ date: cell.date, count: cell.count, cx: e.clientX, cy: e.clientY }) : undefined}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
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