"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const { setAccessToken } = useAuth();
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
  const accent = theme.palette.primary.main;

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 13, borderRadius: 8,
    border: `1px solid ${border}`, background: bg, color: text,
    outline: "none", boxSizing: "border-box" as const,
    fontFamily: "inherit", transition: "border-color 0.2s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = accent; };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = border; };

  const passwordRules = [
    { label: "At least 8 characters",  pass: password.length >= 8 },
    { label: "One uppercase letter",    pass: /[A-Z]/.test(password) },
    { label: "One lowercase letter",    pass: /[a-z]/.test(password) },
    { label: "One number",              pass: /[0-9]/.test(password) },
    { label: "One special character",   pass: /[^A-Za-z0-9]/.test(password) },
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
      setAccessToken(data.accessToken);
      router.push("/dashboard");
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: text, fontFamily: "inherit", padding: "0 20px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 18 }}>Create an account</p>
          <p style={{ margin: 0, fontSize: 13, color: muted }}>Get started for free.</p>
        </div>

        <div style={{ background: paper, border: `1px solid ${border}`, borderRadius: 12, padding: "24px" }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: text, fontFamily: "inherit" }}>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="John Doe" style={inputStyle} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: text, fontFamily: "inherit" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="you@example.com" style={inputStyle} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: text, fontFamily: "inherit" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: 12, top: password.length > 0 ? "28%" : "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, padding: 2, display: "flex", alignItems: "center", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = text)}
                  onMouseLeave={e => (e.currentTarget.style.color = muted)}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {password.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                  {passwordRules.map(rule => (
                    <div key={rule.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 13, height: 13, borderRadius: "50%", flexShrink: 0,
                        background: rule.pass ? accent : "transparent",
                        border: `1.5px solid ${rule.pass ? accent : border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.2s, border-color 0.2s",
                      }}>
                        {rule.pass && (
                          <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span style={{ fontSize: 12, color: rule.pass ? accent : muted, fontFamily: "inherit", transition: "color 0.2s" }}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p style={{ margin: 0, fontSize: 12, color: "#e53e3e", fontFamily: "inherit" }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 2, padding: "10px", fontSize: 13, fontWeight: 500, color: "#fff", background: loading ? muted : accent, border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", width: "100%" }}>
              {loading ? "Creating account..." : "Create account"}
            </button>
            <p style={{ margin: 0, fontSize: 12, color: muted, textAlign: "center", fontFamily: "inherit" }}>
              Already have an account?{" "}
              <a href="/login" className="link-underline" style={{ color: accent, textDecoration: "none" }}>Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}