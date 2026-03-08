'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../providers/AuthProvider';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const router = useRouter();
  const theme = useTheme();
  const { accessToken, ready } = useAuth();

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const accent = theme.palette.primary.main;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  });

  useEffect(() => {
    if (!ready) return;
    if (!accessToken) {
      router.push('/login');
      return;
    }
    fetch(`${API}/api/users/me`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setName(data.name);
        setEmail(data.email);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [ready, accessToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess(true);
    } catch {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: 15,
    borderRadius: 8,
    border: `1px solid ${border}`,
    background: bg,
    color: text,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  };

  if (!ready || loading)
    return (
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          color: muted,
          fontFamily: 'inherit',
          fontSize: 15,
        }}
      >
        Loading...
      </main>
    );

  return (
    <main
      style={{
        flex: 1,
        background: bg,
        color: text,
        fontFamily: 'inherit',
        padding: '48px 32px',
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 22 }}>Edit profile</p>
          <p style={{ margin: 0, fontSize: 14, color: muted }}>Update your account information</p>
        </div>

        <form
          onSubmit={handleSave}
          style={{
            background: paper,
            border: `1px solid ${border}`,
            borderRadius: 12,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 13, color: muted, marginBottom: 6 }}>
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = border)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: muted, marginBottom: 6 }}>
              Email
            </label>
            <input
              value={email}
              disabled
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
            <p style={{ margin: '4px 0 0', fontSize: 12, color: muted }}>Email cannot be changed</p>
          </div>

          {error && <p style={{ margin: 0, fontSize: 13, color: '#e53e3e' }}>{error}</p>}
          {success && (
            <p style={{ margin: 0, fontSize: 13, color: accent }}>Profile updated successfully</p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '10px 18px',
                fontSize: 14,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: 'transparent',
                color: muted,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="btn-primary"
              style={{
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 500,
                background: accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
