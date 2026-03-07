"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../providers/ThemeProvider";

export default function Navbar() {
  const theme = useTheme();
  const { setMode, resolvedMode } = useThemeMode();
  const pathname = usePathname();

  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const bg = theme.palette.background.default;
  const accent = theme.palette.primary.main;

  const renderLinks = () => {
    if (pathname === "/login") return null;
    if (pathname === "/register") return null;
    if (pathname === "/") return null;
    if (pathname === "/dashboard") return (
      <button
        className="link-underline"
        onClick={() => {
          localStorage.removeItem("accessToken");
          window.location.href = "/";
        }}
        style={{ fontSize: 13, color: muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
      >
        Sign out
      </button>
    );
    return null;
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${border}`, background: bg }}>
      {pathname === "/dashboard"
        ? <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "inherit", color: accent }}>todo</span>
        : <Link href="/" style={{ fontSize: 15, fontWeight: 600, fontFamily: "inherit", color: accent, textDecoration: "none" }}>todo</Link>
      }
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <IconButton onClick={() => setMode(resolvedMode === "light" ? "dark" : "light")} size="small" style={{ color: muted }}>
          {resolvedMode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
        {renderLinks()}
      </div>
    </nav>
  );
}