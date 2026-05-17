'use client';

import { calculateDealHealth, getHealthStatus } from '@/lib/dealHealth';

interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
  status?: string;
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
  todos?: Array<{ completed: boolean }>;
  calendarEvents?: Array<{ startTime: string }>;
}

interface DealMetricsProps {
  deals: Deal[];
}

export function DealMetrics({ deals }: DealMetricsProps) {
  const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0;

  const stageBreakdown = {
    demo: deals.filter(d => d.stage === 'demo').length,
    poc: deals.filter(d => d.stage === 'poc').length,
    validation: deals.filter(d => d.stage === 'validation').length,
    closed: deals.filter(d => d.stage === 'closed').length,
  };

  const healthBreakdown = deals.reduce(
    (acc, deal) => {
      const health = calculateDealHealth(deal);
      if (health >= 80) acc.onTrack++;
      else if (health >= 50) acc.needsAttention++;
      else acc.atRisk++;
      return acc;
    },
    { onTrack: 0, needsAttention: 0, atRisk: 0 }
  );

  const activeDealCount = deals.filter(d => d.status === 'active').length;
  const winRate = deals.length > 0 ? ((stageBreakdown.closed / deals.length) * 100).toFixed(0) : 0;

  const metrics = [
    { label: 'Total Pipeline', value: '$' + (totalValue / 1000000).toFixed(1) + 'M', color: '#0047FF' },
    { label: 'Active Deals', value: String(activeDealCount), color: '#10B981' },
    { label: 'Avg Deal Size', value: '$' + (avgDealSize / 1000).toFixed(0) + 'k', color: '#7C3AED' },
    { label: 'Win Rate', value: winRate + '%', color: '#F59E0B' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderTop: '4px solid ' + metric.color,
          }}
        >
          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', margin: 0, textTransform: 'uppercase' }}>
            {metric.label}
          </p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: metric.color, margin: 0 }}>
            {metric.value}
          </p>
        </div>
      ))}

      {/* Health Status Breakdown */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', borderTop: '4px solid #1a1a1a' }}>
        <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
          Deal Health
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>On Track</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>{healthBreakdown.onTrack}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Needs Attention</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#F59E0B' }}>{healthBreakdown.needsAttention}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>At Risk</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444' }}>{healthBreakdown.atRisk}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Breakdown */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', borderTop: '4px solid #1a1a1a' }}>
        <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
          Pipeline Stages
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Demo</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0047FF' }}>{stageBreakdown.demo}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>POC</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#7C3AED' }}>{stageBreakdown.poc}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Validation</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#F59E0B' }}>{stageBreakdown.validation}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Closed</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>{stageBreakdown.closed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
