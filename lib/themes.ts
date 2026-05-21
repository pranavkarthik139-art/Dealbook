export type ThemeName = 'cobalt' | 'emerald' | 'slate' | 'sunset' | 'ocean' | 'forest';

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
  cobalt: {
    name: 'cobalt',
    label: 'Cobalt Pro',
    sidebarColor: '#0047FF',    // Deep cobalt
    mainColor: '#F0F4FB',       // Light blue
    accentColor: '#0047FF',
    textColor: '#FFFFFF',
    description: 'Professional cobalt sidebar with light blue content',
  },
  emerald: {
    name: 'emerald',
    label: 'Emerald',
    sidebarColor: '#047857',    // Rich emerald
    mainColor: '#F0FBF7',       // Soft mint
    accentColor: '#047857',
    textColor: '#FFFFFF',
    description: 'Fresh emerald sidebar with mint content',
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    sidebarColor: '#1F2937',    // Dark slate
    mainColor: '#F9FAFB',       // Light gray
    accentColor: '#374151',
    textColor: '#FFFFFF',
    description: 'Modern slate sidebar with neutral content',
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    sidebarColor: '#EA580C',    // Warm orange
    mainColor: '#FEF5E7',       // Soft cream
    accentColor: '#EA580C',
    textColor: '#FFFFFF',
    description: 'Warm sunset sidebar with cream content',
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    sidebarColor: '#0369A1',    // Ocean blue
    mainColor: '#E0F2FE',       // Sky blue
    accentColor: '#0369A1',
    textColor: '#FFFFFF',
    description: 'Deep ocean sidebar with sky blue content',
  },
  forest: {
    name: 'forest',
    label: 'Forest',
    sidebarColor: '#15803D',    // Forest green
    mainColor: '#F0FDF4',       // Pale green
    accentColor: '#15803D',
    textColor: '#FFFFFF',
    description: 'Deep forest sidebar with pale green content',
  },
};

export function getTheme(themeName?: ThemeName): ThemeConfig {
  return THEMES[themeName || 'cobalt'];
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
  return 'cobalt'; // Default to Cobalt Pro theme
}
