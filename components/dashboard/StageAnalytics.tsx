'use client';

import { useEffect, useState } from 'react';

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
    { name: 'Demo', color: '#0047FF', count: stageBreakdown.demo, value: stageValues.demo },
    { name: 'POC', color: '#7C3AED', count: stageBreakdown.poc, value: stageValues.poc },
    { name: 'Validation', color: '#F59E0B', count: stageBreakdown.validation, value: stageValues.validation },
    { name: 'Closed', color: '#10B981', count: stageBreakdown.closed, value: stageValues.closed },
  ];

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
        Pipeline Breakdown
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stages.map((stage) => (
          <div key={stage.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: stage.color }} />
                <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{stage.name}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>{stage.count} deals</span>
            </div>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
              ${(stage.value / 1000000).toFixed(2)}M
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
