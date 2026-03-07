"use client";

import { useTheme } from "@mui/material/styles";

export default function Footer() {
  const theme = useTheme();
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const bg = theme.palette.background.default;

  return (
    <footer style={{ display: "flex", justifyContent: "center", padding: "20px 48px", borderTop: `1px solid ${border}`, background: bg }}>
      <span style={{ fontSize: 12, color: muted, fontFamily: "system-ui, sans-serif" }}>
        © {new Date().getFullYear()} Todo
      </span>
    </footer>
  );
}