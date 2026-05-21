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
      <div style={{ padding: 'var(--space-5)' }}>
        <p style={{ color: 'var(--ink-lighter)' }}>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-5)', maxWidth: '600px' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--ink)' }}>
        Deal Card Color Preference
      </h2>

      <p style={{ color: 'var(--ink-lighter)', marginBottom: 'var(--space-5)', lineHeight: 1.6 }}>
        Choose what metric determines the back-side color of deal cards when you flip them:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {COLOR_METRIC_OPTIONS.map((option) => (
          <div
            key={option.value}
            onClick={() => handleSave(option.value)}
            style={{
              padding: 'var(--space-4)',
              border: selectedMetric === option.value ? '2px solid var(--cobalt)' : '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              backgroundColor: selectedMetric === option.value ? 'var(--cobalt-light)' : 'var(--paper-alt)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cobalt)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = selectedMetric === option.value ? 'var(--cobalt)' : 'var(--line)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: selectedMetric === option.value ? '3px solid var(--cobalt)' : '2px solid var(--line)',
                  backgroundColor: selectedMetric === option.value ? 'var(--cobalt)' : 'transparent',
                }}
              />
              <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink)' }}>
                {option.label}
              </h3>
            </div>

            <p style={{ margin: '0 0 var(--space-2) 28px', fontSize: 'var(--text-sm)', color: 'var(--ink-lighter)' }}>
              {option.description}
            </p>

            <p style={{ margin: '0 0 0 28px', fontSize: 'var(--text-xs)', color: 'var(--ink-lighter)', fontStyle: 'italic' }}>
              {option.example}
            </p>
          </div>
        ))}
      </div>

      {saveMessage && (
        <p
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: saveMessage.includes('✓') ? 'var(--success-light)' : 'var(--error-light)',
            color: saveMessage.includes('✓') ? 'var(--success)' : 'var(--error)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
          }}
        >
          {saveMessage}
        </p>
      )}

      {isSaving && (
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--ink-lighter)', fontSize: 'var(--text-sm)' }}>
          Saving...
        </p>
      )}
    </div>
  );
}
