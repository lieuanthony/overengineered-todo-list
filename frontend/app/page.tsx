"use client";

import Link from "next/link";
import { useTheme } from "@mui/material/styles";

export default function Home() {
  const theme = useTheme();
  const bg = theme.palette.background.default;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const accent = theme.palette.primary.main;

  return (
    <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: text, fontFamily: "inherit", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "0 20px" }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>Hi, welcome to <span style={{ color: accent }}>todo</span>.</p>
        <p style={{ margin: 0, maxWidth: 480, color: muted, fontSize: 14, lineHeight: 1.7 }}>
          A simple place to capture your tasks, track your progress, and get things done.
        </p>
      </div>
    </main>
  );
}