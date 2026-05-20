import React from 'react';
import { CardColorSettings } from '@/components/settings/CardColorSettings';

export default function SettingsPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--paper)',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--paper)',
          padding: 'var(--space-5)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--ink)' }}>
          Settings
        </h1>
        <p style={{ margin: 'var(--space-2) 0 0 0', color: 'var(--ink-lighter)', fontSize: 'var(--text-sm)' }}>
          Customize your Dealbook dashboard experience
        </p>
      </div>

      {/* Settings Sections */}
      <div style={{ flex: 1, padding: 'var(--space-5)' }}>
        <div
          style={{
            backgroundColor: 'var(--paper-alt)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
          }}
        >
          <CardColorSettings />
        </div>

        {/* Placeholder for future settings */}
        <div
          style={{
            marginTop: 'var(--space-5)',
            padding: 'var(--space-5)',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            opacity: 0.5,
          }}
        >
          <h2 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink)' }}>
            Coming Soon
          </h2>
          <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', color: 'var(--ink-lighter)' }}>
            <li>Email notification preferences</li>
            <li>Deal pipeline customization</li>
            <li>User profile & API keys</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
