'use client';

import React, { useState } from 'react';

export function ThemeSelector() {
  const currentTheme = useTheme();
  const setTheme = useSetTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    setIsOpen(false);
  };

  const themeList = Object.values(THEMES);
  const activeTheme = THEMES[currentTheme];

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
          backgroundColor: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          fontSize: '13px',
          fontWeight: '500',
          color: '#4a5568',
          fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
        }}
        title="Change theme"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        {activeTheme.label}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '6px',
            width: '360px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
            zIndex: 50,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '11px',
                fontWeight: '700',
                color: '#4a5568',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              🎨 Color Themes
            </p>
          </div>

          {/* Theme Options - 2 columns */}
          <div style={{
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}>
            {themeList.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemeChange(theme.name as ThemeName)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: currentTheme === theme.name ? 'rgba(0, 71, 255, 0.08)' : 'transparent',
                  border: currentTheme === theme.name ? '2px solid #0047FF' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (currentTheme !== theme.name) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== theme.name) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {/* Color Preview - Side by side */}
                <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                  <div
                    style={{
                      flex: 1,
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: theme.sidebarBg,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      title: 'Sidebar'
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: theme.accentColor,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      title: 'Accent'
                    }}
                  />
                </div>

                {/* Theme Info */}
                <div style={{ width: '100%' }}>
                  <p
                    style={{
                      margin: '0 0 2px 0',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1a202c',
                      fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    {theme.label}
                  </p>
                  <p
                    style={{
                      margin: '0',
                      fontSize: '10px',
                      color: '#718096',
                      fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    {theme.description}
                  </p>
                </div>

                {/* Checkmark */}
                {currentTheme === theme.name && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                  }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0047FF"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
