import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeContext, ThemeMode } from './ThemeContext';

const lightColors: Colors = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  primary: '#2563eb',
};

const darkColors: Colors = {
  background: '#0f172a',
  card: '#111827',
  text: '#f8fafc',
  muted: '#9ca3af',
  primary: '#8b5cf6',
};

const STORAGE_KEY = 'app.theme';

type Props = React.PropsWithChildren<unknown>;

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Load persisted theme or system preference
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setTheme(saved);
        } else {
          const system = Appearance.getColorScheme();
          setTheme(system === 'dark' ? 'dark' : 'light');
        }
      } catch {
        const system = Appearance.getColorScheme();
        setTheme(system === 'dark' ? 'dark' : 'light');
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = useMemo(() => (theme === 'dark' ? darkColors : lightColors), [theme]);

  const value = useMemo(() => ({ theme, colors, toggleTheme }), [theme, colors, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
