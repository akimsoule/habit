import { createContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export type Colors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
};

export type ThemeContextValue = {
  theme: ThemeMode;
  colors: Colors;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
