'use client';

import { useState, useEffect } from 'react';

interface SyncResult {
  success: boolean;
  message?: string;
  matched?: number;
  total?: number;
  activitiesLogged?: number;
  error?: string;
}

export function EmailSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Load last sync time from localStorage
    const stored = localStorage.getItem('lastGmailSync');
    if (stored) {
      setLastSync(stored);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setShowResult(false);
    setResult(null);

    try {
      const response = await fetch('/api/email/sync', {
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
        localStorage.setItem('lastGmailSync', now);
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
      gap: 'var(--space-3)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{
            fontWeight: 500,
            color: 'var(--ink)',
            margin: 0,
            fontSize: 'var(--text-sm)'
          }}>Email Sync</h3>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-lighter)',
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
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius)',
            backgroundColor: syncing ? 'var(--ink-lighter)' : 'var(--cobalt)',
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
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--cobalt)';
          }}
        >
          {syncing ? 'Syncing...' : 'Sync Gmail'}
        </button>
      </div>

      {showResult && result && (
        <div style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius)',
          border: `1px solid ${result.success ? 'var(--success)' : 'var(--error)'}`,
          backgroundColor: result.success ? 'var(--success-light)' : 'var(--error-light)',
          fontSize: 'var(--text-sm)'
        }}>
          <p style={{
            fontWeight: 500,
            color: result.success ? 'var(--success)' : 'var(--error)',
            margin: 0
          }}>{result.message || result.error}</p>
          {result.success && (
            <p style={{
              fontSize: 'var(--text-xs)',
              marginTop: 'var(--space-2)',
              margin: 'var(--space-2) 0 0 0',
              color: result.success ? 'var(--success)' : 'var(--error)'
            }}>
              Matched: {result.matched} | Logged: {result.activitiesLogged}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
