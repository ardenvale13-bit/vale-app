// ThemeContext.tsx — React context for the Vale lunar palette system

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { computeLunarTheme, DEFAULT_PALETTE } from './lunar';
import type { LunarTheme, LunarPaletteName } from './lunar';

interface ThemeContextValue {
  theme: LunarTheme;
  palette: LunarPaletteName;
  setPalette: (name: LunarPaletteName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'vale-lunar-palette';

function loadPalette(): LunarPaletteName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['twilight', 'amethyst', 'rose', 'aubergine'].includes(stored)) {
      return stored as LunarPaletteName;
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_PALETTE;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<LunarPaletteName>(loadPalette);
  const theme = computeLunarTheme(palette);

  const setPalette = useCallback((name: LunarPaletteName) => {
    setPaletteState(name);
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Sync CSS custom properties on the root element for any CSS that needs them
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--vale-bg', theme.bg);
    root.style.setProperty('--vale-bg-deep', theme.bgDeep);
    root.style.setProperty('--vale-accent', theme.accent);
    root.style.setProperty('--vale-ink', theme.ink);
    root.style.setProperty('--vale-rule', theme.rule);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
