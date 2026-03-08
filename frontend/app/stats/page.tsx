"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../providers/AuthProvider";
import Heatmap from "../components/Heatmap";

type Profile = {
  name: string;
  email: string;
  createdAt: string;
  stats: {
    total: number;
    completed: number;
    completionRate: number;
    streak: number;
  };
  heatmap: Record<string, number>;
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function StatsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { accessToken, refresh, ready } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const accent = theme.palette.primary.main;

  useEffect(() => {
    if (!ready) return;
    if (!accessToken) { router.replace("/login"); return; }

    const load = async () => {
      let token: string | null = accessToken;
      let res = await fetch(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        token = await refresh();
        if (!token) { router.replace("/login"); return; }
        res = await fetch(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (res.ok) setProfile(await res.json());
      setLoading(false);
    };

    load();
  }, [ready, accessToken]);

  if (!ready || loading) return (
    <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: muted, fontFamily: "inherit", fontSize: 15 }}>
      Loading...
    </main>
  );

  const stats = [
    { label: "Total todos", value: profile?.stats.total ?? "—" },
    { label: "Completed", value: profile?.stats.completed ?? "—" },
    { label: "Completion rate", value: profile ? `${profile.stats.completionRate}%` : "—" },
    { label: "Current streak", value: profile ? `${profile.stats.streak}d` : "—" },
  ];

  return (
    <main style={{ flex: 1, background: bg, color: text, fontFamily: "inherit", padding: "48px 32px", display: "flex", justifyContent: "center", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 720 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 22 }}>Stats</p>
          <p style={{ margin: 0, fontSize: 14, color: muted }}>
            Member since {profile ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {stats.map(({ label, value }) => (
            <div key={label} style={{ background: paper, border: `1px solid ${border}`, borderRadius: 12, padding: "20px 20px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: muted }}>{label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div style={{ background: paper, border: `1px solid ${border}`, borderRadius: 12, padding: "20px 24px" }}>
          <Heatmap data={profile?.heatmap ?? {}} accent={accent} border={border} muted={muted} bg={bg} />
        </div>

      </div>
    </main>
  );
}