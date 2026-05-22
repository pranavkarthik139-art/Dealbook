'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getThemePreference, saveThemePreference, type ThemeName } from './themes';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load initial theme from localStorage
    const savedTheme = getThemePreference();
    setThemeState(savedTheme);
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  };

  // Always render - use 'light' as default on SSR, update on client mount
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeName {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
}

export function useSetTheme(): (theme: ThemeName) => void {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useSetTheme must be used within a ThemeProvider');
  }
  return context.setTheme;
}
