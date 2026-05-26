'use client';

import React, { useEffect, useState } from 'react';
import { GongInsightCard } from './GongInsightCard';

interface GongInsight {
  id: number;
  callBrief: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskDescription?: string;
  nextSteps: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface GongInsightsPanelProps {
  dealId: number;
}

export function GongInsightsPanel({ dealId }: GongInsightsPanelProps) {
  const [insights, setInsights] = useState<GongInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}/insights`);
        if (response.ok) {
          const data = await response.json();
          setInsights(data.insights || []);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [dealId]);

  const pendingInsights = insights.filter(i => i.status === 'pending');

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: 'var(--theme-text-tertiary)',
        fontSize: 'var(--text-sm)',
      }}>
        Loading Gong insights...
      </div>
    );
  }

  if (pendingInsights.length === 0) {
    return null;
  }

  const handleSync = (insightId: number) => {
    setInsights(prev =>
      prev.map(i =>
        i.id === insightId ? { ...i, status: 'approved' } : i
      )
    );
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontSize: 'var(--text-lg)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--theme-text-primary)',
        margin: '0 0 16px 0',
      }}>
        🎯 Gong Insights to Review
      </h3>

      {pendingInsights.map(insight => (
        <GongInsightCard
          key={insight.id}
          insight={insight}
          dealId={dealId}
          onSync={handleSync}
        />
      ))}
    </div>
  );
}
