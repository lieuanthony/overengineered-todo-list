"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../providers/ThemeProvider";
import { ACCENT } from "../constants";

export default function Navbar() {
  const theme = useTheme();
  const { setMode, resolvedMode } = useThemeMode();
  const pathname = usePathname();

  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const bg = theme.palette.background.default;

  const renderLinks = () => {
    if (pathname === "/login") {
      return (
        <span style={{ fontSize: 13, color: muted, fontFamily: "system-ui, sans-serif" }}>
          No account?{" "}
          <Link href="/register" className="link-underline" style={{ color: ACCENT, textDecoration: "none", fontWeight: 500 }}>Sign up</Link>
        </span>
      );
    }
    if (pathname === "/register") {
      return (
        <span style={{ fontSize: 13, color: muted, fontFamily: "system-ui, sans-serif" }}>
          Have an account?{" "}
          <Link href="/login" className="link-underline" style={{ color: ACCENT, textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
        </span>
      );
    }
    if (pathname === "/") {
      return (
        <>
          <Link href="/login" className="link-underline" style={{ fontSize: 13, color: muted, textDecoration: "none", fontFamily: "system-ui, sans-serif" }}>Sign in</Link>
          <Link href="/register" className="btn-primary" style={{ fontSize: 13, background: text, color: bg, textDecoration: "none", padding: "8px 18px", fontFamily: "system-ui, sans-serif" }}>Get started</Link>
        </>
      );
    }
    return null;
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 64px", borderBottom: `1px solid ${border}`, position: "relative", zIndex: 10 }}>
      <Link href="/" className="nav-logo" style={{ fontSize: 15, fontWeight: 600, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.3px", color: text, textDecoration: "none" }}>
        Todo
      </Link>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <IconButton onClick={() => setMode(resolvedMode === "light" ? "dark" : "light")} size="small" style={{ color: muted }}>
          {resolvedMode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
        {renderLinks()}
      </div>
    </nav>
  );
}