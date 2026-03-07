"use client";

import { useTheme } from "@mui/material/styles";

interface FooterProps {
  centered?: boolean;
}

export default function Footer({ centered = false }: FooterProps) {
  const theme = useTheme();
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;

  return (
    <footer style={{
      display: "flex",
      justifyContent: centered ? "center" : "space-between",
      alignItems: "center",
      padding: "20px 64px",
      borderTop: `1px solid ${border}`,
    }}>
      <span style={{ fontSize: 11, color: muted, fontFamily: "system-ui, sans-serif" }}>
        © {new Date().getFullYear()} Todo
      </span>
      {!centered && (
        <span style={{ fontSize: 11, color: muted, fontFamily: "system-ui, sans-serif" }}>
          Simple by design.
        </span>
      )}
    </footer>
  );
}