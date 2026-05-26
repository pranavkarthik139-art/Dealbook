export type ThemeName = 'light' | 'dark' | 'cobalt' | 'emerald' | 'slate';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  sidebarColor: string;      // Left pane color
  mainColor: string;         // Main content area color
  accentColor: string;
  textColor: string;
  description: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    label: 'Light (Default)',
    sidebarColor: '#FFFFFF',    // Clean white sidebar (Paper)
    mainColor: '#F9F9F7',       // Paper alt background
    accentColor: '#6366F1',     // Cobalt accent
    textColor: '#0F172A',       // Ink text
    description: 'Clean, minimal light theme with neutral sidebar',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    sidebarColor: '#1E293B',    // Darker slate sidebar (improved contrast with text)
    mainColor: '#0F172A',       // Dark ink background
    accentColor: '#818CF8',     // Lighter cobalt for better contrast on dark bg
    textColor: '#F8FAFC',       // Slightly lighter text for WCAG AA compliance
    description: 'Dark theme with professional appearance and accessible contrast',
  },
  cobalt: {
    name: 'cobalt',
    label: 'Cobalt',
    sidebarColor: '#4F46E5',    // Rich cobalt sidebar
    mainColor: '#F0F4FF',       // Light cobalt-tinted background
    accentColor: '#6366F1',     // Cobalt accent
    textColor: '#0F172A',       // Dark text
    description: 'Modern cobalt theme with complementary sidebar and main area',
  },
  emerald: {
    name: 'emerald',
    label: 'Emerald',
    sidebarColor: '#047857',    // Rich emerald sidebar
    mainColor: '#F0FDF4',       // Light emerald-tinted background
    accentColor: '#10B981',     // Emerald accent
    textColor: '#0F172A',       // Dark text
    description: 'Fresh emerald theme with complementary green sidebar',
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    sidebarColor: '#475569',    // Deep slate sidebar
    mainColor: '#F8FAFC',       // Light slate-tinted background
    accentColor: '#64748B',     // Slate accent
    textColor: '#0F172A',       // Dark text
    description: 'Professional slate theme with complementary sidebar',
  },
};

export function getTheme(themeName?: ThemeName): ThemeConfig {
  return THEMES[themeName || 'light'];
}

export function saveThemePreference(themeName: ThemeName): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-preference', themeName);
  }
}

export function getThemePreference(): ThemeName {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme-preference');
    if (saved && saved in THEMES) {
      return saved as ThemeName;
    }
  }
  return 'light'; // Default to Light theme
}
