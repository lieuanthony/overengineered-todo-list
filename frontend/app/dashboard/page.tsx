"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import DatePicker from "../components/DatePicker";
import Heatmap from "../components/Heatmap";
import { useAuth } from "../providers/AuthProvider";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

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

type Filter = "all" | "active" | "completed";
type Sort = "created" | "due" | "updated";

const API = process.env.NEXT_PUBLIC_API_URL;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today at ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined }) + ` at ${time}`;
};

const isOverdue = (iso: string, completed: boolean) => {
  if (completed) return false;
  return new Date(iso) < new Date(new Date().setHours(0, 0, 0, 0));
};

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { accessToken, refresh, logout, ready } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("created");
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const accent = theme.palette.primary.main;

  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` });

  useEffect(() => {
    if (!ready) return;
    if (!accessToken) { router.push("/login"); return; }
    fetchTodos();
    fetchProfile();
  }, [ready, accessToken]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API}/api/todos`, { headers: authHeaders() });
      if (res.status === 401) { router.push("/login"); return; }
      setTodos(await res.json());
    } catch {
      setError("Failed to load todos");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/api/users/me`, { headers: authHeaders() });
      if (res.ok) setProfile(await res.json());
    } catch { /* non-critical */ }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`${API}/api/todos`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ title: newTitle.trim(), dueDate: newDueDate || undefined }),
      });
      const todo = await res.json();
      setTodos(prev => [todo, ...prev]);
      setNewTitle("");
      setNewDueDate("");
    } catch { setError("Failed to create todo"); }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const res = await fetch(`${API}/api/todos/${todo.id}`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const updated = await res.json();
      setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch { setError("Failed to update todo"); }
  };

  const handleEditSave = async (id: string) => {
    if (!editingTitle.trim()) { setEditingId(null); return; }
    try {
      const res = await fetch(`${API}/api/todos/${id}`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ title: editingTitle.trim(), dueDate: editingDueDate || null }),
      });
      const updated = await res.json();
      setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch { setError("Failed to update todo"); }
    finally { setEditingId(null); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/api/todos/${id}`, { method: "DELETE", headers: authHeaders() });
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch { setError("Failed to delete todo"); }
  };

  const sorted = [...todos].sort((a, b) => {
    if (sort === "due") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sort === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filtered = sorted.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const inputStyle = {
    padding: "12px 16px", fontSize: 15, borderRadius: 8,
    border: `1px solid ${border}`, background: bg, color: text,
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  };

  const iconBtn = (onClick: () => void, title: string, hoverColor: string, icon: React.ReactNode) => (
    <button onClick={onClick} title={title} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 6, display: "flex", alignItems: "center", borderRadius: 4, transition: "color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
      onMouseLeave={e => (e.currentTarget.style.color = muted)}
    >{icon}</button>
  );

  if (!ready) return (
    <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: muted, fontFamily: "inherit", fontSize: 15 }}>
      Loading...
    </main>
  );

  if (loading) return (
    <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: muted, fontFamily: "inherit", fontSize: 15 }}>
      Loading...
    </main>
  );

  const completed = todos.filter(t => t.completed).length;
  const total = todos.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const allDone = total > 0 && completed === total;

  return (
    <main style={{ flex: 1, background: bg, color: text, fontFamily: "inherit", padding: "48px 32px", display: "flex", justifyContent: "center", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", gap: 32, alignItems: "flex-start" }}>

        {/* ── Todos column ── */}
        <div style={{ flex: 1, minWidth: 0 }}>



        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 24 }}>

          {/* Circular ring */}
          {total > 0 && (() => {
            const size = 80;
            const strokeWidth = 6;
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (pct / 100) * circumference;
            return (
              <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                  {/* Track */}
                  <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={border} strokeWidth={strokeWidth} />
                  {/* Progress */}
                  <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={accent}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease", opacity: allDone ? 1 : 0.8 }}
                  />
                </svg>
                {/* Center label */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: allDone ? accent : text, lineHeight: 1, fontFamily: "inherit" }}>{pct}%</span>
                </div>
              </div>
            );
          })()}

          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 22 }}>My todos</p>
            <p style={{ margin: 0, fontSize: 14, color: allDone ? accent : muted, fontWeight: allDone ? 600 : 400, transition: "color 0.3s" }}>
              {allDone ? "All done! Great work 🎉" : `${todos.filter(t => !t.completed).length} remaining`}
            </p>
            {total > 0 && !allDone && (
              <p style={{ margin: "2px 0 0", fontSize: 12, color: muted }}>{completed} of {total} completed</p>
            )}
          </div>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add a new todo..."
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => e.currentTarget.style.borderColor = accent}
              onBlur={e => e.currentTarget.style.borderColor = border}
            />
            <button type="submit" disabled={!newTitle.trim()} className="btn-primary"
              style={{ padding: "12px 22px", fontSize: 15, fontWeight: 500, background: accent, color: "#fff", border: "none", borderRadius: 8, cursor: newTitle.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: newTitle.trim() ? 1 : 0.5, flexShrink: 0 }}
            >Add</button>
          </div>
          <DatePicker value={newDueDate} onChange={setNewDueDate} placeholder="Set due date" />
        </form>

        {/* Filter + sort controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <select value={filter} onChange={e => setFilter(e.target.value as Filter)} style={{ ...inputStyle, padding: "6px 12px", fontSize: 13, cursor: "pointer", width: "auto" }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value as Sort)} style={{ ...inputStyle, padding: "6px 12px", fontSize: 13, cursor: "pointer", width: "auto" }}>
            <option value="created">Newest</option>
            <option value="updated">Recently updated</option>
            <option value="due">Due date</option>
          </select>
        </div>

        {error && <p style={{ margin: "0 0 14px", fontSize: 14, color: "#e53e3e" }}>{error}</p>}

        {/* Todo list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div key="empty" style={{ padding: "32px", textAlign: "center", color: muted, fontSize: 14, background: paper }}>
              {filter === "completed" ? "No completed todos yet." : filter === "active" ? "No active todos. All done!" : "No todos yet. Add one above."}
            </div>
          ) : filtered.map((todo, i) => {
            const overdue = todo.dueDate && isOverdue(todo.dueDate, todo.completed);
            return (
              <div key={todo.id}
                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 20px", background: paper, borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = bg)}
                onMouseLeave={e => (e.currentTarget.style.background = paper)}
              >
                {/* Checkbox */}
                <button onClick={() => handleToggle(todo)} style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                  border: `1.5px solid ${todo.completed ? accent : border}`,
                  background: todo.completed ? accent : "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", padding: 0,
                }}>
                  {todo.completed && (
                    <svg width="11" height="11" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === todo.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input ref={editInputRef} value={editingTitle} onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleEditSave(todo.id); if (e.key === "Escape") setEditingId(null); }}
                        style={{ ...inputStyle, padding: "6px 10px", fontSize: 15 }}
                        onFocus={e => e.currentTarget.style.borderColor = accent}
                        onBlur={e => e.currentTarget.style.borderColor = border}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <DatePicker value={editingDueDate} onChange={setEditingDueDate} placeholder="Set due date" />
                        <button onClick={() => handleEditSave(todo.id)} style={{ fontSize: 13, color: accent, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ fontSize: 13, color: muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 15, color: todo.completed ? muted : text, textDecoration: todo.completed ? "line-through" : "none", wordBreak: "break-word" }}
                        onDoubleClick={() => { setEditingId(todo.id); setEditingTitle(todo.title); setEditingDueDate(todo.dueDate ? todo.dueDate.slice(0, 10) : ""); }}
                        title="Double-click to edit"
                      >{todo.title}</span>
                      {todo.dueDate && (
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: overdue ? "#e53e3e" : muted }}>
                          {overdue ? "Overdue · " : ""}{formatDate(todo.dueDate)}
                        </p>
                      )}
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: muted }}>
                        Created {formatDateTime(todo.createdAt)}
                        {todo.updatedAt !== todo.createdAt && ` · Updated ${formatDateTime(todo.updatedAt)}`}
                      </p>
                    </>
                  )}
                </div>

                {/* Actions */}
                {editingId !== todo.id && (
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                    {iconBtn(() => { setEditingId(todo.id); setEditingTitle(todo.title); setEditingDueDate(todo.dueDate ? todo.dueDate.slice(0, 10) : ""); }, "Edit", text,
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    )}
                    {iconBtn(() => handleDelete(todo.id), "Delete", "#e53e3e",
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>{/* end todo list */}

        </div>{/* end todos column */}

        {/* ── Profile panel ── */}
        <div style={{ width: 260, flexShrink: 0, position: "sticky", top: 48 }}>

          {/* Avatar + name */}
          <div style={{ background: paper, border: `1px solid ${border}`, borderRadius: 12, padding: "24px 20px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                  {profile?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.name ?? "—"}</p>
                <p style={{ margin: 0, fontSize: 12, color: muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.email ?? "—"}</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Total", value: profile?.stats.total ?? "—" },
                { label: "Done", value: profile?.stats.completed ?? "—" },
                { label: "Rate", value: profile ? `${profile.stats.completionRate}%` : "—" },
                { label: "Streak", value: profile ? `${profile.stats.streak}d` : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: bg, borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: muted, marginBottom: 2 }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{value}</p>
                </div>
              ))}
            </div>

            <p style={{ margin: 0, fontSize: 11, color: muted }}>
              Member since {profile ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
            </p>
          </div>

          {/* Heatmap */}
          <div style={{ background: paper, border: `1px solid ${border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12, overflow: "hidden" }}>
            <Heatmap data={profile?.heatmap ?? {}} accent={accent} border={border} muted={muted} bg={bg} />
          </div>

        </div>

      </div>
    </main>
  );
}