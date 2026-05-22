'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';

/**
 * Applies the current theme to the document root element
 * This enables CSS variables and data-theme attribute for dark mode accessibility
 */
export function ThemeApplier() {
  const theme = useTheme();

  useEffect(() => {
    // Apply theme to document element for CSS variable switching
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  return null; // This component doesn't render anything
}
