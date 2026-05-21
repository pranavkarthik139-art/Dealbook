'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';

interface Deal {
  id: number;
  amount?: number;
  stage?: string;
  status?: string;
}

export function StageAnalytics() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const stageBreakdown = {
    demo: deals.filter(d => d.stage === 'demo').length,
    poc: deals.filter(d => d.stage === 'poc').length,
    validation: deals.filter(d => d.stage === 'validation').length,
    closed: deals.filter(d => d.stage === 'closed').length,
  };

  const stageValues = {
    demo: deals.filter(d => d.stage === 'demo').reduce((sum, d) => sum + (d.amount || 0), 0),
    poc: deals.filter(d => d.stage === 'poc').reduce((sum, d) => sum + (d.amount || 0), 0),
    validation: deals.filter(d => d.stage === 'validation').reduce((sum, d) => sum + (d.amount || 0), 0),
    closed: deals.filter(d => d.stage === 'closed').reduce((sum, d) => sum + (d.amount || 0), 0),
  };

  const stages = [
    { name: 'Demo', color: 'var(--cobalt)', count: stageBreakdown.demo, value: stageValues.demo },
    { name: 'POC', color: '#7C3AED', count: stageBreakdown.poc, value: stageValues.poc },
    { name: 'Validation', color: 'var(--warning)', count: stageBreakdown.validation, value: stageValues.validation },
    { name: 'Closed', color: 'var(--success)', count: stageBreakdown.closed, value: stageValues.closed },
  ];

  if (loading) {
    return (
      <Card>
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Spinner />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--ink-lighter)',
        fontWeight: 600,
        margin: '0 0 var(--space-6) 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Pipeline Breakdown
      </p>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      }}>
        {stages.map((stage) => (
          <div key={stage.name}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: stage.color,
                  flexShrink: 0
                }} />
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-light)',
                  fontWeight: 500
                }}>{stage.name}</span>
              </div>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--ink)'
              }}>{stage.count} deals</span>
            </div>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-lighter)',
              margin: 0,
              marginLeft: 'calc(12px + var(--space-2))'
            }}>
              ${(stage.value / 1000000).toFixed(2)}M
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
