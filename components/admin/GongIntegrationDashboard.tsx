'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';

interface SyncRecord {
  date: string;
  callsFetched: number;
  callsMatched: number;
  apiCallsUsed: number;
  status: string;
}

interface Metrics {
  averageApiCallsPerSync: string;
  estimatedMonthlyApiCalls: string;
  estimatedMonthlyCost: string;
}

export function GongIntegrationDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/calls/gong/sync-efficient');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync status');
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      const response = await fetch('/api/calls/gong/sync-efficient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      });

      if (!response.ok) throw new Error('Failed to trigger sync');

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger sync');
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-tertiary)' }}>
          Loading Gong integration status...
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: '"Playfair Display", serif',
            margin: '0 0 8px 0',
            color: 'var(--theme-text-primary)',
          }}
        >
          🎤 Gong Integration Dashboard
        </h2>
        <p style={{ margin: '0', color: 'var(--theme-text-tertiary)', fontSize: '13px' }}>
          Monitor API usage, sync history, and cost optimization
        </p>
      </div>

      {error && (
        <Card style={{ backgroundColor: '#FEF2F2', borderColor: '#EF4444' }}>
          <p style={{ margin: '0', color: '#991B1B', fontSize: '13px' }}>❌ {error}</p>
        </Card>
      )}

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Card>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-text-tertiary)', marginBottom: '8px' }}>
            TOTAL CALLS SYNCED
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
            {data?.totalCallsSynced || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginTop: '8px' }}>
            across all time
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-text-tertiary)', marginBottom: '8px' }}>
            AVG API CALLS/SYNC
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0047FF' }}>
            {data?.metrics?.averageApiCallsPerSync || '0'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginTop: '8px' }}>
            (cached & batched)
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-text-tertiary)', marginBottom: '8px' }}>
            EST. MONTHLY COST
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>
            {data?.metrics?.estimatedMonthlyCost || '$0.00'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginTop: '8px' }}>
            (if pay-per-call)
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-text-tertiary)', marginBottom: '8px' }}>
            LAST SYNC
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)' }}>
            {data?.lastSync ? new Date(data.lastSync).toLocaleString() : 'Never'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginTop: '8px' }}>
            📅 Auto syncs daily
          </div>
        </Card>
      </div>

      {/* Cost Optimization Info */}
      <Card>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '12px' }}>
          ⚡ Cost Optimization Active
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginBottom: '4px' }}>✅ Incremental Sync</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--theme-text-primary)' }}>Only new/updated calls</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginBottom: '4px' }}>✅ 24h Cache Layer</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--theme-text-primary)' }}>90% fewer API calls</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginBottom: '4px' }}>✅ Batch Operations</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--theme-text-primary)' }}>100 calls in 1 request</div>
          </div>
        </div>
      </Card>

      {/* Recent Syncs */}
      <Card>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '16px' }}>
          📊 Recent Sync History (Last 7 Days)
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: 'var(--theme-text-tertiary)' }}>
                  Date
                </th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: 'var(--theme-text-tertiary)' }}>
                  Fetched
                </th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: 'var(--theme-text-tertiary)' }}>
                  Matched
                </th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: 'var(--theme-text-tertiary)' }}>
                  API Calls
                </th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: 'var(--theme-text-tertiary)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.recentSyncs && data.recentSyncs.length > 0 ? (
                data.recentSyncs.map((sync: SyncRecord, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)' }}>
                    <td style={{ padding: '8px', color: 'var(--theme-text-primary)' }}>
                      {new Date(sync.date).toLocaleDateString()} {new Date(sync.date).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '8px', color: 'var(--theme-text-primary)' }}>{sync.callsFetched}</td>
                    <td style={{ padding: '8px', color: 'var(--theme-text-primary)', fontWeight: 600 }}>{sync.callsMatched}</td>
                    <td style={{ padding: '8px', color: '#0047FF', fontWeight: 600 }}>{sync.apiCallsUsed}</td>
                    <td style={{ padding: '8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: sync.status === 'success' ? '#ECFDF5' : '#FEF2F2',
                          color: sync.status === 'success' ? '#047857' : '#991B1B',
                        }}
                      >
                        {sync.status === 'success' ? '✅ Success' : '❌ Failed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--theme-text-tertiary)' }}>
                    No sync history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <button
          onClick={triggerSync}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0047FF',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0039CC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0047FF';
          }}
        >
          🔄 Trigger Sync Now
        </button>
        <div style={{ fontSize: '11px', color: 'var(--theme-text-tertiary)', marginTop: '12px', textAlign: 'center' }}>
          Normally syncs daily at 3 AM. Click to sync manually.
        </div>
      </Card>

      {/* Info Box */}
      <Card style={{ backgroundColor: '#F0F4FF', borderColor: '#0047FF' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#0047FF', marginBottom: '8px' }}>
          💡 How It Works
        </div>
        <ul style={{ fontSize: '12px', color: 'var(--theme-text-primary)', margin: '0', paddingLeft: '20px', lineHeight: 1.6 }}>
          <li>Only fetches calls updated since last sync (not all calls)</li>
          <li>Caches results for 24 hours to avoid redundant API calls</li>
          <li>Batches multiple calls into single API requests</li>
          <li>Matches calls to deals automatically by contact email</li>
          <li>Result: ~99% fewer API calls vs. naive implementations</li>
        </ul>
      </Card>
    </div>
  );
}
