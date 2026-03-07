"use client";

import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import { ACCENT, NOISE } from "./constants";

export default function Home() {
  const theme = useTheme();

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;

  return (
    <main style={{ background: bg, color: text, fontFamily: "'Georgia', serif", overflow: "hidden" }}>
      {/* Noise */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.025, zIndex: 50, backgroundImage: NOISE, backgroundRepeat: "repeat", backgroundSize: "128px" }} />

      {/* Hero */}
      <section style={{ padding: "80px 64px 48px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, fontSize: "clamp(8rem, 20vw, 18rem)", fontWeight: 700, lineHeight: 1, color: text, opacity: 0.03, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em", fontFamily: "'Georgia', serif" }}>
          TODO
        </div>

        <div style={{ maxWidth: 900, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ width: 32, height: 1, background: ACCENT }} />
            <span style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT, fontFamily: "system-ui, sans-serif" }}>Stay on top of everything</span>
          </div>

          <h1 style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.95, letterSpacing: "-0.03em", marginBottom: 32, fontFamily: "'Georgia', serif", fontWeight: 400 }}>
            Your tasks,<br />
            <em style={{ fontStyle: "italic", color: ACCENT }}>beautifully</em><br />
            organized.
          </h1>

          <p style={{ fontSize: 16, color: muted, maxWidth: 400, lineHeight: 1.7, marginBottom: 48, fontFamily: "system-ui, sans-serif" }}>
            A focused space to capture what matters, track your progress, and get things done — without the noise.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 12, background: ACCENT, color: "#FFFFFF", textDecoration: "none", padding: "14px 28px", fontSize: 13, letterSpacing: "0.02em", fontFamily: "system-ui, sans-serif" }}>
              Get started free →
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${border}`, color: text, textDecoration: "none", padding: "14px 28px", fontSize: 13, letterSpacing: "0.02em", fontFamily: "system-ui, sans-serif" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ margin: "0 64px", height: 1, background: border }} />

      {/* Features */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: border }}>
        {[
          { number: "01", title: "Capture instantly", desc: "Add tasks in seconds. No friction, no setup — just type and go." },
          { number: "02", title: "Stay organized", desc: "Keep everything in one place. Mark complete, track progress, stay focused." },
          { number: "03", title: "Private & secure", desc: "Your tasks are yours alone. Secured with modern authentication." },
        ].map((f) => (
          <div
            key={f.number}
            style={{ background: bg, padding: "40px 36px", transition: "background 0.3s", cursor: "default" }}
            onMouseEnter={e => (e.currentTarget.style.background = paper)}
            onMouseLeave={e => (e.currentTarget.style.background = bg)}
          >
            <span style={{ fontSize: 11, letterSpacing: "0.25em", color: ACCENT, display: "block", marginBottom: 20, fontFamily: "system-ui, sans-serif" }}>{f.number}</span>
            <h3 style={{ fontSize: 18, marginBottom: 12, fontFamily: "'Georgia', serif", fontWeight: 400 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: muted, lineHeight: 1.65, fontFamily: "system-ui, sans-serif" }}>{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}