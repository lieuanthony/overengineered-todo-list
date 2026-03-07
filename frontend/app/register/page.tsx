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
  const [showPassword, setShowPassword] = useState(false);

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 6,
    border: `1px solid ${border}`, background: bg, color: text,
    outline: "none", boxSizing: "border-box" as const,
    fontFamily: "system-ui, sans-serif", transition: "border-color 0.2s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = ACCENT;
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = border;
  };

  const passwordRules = [
    { label: "At least 8 characters",   pass: password.length >= 8 },
    { label: "One uppercase letter",     pass: /[A-Z]/.test(password) },
    { label: "One lowercase letter",     pass: /[a-z]/.test(password) },
    { label: "One number",               pass: /[0-9]/.test(password) },
    { label: "One special character",    pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) { setError("Please fill in all fields"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address"); return; }
    if (passwordRules.some(r => !r.pass)) { setError("Password does not meet all requirements"); return; }

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
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: muted, fontFamily: "system-ui, sans-serif" }}>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="John Doe" style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: muted, fontFamily: "system-ui, sans-serif" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: muted, fontFamily: "system-ui, sans-serif" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: "absolute", right: 12, top: password.length > 0 ? "30%" : "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, padding: 2, display: "flex", alignItems: "center", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = text)}
                    onMouseLeave={e => (e.currentTarget.style.color = muted)}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password rules — only show once user starts typing */}
                {password.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                    {passwordRules.map(rule => (
                      <div key={rule.label} style={{ display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s" }}>
                        <span style={{
                          width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                          background: rule.pass ? ACCENT : "transparent",
                          border: `1.5px solid ${rule.pass ? ACCENT : border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "background 0.2s, border-color 0.2s",
                        }}>
                          {rule.pass && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span style={{ fontSize: 12, color: rule.pass ? ACCENT : muted, fontFamily: "system-ui, sans-serif", transition: "color 0.2s" }}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: "#C0392B", background: "rgba(192,57,43,0.08)", padding: "10px 14px", borderRadius: 4, fontFamily: "system-ui, sans-serif", borderLeft: "3px solid #C0392B" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, padding: "12px", fontSize: 13, fontWeight: 600, color: "#FFFFFF", background: loading ? muted : ACCENT, border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", fontFamily: "system-ui, sans-serif", letterSpacing: "0.02em" }}>
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}