'use client';

import React, { useState, useEffect } from 'react';

type ColorMetric = 'stall_severity' | 'deal_health' | 'critical_data';

interface CardColorMetricOption {
  value: ColorMetric;
  label: string;
  description: string;
  example: string;
}

const COLOR_METRIC_OPTIONS: CardColorMetricOption[] = [
  {
    value: 'stall_severity',
    label: 'Stall Severity',
    description: 'Colors based on how badly the deal is stalled',
    example: '🔴 Red = Critical stall, 🟡 Yellow = Warning, 🟢 Green = Active',
  },
  {
    value: 'deal_health',
    label: 'Deal Health Score',
    description: 'Colors based on overall deal health (0-100 score)',
    example: '🔴 Red = Health < 50, 🟡 Yellow = Health 50-79, 🟢 Green = Health ≥ 80',
  },
  {
    value: 'critical_data',
    label: 'Critical Data Missing',
    description: 'Colors based on missing deal information',
    example: '🔴 Red = 3+ fields missing, 🟡 Yellow = 1-2 fields missing, 🟢 Green = All data present',
  },
];

export function CardColorSettings() {
  const [selectedMetric, setSelectedMetric] = useState<ColorMetric>('stall_severity');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch current preference
  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          setSelectedMetric(data.cardColorMetric || 'stall_severity');
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreference();
  }, []);

  const handleSave = async (metric: ColorMetric) => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardColorMetric: metric }),
      });

      if (res.ok) {
        setSelectedMetric(metric);
        setSaveMessage('✓ Preference saved!');
        setTimeout(() => setSaveMessage(''), 2000);
      } else {
        setSaveMessage('❌ Failed to save preference');
      }
    } catch (error) {
      console.error('Error saving preference:', error);
      setSaveMessage('❌ Error saving preference');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: 'var(--theme-text-tertiary)' }}>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '16px', color: 'var(--theme-text-primary)' }}>
        Deal Card Color Preference
      </h2>

      <p style={{ color: 'var(--theme-text-tertiary)', marginBottom: '20px', lineHeight: 1.6 }}>
        Choose what metric determines the back-side color of deal cards when you flip them:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {COLOR_METRIC_OPTIONS.map((option) => (
          <div
            key={option.value}
            onClick={() => handleSave(option.value)}
            style={{
              padding: '16px',
              border: selectedMetric === option.value ? '2px solid var(--theme-accent)' : '1px solid var(--theme-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              backgroundColor: selectedMetric === option.value ? 'var(--theme-accent-light)' : 'var(--theme-card-bg)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--theme-accent)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = selectedMetric === option.value ? 'var(--theme-accent)' : 'var(--theme-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: selectedMetric === option.value ? '3px solid var(--theme-accent)' : '2px solid var(--theme-border)',
                  backgroundColor: selectedMetric === option.value ? 'var(--theme-accent)' : 'transparent',
                }}
              />
              <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--theme-text-primary)' }}>
                {option.label}
              </h3>
            </div>

            <p style={{ margin: '0 0 8px 28px', fontSize: 'var(--text-sm)', color: 'var(--theme-text-tertiary)' }}>
              {option.description}
            </p>

            <p style={{ margin: '0 0 0 28px', fontSize: 'var(--text-xs)', color: 'var(--theme-text-tertiary)', fontStyle: 'italic' }}>
              {option.example}
            </p>
          </div>
        ))}
      </div>

      {saveMessage && (
        <p
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: saveMessage.includes('✓') ? 'var(--success-light)' : 'rgba(239, 68, 68, 0.1)',
            color: saveMessage.includes('✓') ? 'var(--theme-success)' : 'var(--theme-error)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
          }}
        >
          {saveMessage}
        </p>
      )}

      {isSaving && (
        <p style={{ marginTop: '16px', color: 'var(--theme-text-tertiary)', fontSize: 'var(--text-sm)' }}>
          Saving...
        </p>
      )}
    </div>
  );
}
