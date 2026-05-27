export type ThemeName = 'light' | 'dark' | 'typeui';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  sidebarColor: string;
  mainColor: string;
  accentColor: string;
  textColor: string;
  description: string;
  // TypeUI additions
  surfaceColor?: string;
  borderColor?: string;
  shadowColor?: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    label: 'Light (Default)',
    sidebarColor: '#FFFFFF',
    mainColor: '#F9F9F7',
    accentColor: '#6366F1',
    textColor: '#0F172A',
    description: 'Clean, minimal light theme with neutral sidebar',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    sidebarColor: '#1E293B',
    mainColor: '#0F172A',
    accentColor: '#818CF8',
    textColor: '#F8FAFC',
    description: 'Dark theme with professional appearance',
  },
  typeui: {
    name: 'typeui',
    label: 'TypeUI (Dark Pro)',
    sidebarColor: '#09090B',
    mainColor: '#09090B',
    accentColor: '#0C5CAB',
    textColor: '#FAFAFA',
    surfaceColor: '#121216',
    borderColor: '#262629',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    description: 'Cloud platform aesthetic with glass-morphism panels',
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
  return 'light';
}
