"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../providers/ThemeProvider";
import { useAuth } from "../providers/AuthProvider";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const theme = useTheme();
  const { setMode, resolvedMode } = useThemeMode();
  const { logout, ready, accessToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const accent = theme.palette.primary.main;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAuthed = pathname === "/dashboard" || pathname === "/profile";

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    window.location.href = "/";
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

        {isAuthed && (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* Avatar button */}
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                width: 32, height: 32, borderRadius: "50%", background: accent,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: paper, border: `1px solid ${border}`, borderRadius: 8,
                minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 100,
                overflow: "hidden",
              }}>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: "block", padding: "10px 16px", fontSize: 13, color: text, textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Edit profile
                </Link>
                <div style={{ height: 1, background: border }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: "block", width: "100%", padding: "10px 16px", fontSize: 13,
                    color: "#e53e3e", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}