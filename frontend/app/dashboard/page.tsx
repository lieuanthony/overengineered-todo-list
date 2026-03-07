"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import DatePicker from "../components/DatePicker";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
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
  const [todos, setTodos] = useState<Todo[]>([]);
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

  const token = () => localStorage.getItem("accessToken");
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

  useEffect(() => {
    if (!token()) { router.push("/login"); return; }
    fetchTodos();
  }, []);

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
    padding: "10px 14px", fontSize: 13, borderRadius: 8,
    border: `1px solid ${border}`, background: bg, color: text,
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  };

  const chipBtn = (active: boolean, onClick: () => void, label: string) => (
    <button onClick={onClick} style={{
      padding: "5px 12px", fontSize: 12, borderRadius: 6, fontFamily: "inherit",
      border: `1px solid ${active ? accent : border}`,
      background: active ? accent : "transparent",
      color: active ? "#fff" : muted,
      cursor: "pointer", transition: "all 0.15s",
    }}>{label}</button>
  );

  const iconBtn = (onClick: () => void, title: string, hoverColor: string, icon: React.ReactNode) => (
    <button onClick={onClick} title={title} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 4, display: "flex", alignItems: "center", borderRadius: 4, transition: "color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
      onMouseLeave={e => (e.currentTarget.style.color = muted)}
    >{icon}</button>
  );

  if (loading) return (
    <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: muted, fontFamily: "inherit", fontSize: 13 }}>
      Loading...
    </main>
  );

  return (
    <main style={{ flex: 1, background: bg, color: text, fontFamily: "inherit", padding: "40px 24px", display: "flex", justifyContent: "center", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 18 }}>My todos</p>
          <p style={{ margin: 0, fontSize: 13, color: muted }}>{todos.filter(t => !t.completed).length} remaining</p>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add a new todo..."
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => e.currentTarget.style.borderColor = accent}
              onBlur={e => e.currentTarget.style.borderColor = border}
            />
            <button type="submit" disabled={!newTitle.trim()} className="btn-primary"
              style={{ padding: "10px 18px", fontSize: 13, fontWeight: 500, background: accent, color: "#fff", border: "none", borderRadius: 8, cursor: newTitle.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: newTitle.trim() ? 1 : 0.5, flexShrink: 0 }}
            >Add</button>
          </div>
          <DatePicker value={newDueDate} onChange={setNewDueDate} placeholder="Set due date" />
        </form>

        {/* Filter + sort controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {chipBtn(filter === "all", () => setFilter("all"), "All")}
            {chipBtn(filter === "active", () => setFilter("active"), "Active")}
            {chipBtn(filter === "completed", () => setFilter("completed"), "Completed")}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {chipBtn(sort === "created", () => setSort("created"), "Newest")}
            {chipBtn(sort === "updated", () => setSort("updated"), "Recently updated")}
            {chipBtn(sort === "due", () => setSort("due"), "Due date")}
          </div>
        </div>

        {error && <p style={{ margin: "0 0 12px", fontSize: 12, color: "#e53e3e" }}>{error}</p>}

        {/* Todo list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: muted, fontSize: 13, background: paper }}>
              {filter === "completed" ? "No completed todos yet." : filter === "active" ? "No active todos. All done!" : "No todos yet. Add one above."}
            </div>
          ) : filtered.map((todo, i) => {
            const overdue = todo.dueDate && isOverdue(todo.dueDate, todo.completed);
            return (
              <div key={todo.id}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: paper, borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = bg)}
                onMouseLeave={e => (e.currentTarget.style.background = paper)}
              >
                {/* Checkbox */}
                <button onClick={() => handleToggle(todo)} style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                  border: `1.5px solid ${todo.completed ? accent : border}`,
                  background: todo.completed ? accent : "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", padding: 0,
                }}>
                  {todo.completed && (
                    <svg width="9" height="9" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === todo.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input ref={editInputRef} value={editingTitle} onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleEditSave(todo.id); if (e.key === "Escape") setEditingId(null); }}
                        style={{ ...inputStyle, padding: "4px 8px", fontSize: 13 }}
                        onFocus={e => e.currentTarget.style.borderColor = accent}
                        onBlur={e => e.currentTarget.style.borderColor = border}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <DatePicker value={editingDueDate} onChange={setEditingDueDate} placeholder="Set due date" />
                        <button onClick={() => handleEditSave(todo.id)} style={{ fontSize: 12, color: accent, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ fontSize: 12, color: muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 13, color: todo.completed ? muted : text, textDecoration: todo.completed ? "line-through" : "none", wordBreak: "break-word" }}
                        onDoubleClick={() => { setEditingId(todo.id); setEditingTitle(todo.title); setEditingDueDate(todo.dueDate ? todo.dueDate.slice(0, 10) : ""); }}
                        title="Double-click to edit"
                      >{todo.title}</span>
                      {todo.dueDate && (
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: overdue ? "#e53e3e" : muted }}>
                          {overdue ? "Overdue · " : ""}{formatDate(todo.dueDate)}
                        </p>
                      )}
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: muted }}>
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
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    )}
                    {iconBtn(() => handleDelete(todo.id), "Delete", "#e53e3e",
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </div>

        {todos.length > 0 && (
          <p style={{ margin: "12px 0 0", fontSize: 12, color: muted, textAlign: "right" }}>
            {todos.filter(t => t.completed).length} of {todos.length} completed
          </p>
        )}
      </div>
    </main>
  );
}