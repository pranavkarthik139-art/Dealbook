'use client';

import { useState, useEffect } from 'react';

interface SyncResult {
  success: boolean;
  message?: string;
  synced?: number;
  total?: number;
  matched?: number;
  error?: string;
}

export function CalendarSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Load last sync time from localStorage
    const stored = localStorage.getItem('lastCalendarSync');
    if (stored) {
      setLastSync(stored);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setShowResult(false);
    setResult(null);

    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      setResult(data);
      setShowResult(true);

      if (response.ok) {
        // Update last sync time
        const now = new Date().toLocaleTimeString();
        setLastSync(now);
        localStorage.setItem('lastCalendarSync', now);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        error: msg,
      });
      setShowResult(true);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{
            fontWeight: 500,
            color: 'var(--theme-text-primary)',
            margin: 0,
            fontSize: 'var(--text-sm)'
          }}>Calendar Sync</h3>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--theme-text-tertiary)',
            marginTop: 'var(--space-1)',
            margin: 'var(--space-1) 0 0 0'
          }}>
            {lastSync ? `Last synced at ${lastSync}` : 'Never synced'}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            backgroundColor: syncing ? 'var(--theme-text-tertiary)' : 'var(--theme-accent)',
            color: 'white',
            border: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-base)',
            opacity: syncing ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!syncing) {
              e.currentTarget.style.backgroundColor = 'var(--theme-accent-dark)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
          }}
        >
          {syncing ? 'Syncing...' : 'Sync Calendar'}
        </button>
      </div>

      {showResult && result && (
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius)',
          border: `1px solid ${result.success ? 'var(--theme-success)' : 'var(--theme-error)'}`,
          backgroundColor: result.success ? 'var(--success-light)' : 'rgba(239, 68, 68, 0.1)',
          fontSize: 'var(--text-sm)'
        }}>
          <p style={{
            fontWeight: 500,
            color: result.success ? 'var(--theme-success)' : 'var(--theme-error)',
            margin: 0
          }}>{result.message || result.error}</p>
          {result.success && (
            <p style={{
              fontSize: 'var(--text-xs)',
              marginTop: '8px',
              margin: '8px 0 0 0',
              color: result.success ? 'var(--theme-success)' : 'var(--theme-error)'
            }}>
              Synced: {result.synced} | Matched: {result.matched}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
