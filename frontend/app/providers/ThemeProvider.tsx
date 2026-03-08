'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

type Mode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  resolvedMode: 'light',
});

export const useThemeMode = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('system');
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as Mode | null;
    if (saved) setModeState(saved);
  }, []);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const resolvedMode: 'light' | 'dark' = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
          ...(resolvedMode === 'light'
            ? {
                primary: { main: '#1e3a5f' },
                background: { default: '#FAFAFA', paper: '#FFFFFF' },
                text: { primary: '#111111', secondary: '#666666' },
                divider: '#E8E8E8',
              }
            : {
                primary: { main: '#4a7ab5' },
                background: { default: '#0A0A0A', paper: '#161616' },
                text: { primary: '#EEEEEE', secondary: '#888888' },
                divider: '#2A2A2A',
              }),
        },
        typography: {
          fontFamily: "'JetBrains Mono', monospace",
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              },
            },
          },
          MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small' },
          },
        },
      }),
    [resolvedMode],
  );

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
