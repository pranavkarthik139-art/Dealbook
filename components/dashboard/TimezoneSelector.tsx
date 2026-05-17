'use client';

import React, { useState, useEffect } from 'react';
import { useMultipleTimezones } from '@/hooks/useTimezone';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'America/New_York', label: 'US East (EST)' },
  { value: 'America/Los_Angeles', label: 'US West (PST)' },
  { value: 'Europe/London', label: 'UK (GMT)' },
  { value: 'Australia/Sydney', label: 'Australia (AEDT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
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

  if (loading || !prefs) return <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-900"
      >
        <div className="text-right">
          {times.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {times[0].time} {times[0].abbr}
              </div>
              {times[1] && (
                <div className="text-xs text-slate-500">
                  {times[1].time} {times[1].abbr}
                </div>
              )}
            </div>
          )}
        </div>
        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Primary Timezone
            </label>
            <select
              value={prefs.timezonePrimary}
              onChange={(e) => handleTimezoneChange('primary', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Secondary Timezone
            </label>
            <select
              value={prefs.timezoneSecondary || ''}
              onChange={(e) => handleTimezoneChange('secondary', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">None</option>
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
