'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { getTheme } from '@/lib/themes';

export function ThemeApplier() {
  const currentTheme = useTheme();

  useEffect(() => {
    const theme = getTheme(currentTheme);
    const root = document.documentElement;

    // Set theme attribute for CSS selectors
    root.setAttribute('data-theme', currentTheme);

    // Apply CSS custom properties
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Set theme-specific colors for consistency
    const isDark = currentTheme === 'dark';
    root.style.setProperty('--theme-text-primary', isDark ? '#f8fafc' : '#0f172a');
    root.style.setProperty('--theme-text-secondary', isDark ? '#cbd5e1' : '#64748b');
    root.style.setProperty('--theme-bg-primary', isDark ? '#1e293b' : '#ffffff');
    root.style.setProperty('--theme-bg-secondary', isDark ? '#0f172a' : '#f9fafb');
  }, [currentTheme]);

  return null;
}
