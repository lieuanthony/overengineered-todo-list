"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { ACCENT, NOISE } from "../constants";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 6,
    border: `1px solid ${border}`, background: bg, color: text,
    outline: "none", boxSizing: "border-box" as const,
    fontFamily: "system-ui, sans-serif", transition: "border-color 0.15s",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong"); return; }
      localStorage.setItem("accessToken", data.accessToken);
      router.push("/dashboard");
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: bg, color: text, display: "flex", flexDirection: "column", fontFamily: "'Georgia', serif" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.025, zIndex: 50, backgroundImage: NOISE, backgroundRepeat: "repeat", backgroundSize: "128px" }} />

      <div style={{ minHeight: "calc(100vh - 130px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 24, height: 1, background: ACCENT }} />
              <span style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT, fontFamily: "system-ui, sans-serif" }}>Get started</span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 0.95, letterSpacing: "-0.03em", fontWeight: 400, fontFamily: "'Georgia', serif" }}>
              Create your<br />
              <em style={{ fontStyle: "italic", color: ACCENT }}>free account.</em>
            </h1>
          </div>

          <div style={{ background: paper, border: `1px solid ${border}`, borderRadius: 4, padding: "32px 28px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: muted, fontFamily: "system-ui, sans-serif" }}>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: muted, fontFamily: "system-ui, sans-serif" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: muted, fontFamily: "system-ui, sans-serif" }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>

              {error && (
                <div style={{ fontSize: 13, color: "#C0392B", background: "rgba(192,57,43,0.08)", padding: "10px 14px", borderRadius: 4, fontFamily: "system-ui, sans-serif", borderLeft: "3px solid #C0392B" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: 4, padding: "12px", fontSize: 13, fontWeight: 600, color: "#FFFFFF", background: loading ? muted : ACCENT, border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", fontFamily: "system-ui, sans-serif", letterSpacing: "0.02em", transition: "opacity 0.2s" }}>
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}