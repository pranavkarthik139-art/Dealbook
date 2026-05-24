'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { getTheme } from '@/lib/themes';

/**
 * Applies the current theme to the document root element
 * This sets CSS custom properties for sidebar, main, accent, and text colors
 */
export function ThemeApplier() {
  const theme = useTheme();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const themeConfig = getTheme(theme);

      // Set CSS custom properties for the selected theme
      document.documentElement.style.setProperty('--theme-sidebar-color', themeConfig.sidebarColor);
      document.documentElement.style.setProperty('--theme-main-color', themeConfig.mainColor);
      document.documentElement.style.setProperty('--theme-accent-color', themeConfig.accentColor);
      document.documentElement.style.setProperty('--theme-text-color', themeConfig.textColor);

      // Also set data-theme for dark mode CSS selector
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  return null; // This component doesn't render anything
}
