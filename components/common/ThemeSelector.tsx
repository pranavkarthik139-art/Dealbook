'use client';

import { useTheme, useSetTheme } from '@/lib/ThemeContext';
import { getTheme, type ThemeName, THEMES } from '@/lib/themes';
import { useState } from 'react';

const THEME_OPTIONS: ThemeName[] = ['light', 'dark', 'typeui', 'cobalt', 'emerald', 'slate'];

export function ThemeSelector() {
  const currentTheme = useTheme();
  const setTheme = useSetTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    setIsOpen(false);
  };

  const themeConfig = getTheme(currentTheme);
  const isDark = currentTheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const labelColor = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.6)';

  return (
    <div style={{ position: 'relative' }}>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: 500,
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          color: labelColor,
          transition: 'all 150ms ease',
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Click to change theme"
      >
        <span>🎨</span>
        <span>Theme: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}</span>
        <span style={{
          marginLeft: 'auto',
          transition: 'transform 150ms ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            borderRadius: '8px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fade-up 200ms ease both',
            minWidth: '220px'
          }}
        >
          {/* Theme Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' }}>
            {THEME_OPTIONS.map((theme) => {
              const config = getTheme(theme);
              const isSelected = theme === currentTheme;
              const isDarkTheme = theme === 'dark';

              return (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected
                      ? isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)'
                      : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: textColor,
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)')
                      : 'transparent';
                  }}
                >
                  {/* Theme Color Swatch */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: config.sidebarColor,
                      border: isSelected ? `2px solid ${config.accentColor}` : 'none'
                    }}
                  />

                  {/* Theme Name */}
                  <span style={{ flex: 1, textAlign: 'left' }}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </span>

                  {/* Checkmark if Selected */}
                  {isSelected && (
                    <span style={{ fontSize: '14px' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
