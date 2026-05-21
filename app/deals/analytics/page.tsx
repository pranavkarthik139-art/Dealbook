'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
  status?: string;
  lastActivityAt?: string | null;
}

interface Analytics {
  totalDeals: number;
  totalValue: number;
  avgDealSize: number;
  byStage: Record<string, { count: number; value: number }>;
  byStatus: Record<string, number>;
  stalledDeals: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        const deals: Deal[] = data.deals || [];

        // Calculate analytics
        const totalValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
        const byStage: Record<string, { count: number; value: number }> = {};
        const byStatus: Record<string, number> = {};
        let stalledCount = 0;

        deals.forEach((deal) => {
          // By stage
          if (deal.stage) {
            if (!byStage[deal.stage]) byStage[deal.stage] = { count: 0, value: 0 };
            byStage[deal.stage].count++;
            byStage[deal.stage].value += deal.amount || 0;
          }

          // By status
          if (deal.status) {
            byStatus[deal.status] = (byStatus[deal.status] || 0) + 1;
          }

          // Stalled deals
          if (deal.lastActivityAt) {
            const days = Math.floor((Date.now() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
            if (days > 7) stalledCount++;
          }
        });

        setAnalytics({
          totalDeals: deals.length,
          totalValue,
          avgDealSize: deals.length > 0 ? totalValue / deals.length : 0,
          byStage,
          byStatus,
          stalledDeals: stalledCount,
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Failed to load analytics</div>;
  }

  const stages = Object.entries(analytics.byStage).sort((a, b) => b[1].value - a[1].value);
  const maxValue = Math.max(...stages.map(([_, data]) => data.value), 1);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/deals" style={{ color: 'var(--cobalt)', textDecoration: 'none', fontSize: '14px', marginBottom: '16px', display: 'block' }}>
          ← Back to Deals
        </Link>
        <h1 style={{ fontSize: '32px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--ink)', margin: 0, marginBottom: '8px' }}>
          Pipeline Analytics
        </h1>
        <p style={{ color: 'var(--ink-lighter)', margin: 0 }}>Overview of your deal pipeline</p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard
          label="Total Pipeline"
          value={`$${(analytics.totalValue / 1000000).toFixed(1)}M`}
          subtext={`${analytics.totalDeals} deals`}
        />
        <MetricCard
          label="Avg Deal Size"
          value={`$${(analytics.avgDealSize / 1000).toFixed(0)}k`}
          subtext="Average amount"
        />
        <MetricCard
          label="Stalled Deals"
          value={analytics.stalledDeals.toString()}
          subtext="No activity > 7 days"
          alert={analytics.stalledDeals > 0}
        />
        <MetricCard
          label="Active Deals"
          value={(analytics.totalDeals - analytics.stalledDeals).toString()}
          subtext="Moving forward"
        />
      </div>

      {/* Pipeline by Stage */}
      <div style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 24px 0' }}>
          Pipeline by Stage
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {stages.map(([stage, data]) => (
            <div key={stage}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textTransform: 'capitalize' }}>
                  {stage}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--ink-light)' }}>
                  ${(data.value / 1000000).toFixed(1)}M ({data.count})
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  width: `${(data.value / maxValue) * 100}%`,
                  height: '24px',
                  backgroundColor: getStageColor(stage),
                  borderRadius: '4px',
                  minWidth: '2%',
                  transition: 'all 300ms ease',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 24px 0' }}>
          Deals by Status
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {Object.entries(analytics.byStatus).map(([status, count]) => (
            <div
              key={status}
              style={{
                padding: '16px',
                backgroundColor: 'var(--paper-alt)',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cobalt)', marginBottom: '4px' }}>
                {count}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-lighter)', textTransform: 'capitalize' }}>
                {status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext, alert }: { label: string; value: string; subtext: string; alert?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: `1px solid ${alert ? 'var(--red)' : 'var(--line)'}`,
        borderRadius: '8px',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--ink-lighter)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: alert ? 'var(--red)' : 'var(--cobalt)', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--ink-lighter)' }}>
        {subtext}
      </div>
    </div>
  );
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    demo: 'var(--cobalt)',
    poc: 'var(--amber)',
    validation: 'var(--green)',
    closed: 'var(--green)',
  };
  return colors[stage] || 'var(--cobalt)';
}
