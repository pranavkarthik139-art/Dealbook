'use client';

import React, { useState, useEffect } from 'react';

interface GmailStatus {
  connected: boolean;
  hasAccessToken?: boolean;
  hasRefreshToken?: boolean;
  lastSyncAt?: string;
  message: string;
}

export function GmailSyncButton() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/email/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check email status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/email/sync', { method: 'POST' });
      const data = await response.json();

      setSyncResult({
        success: response.ok,
        data,
      });

      if (response.ok) {
        // Refresh status after sync
        checkStatus();
      }
    } catch (error) {
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        Loading email status...
      </div>
    );
  }

  const getStatusColor = () => {
    if (!status?.connected) return '#ef4444';
    if (syncResult?.success) return '#10b981';
    return '#f59e0b';
  };

  return (
    <div style={{
      padding: '16px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {/* Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
          }}
        />
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
          {status?.connected ? '✅ Gmail Connected' : '❌ Gmail Not Connected'}
        </span>
      </div>

      {/* Status Message */}
      <p style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.7)',
        margin: '0',
      }}>
        {status?.message}
      </p>

      {/* Last Sync Time */}
      {status?.lastSyncAt && (
        <p style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          margin: '0',
        }}>
          Last synced: {new Date(status.lastSyncAt).toLocaleString()}
        </p>
      )}

      {/* Sync Button */}
      {status?.connected && (
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '8px 14px',
            backgroundColor: syncing ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease',
            opacity: syncing ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!syncing) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!syncing) {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {syncing ? '🔄 Syncing...' : '📧 Sync Gmail'}
        </button>
      )}

      {/* Sync Result */}
      {syncResult && (
        <div style={{
          padding: '10px',
          borderRadius: '6px',
          backgroundColor: syncResult.success
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${syncResult.success ? '#10b981' : '#ef4444'}`,
          fontSize: '12px',
          color: syncResult.success ? '#10b981' : '#ef4444',
        }}>
          {syncResult.success ? (
            <>
              ✅ Sync successful!
              <br />
              {syncResult.data?.message || `Synced ${syncResult.data?.total} emails, logged ${syncResult.data?.activitiesLogged} activities`}
            </>
          ) : (
            <>
              ❌ Sync failed: {syncResult.error || syncResult.data?.error}
            </>
          )}
        </div>
      )}
    </div>
  );
}
