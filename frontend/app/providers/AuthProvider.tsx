'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refresh: () => Promise<string | null>;
  logout: () => Promise<void>;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  refresh: async () => null,
  logout: async () => {},
  ready: false,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setAccessToken(null);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setAccessToken(null);
    }
  }, []);

  // On every mount (new tab, refresh), silently restore session via httpOnly cookie
  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, refresh, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
