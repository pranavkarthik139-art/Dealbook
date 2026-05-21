'use client';

import React, { useState } from 'react';

interface GongInsight {
  id: number;
  callBrief: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskDescription?: string;
  nextSteps: string;
}

interface GongInsightCardProps {
  insight: GongInsight;
  dealId: number;
  onSync?: (insightId: number) => void;
}

export function GongInsightCard({
  insight,
  dealId,
  onSync,
}: GongInsightCardProps) {
  const [syncing, setSyncing] = useState(false);

  const riskColor =
    insight.riskLevel === 'high'
      ? 'var(--error)'
      : insight.riskLevel === 'medium'
      ? 'var(--warning)'
      : 'var(--success)';

  const riskEmoji =
    insight.riskLevel === 'high'
      ? '🚨'
      : insight.riskLevel === 'medium'
      ? '⚠️'
      : '✅';

  const handleSync = async () => {
    setSyncing(true);
    // In production: POST to /api/gong/insights/:id/approve
    // which syncs to Salesforce:
    // - NextStep: insight.nextSteps
    // - Description: insight.callBrief
    // - Probability: based on risk level
    await new Promise(resolve => setTimeout(resolve, 500));
    onSync?.(insight.id);
    setSyncing(false);
  };

  return (
    <div style={{
      borderTop: `3px solid ${riskColor}`,
      paddingTop: 'var(--space-5)',
      marginBottom: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }}>
        <span style={{ fontSize: '20px' }}>📞</span>
        <h3 style={{
          margin: 0,
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          color: 'var(--ink)',
        }}>
          Gong Call Insight
        </h3>
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          backgroundColor: riskColor + '20',
          color: riskColor,
          borderRadius: '6px',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
        }}>
          {riskEmoji} {insight.riskLevel.charAt(0).toUpperCase() + insight.riskLevel.slice(1)}
        </span>
      </div>

      {/* Call Brief */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--ink)',
          lineHeight: 1.6,
        }}>
          {insight.callBrief}
        </p>
      </div>

      {/* Risk Description */}
      {insight.riskDescription && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <p style={{
            margin: 0,
            padding: 'var(--space-3)',
            backgroundColor: riskColor + '10',
            borderLeft: `3px solid ${riskColor}`,
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            color: riskColor,
            fontWeight: 500,
          }}>
            💡 {insight.riskDescription}
          </p>
        </div>
      )}

      {/* Next Steps */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p style={{
          margin: '0 0 var(--space-2) 0',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          color: 'var(--ink-lighter)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          📋 Recommended Next Steps
        </p>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--ink)',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}>
          {insight.nextSteps}
        </p>
      </div>

      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={syncing}
        style={{
          width: '100%',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--success)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          cursor: syncing ? 'wait' : 'pointer',
          transition: 'all var(--transition-base)',
          opacity: syncing ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!syncing) e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = syncing ? '0.7' : '1';
        }}
      >
        {syncing ? '⏳ Syncing to Salesforce...' : '✓ Sync to Salesforce'}
      </button>
    </div>
  );
}
