'use client';

import { PipelineChart } from '@/components/reports/PipelineChart';
import { StatusBreakdown } from '@/components/reports/StatusBreakdown';
import { ActivityReport } from '@/components/reports/ActivityReport';
import { DealsNav } from '@/components/deals/DealsNav';

export default function InsightsPage() {
  return (
    <div style={{
      padding: '32px 24px',
      backgroundColor: 'var(--paper-bg)',
      minHeight: '100%'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 8px 0',
            fontFamily: '"Playfair Display", serif'
          }}>
            Deals & Insights
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--ink-lighter)',
            margin: 0
          }}>
            Pipeline overview, deal status, and activity metrics
          </p>
        </div>

        {/* Navigation Tabs */}
        <DealsNav />

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div>
            <PipelineChart />
          </div>
          <div>
            <StatusBreakdown />
          </div>
        </div>

        {/* Activity Report */}
        <div>
          <ActivityReport />
        </div>
      </div>
    </div>
  );
}
