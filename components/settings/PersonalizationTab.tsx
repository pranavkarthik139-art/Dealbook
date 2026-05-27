'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  onSaving: (saving: boolean) => void;
}

export function PersonalizationTab({ onSaving }: Props) {
  const [theme, setTheme] = useState('paper');
  const [fontFamily, setFontFamily] = useState('dm-sans');
  const [clockType, setClockType] = useState('digital');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Load current preferences
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data = await response.json();
          setTheme(data.theme || 'paper');
          setFontFamily(data.fontFamily || 'dm-sans');
          setClockType(data.clockType || 'digital');
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const savePreference = async (data: Record<string, any>) => {
    onSaving(true);
    setSaveStatus(null);
    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save preference');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);

      // Reload page if theme changed to apply globally
      if (data.theme) {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      console.error('Error saving preference:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      onSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    await savePreference({ theme: newTheme });
  };

  const handleFontChange = async (newFont: string) => {
    setFontFamily(newFont);
    await savePreference({ fontFamily: newFont });
  };

  const handleClockChange = async (newClock: string) => {
    setClockType(newClock);
    await savePreference({ clockType: newClock });
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#718096' }}>Loading preferences...</div>;
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', color: '#1A202C' }}>
        🎨 Personalization
      </h2>
      <p style={{ color: '#718096', marginBottom: '24px' }}>
        Customize your experience with themes, fonts, and display preferences
      </p>

      {saveStatus && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          borderRadius: '6px',
          backgroundColor: saveStatus === 'success' ? '#ECFDF5' : '#FEE2E2',
          color: saveStatus === 'success' ? '#065F46' : '#991B1B',
          fontSize: '13px',
          fontWeight: '500',
        }}>
          {saveStatus === 'success' ? '✓ Saved successfully' : '✗ Failed to save'}
        </div>
      )}

      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Theme Selection */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Theme</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { id: 'paper', label: 'Paper', desc: 'Light & clean' },
              { id: 'cobalt', label: 'Cobalt', desc: 'Bold blue' },
              { id: 'emerald', label: 'Emerald', desc: 'Green accent' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                style={{
                  padding: '16px',
                  backgroundColor: theme === t.id ? '#0047FF' : '#F0F0EB',
                  color: theme === t.id ? '#FFFFFF' : '#1A202C',
                  border: '2px solid ' + (theme === t.id ? '#0047FF' : '#E5E5E0'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (theme !== t.id) {
                    e.currentTarget.style.backgroundColor = '#E5E5E0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== t.id) {
                    e.currentTarget.style.backgroundColor = '#F0F0EB';
                  }
                }}
              >
                <div style={{ fontWeight: '600' }}>{t.label}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Font Family</h3>
          <select
            value={fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '10px 12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'DM Sans',
            }}
          >
            <option value="dm-sans">DM Sans (Default)</option>
            <option value="inter">Inter</option>
            <option value="poppins">Poppins</option>
            <option value="outfit">Outfit</option>
          </select>
        </div>

        {/* Clock Type */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Clock Display</h3>
          <select
            value={clockType}
            onChange={(e) => handleClockChange(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '10px 12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'DM Sans',
            }}
          >
            <option value="digital">Digital (14:30 IST)</option>
            <option value="analog">Analog Clock</option>
            <option value="both">Both</option>
            <option value="minimal">Minimal (time only)</option>
          </select>
        </div>

        <div style={{ padding: '12px', backgroundColor: '#F0F0EB', borderRadius: '6px', fontSize: '12px', color: '#718096' }}>
          💡 Changes are saved automatically as you make them
        </div>
      </div>
    </div>
  );
}
