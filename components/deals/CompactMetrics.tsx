'use client';

import React from 'react';

interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
  status?: string;
  healthScore?: number;
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
  todos?: Array<{ completed: boolean }>;
  calendarEvents?: Array<{ startTime: string }>;
  stall?: {
    isStalled: boolean;
    daysStalled: number;
    risk: 'ok' | 'warning' | 'critical';
    reason: string;
  };
}

interface CompactMetricsProps {
  deals: Deal[];
}

export function CompactMetrics({ deals }: CompactMetricsProps) {
  // Calculate metrics
  const totalPipelineValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const activeDealCount = deals.filter(
    (deal) => deal.status !== 'closed' && deal.status !== 'lost'
  ).length;

  const closedDeals = deals.filter((deal) => deal.status === 'closed').length;
  const winRate = deals.length > 0 ? Math.round((closedDeals / deals.length) * 100) : 0;

  // Health calculation
  const healthyDeals = deals.filter((d) => (d.healthScore || 0) >= 80).length;
  const needsAttentionDeals = deals.filter((d) => {
    const score = d.healthScore || 0;
    return score >= 50 && score < 80;
  }).length;
  const atRiskDeals = deals.filter((d) => (d.healthScore || 0) < 50).length;

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* Stat 1: Total Pipeline Value */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--ink-lighter)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Pipeline Value
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--cobalt)',
          }}
        >
          {formatValue(totalPipelineValue)}
        </p>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: 'var(--ink-lighter)',
          }}
        >
          {deals.length} total deals
        </p>
      </div>

      {/* Stat 2: Active Deals */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--ink-lighter)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Active Deals
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--success)',
          }}
        >
          {activeDealCount}
        </p>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: 'var(--ink-lighter)',
          }}
        >
          {Math.round((activeDealCount / deals.length) * 100) || 0}% of pipeline
        </p>
      </div>

      {/* Stat 3: Win Rate */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--ink-lighter)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Win Rate
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--warning)',
          }}
        >
          {winRate}%
        </p>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: 'var(--ink-lighter)',
          }}
        >
          {closedDeals} deals closed
        </p>
      </div>

      {/* Stat 4: Deal Health */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--ink-lighter)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Deal Health
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
              {healthyDeals}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--warning)',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
              {needsAttentionDeals}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--error)',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--error)' }}>
              {atRiskDeals}
            </span>
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--ink-lighter)',
          }}
        >
          On track / Attention / Risk
        </p>
      </div>
    </div>
  );
}
