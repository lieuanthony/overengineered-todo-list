'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { useAuth } from './providers/AuthProvider';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { accessToken, ready } = useAuth();

  const bg = theme.palette.background.default;
  const text = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;
  const border = theme.palette.divider;
  const accent = theme.palette.primary.main;

  useEffect(() => {
    if (ready && accessToken) router.replace('/dashboard');
  }, [ready, accessToken]);

  if (!ready)
    return (
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
        }}
      />
    );

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color: text,
        fontFamily: 'inherit',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          textAlign: 'center',
          padding: '0 20px',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>
          Hi, welcome to <span style={{ color: accent }}>todo</span>.
        </p>
        <p style={{ margin: 0, maxWidth: 480, color: muted, fontSize: 14, lineHeight: 1.7 }}>
          A simple place to capture your tasks, track your progress, and get things done.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Link
            href="/register"
            className="btn-primary"
            style={{
              fontSize: 13,
              fontWeight: 500,
              background: accent,
              color: '#fff',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontFamily: 'inherit',
            }}
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              fontSize: 13,
              fontWeight: 500,
              background: 'transparent',
              color: text,
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${border}`,
              fontFamily: 'inherit',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
