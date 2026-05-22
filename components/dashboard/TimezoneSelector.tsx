'use client';

import React, { useState, useEffect } from 'react';
import { useMultipleTimezones } from '@/hooks/useTimezone';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India (IST)', emoji: '🇮🇳' },
  { value: 'America/New_York', label: 'US East (EST)', emoji: '🇺🇸' },
  { value: 'America/Los_Angeles', label: 'US West (PST)', emoji: '🌴' },
  { value: 'Europe/London', label: 'UK (GMT)', emoji: '🇬🇧' },
  { value: 'Australia/Sydney', label: 'Australia (AEDT)', emoji: '🇦🇺' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', emoji: '🇸🇬' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', emoji: '🇯🇵' },
];

interface TimezonePreferences {
  timezonePrimary: string;
  timezoneSecondary: string;
}

export function TimezoneSelector() {
  const [prefs, setPrefs] = useState<TimezonePreferences | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const timezones = prefs
    ? [prefs.timezonePrimary, prefs.timezoneSecondary].filter(Boolean)
    : [];
  const times = useMultipleTimezones(timezones);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data = await response.json();
          setPrefs(data);
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
        setPrefs({
          timezonePrimary: 'Asia/Kolkata',
          timezoneSecondary: 'America/New_York',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrefs();
  }, []);

  const handleTimezoneChange = async (type: 'primary' | 'secondary', value: string) => {
    if (!prefs) return;

    const updated = {
      ...prefs,
      [type === 'primary' ? 'timezonePrimary' : 'timezoneSecondary']: value,
    };

    setPrefs(updated);

    try {
      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }

    setIsOpen(false);
  };

  const getTimezoneEmoji = (tzValue: string) => {
    return TIMEZONE_OPTIONS.find(tz => tz.value === tzValue)?.emoji || '🌍';
  };

  const getTimezoneLabel = (tzValue: string) => {
    return TIMEZONE_OPTIONS.find(tz => tz.value === tzValue)?.label || tzValue;
  };

  if (loading || !prefs) {
    return (
      <div style={{
        height: '56px',
        width: '200px',
        backgroundColor: 'var(--paper-alt)',
        borderRadius: '12px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Main Button with Professional Styling */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '13px',
          fontWeight: '500',
          color: '#1a202c',
          minWidth: '200px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }}
      >
        {/* Clock Icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#0047FF', flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>

        {/* Time Display - Primary & Secondary Timezones */}
        <div style={{ textAlign: 'left', flex: 1 }}>
          {times.length > 0 && (
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              letterSpacing: '0.2px',
              color: '#1a202c',
              fontFamily: '"DM Mono", "Courier New", monospace',
              lineHeight: '1.2'
            }}>
              {times[0].time}
              {times.length > 1 && (
                <>
                  <span style={{ color: '#cbd5e0', margin: '0 6px' }}>|</span>
                  {times[1].time}
                </>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{
          color: '#cbd5e0',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 180ms cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0
        }}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          marginTop: '6px',
          width: '320px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '10px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
          zIndex: 50,
          overflow: 'hidden',
          backdropFilter: 'blur(8px)'
        }}>
          {/* Primary Timezone */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            backgroundColor: 'rgba(0, 71, 255, 0.02)'
          }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              color: '#4a5568',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}>
              📍 Primary Timezone
            </label>
            <select
              value={prefs.timezonePrimary}
              onChange={(e) => handleTimezoneChange('primary', e.target.value)}
              style={{
                width: '100%',
                padding: '9px 11px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '7px',
                fontSize: '13px',
                color: '#1a202c',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: '500',
                transition: 'all 150ms ease'
              }}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.emoji} {tz.label}
                </option>
              ))}
            </select>
            <p style={{
              margin: '7px 0 0 0',
              fontSize: '11px',
              color: '#718096',
              fontWeight: '500',
              fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}>
              {getTimezoneEmoji(prefs.timezonePrimary)} {getTimezoneLabel(prefs.timezonePrimary)}
            </p>
          </div>

          {/* Secondary Timezone */}
          <div style={{ padding: '14px 16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              color: '#4a5568',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}>
              🌐 Secondary Timezone
            </label>
            <select
              value={prefs.timezoneSecondary || ''}
              onChange={(e) => handleTimezoneChange('secondary', e.target.value)}
              style={{
                width: '100%',
                padding: '9px 11px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '7px',
                fontSize: '13px',
                color: '#1a202c',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: '500',
                transition: 'all 150ms ease'
              }}
            >
              <option value="">— None —</option>
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.emoji} {tz.label}
                </option>
              ))}
            </select>
            {prefs.timezoneSecondary && (
              <p style={{
                margin: '7px 0 0 0',
                fontSize: '11px',
                color: '#718096',
                fontWeight: '500',
                fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}>
                {getTimezoneEmoji(prefs.timezoneSecondary)} {getTimezoneLabel(prefs.timezoneSecondary)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
