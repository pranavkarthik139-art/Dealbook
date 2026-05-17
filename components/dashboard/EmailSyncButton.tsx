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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-ink">Email Sync</h3>
          <p className="text-xs text-ink-lighter mt-1">
            {lastSync ? `Last synced at ${lastSync}` : 'Never synced'}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {syncing ? 'Syncing...' : 'Sync Gmail'}
        </button>
      </div>

      {showResult && result && (
        <div
          className={`p-3 rounded-lg border text-sm ${
            result.success
              ? 'bg-green-50 border-green text-green'
              : 'bg-red-50 border-red text-red'
          }`}
        >
          <p className="font-medium">{result.message || result.error}</p>
          {result.success && (
            <p className="text-xs mt-2">
              Matched: {result.matched} | Logged: {result.activitiesLogged}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
