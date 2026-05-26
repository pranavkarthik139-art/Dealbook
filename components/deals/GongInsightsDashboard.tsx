'use client';

import React, { useEffect, useState } from 'react';
import { GongInsightCard } from './GongInsightCard';

interface GongInsight {
  id: number;
  dealId: number;
  callBrief: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskDescription?: string;
  nextSteps: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Deal {
  id: number;
  name: string;
}

interface GongInsightsDashboardProps {
  deals: Deal[];
}

// Mock data for demo - replace with real API data once database is ready
const MOCK_INSIGHTS: GongInsight[] = [
  {
    id: 1,
    dealId: 1,
    callBrief:
      'Customer discussed POC timeline and requirements. Legal team has concerns about data residency and compliance. Champion (John) is engaged and wants to move forward. CTO is still evaluating technical feasibility.',
    riskLevel: 'medium',
    riskDescription: 'Legal blocker on data residency. Needs to be resolved before POC.',
    nextSteps:
      '• Send legal data sheet and compliance documentation\n• Schedule follow-up with legal team\n• Prepare technical architecture overview for CTO',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    dealId: 2,
    callBrief:
      'Initial discovery call with VP of Engineering. Strong interest in the product. Budget is approved for Q2. Wants to start POC next month.',
    riskLevel: 'low',
    riskDescription: 'No blockers identified. Deal is moving forward.',
    nextSteps:
      '• Send proposal with POC terms\n• Schedule technical kick-off meeting\n• Confirm POC timeline and success criteria',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export function GongInsightsDashboard({ deals }: GongInsightsDashboardProps) {
  const [insights, setInsights] = useState<GongInsight[]>(MOCK_INSIGHTS);
  const [loading, setLoading] = useState(false);

  // For demo: using mock Gong insights
  // In production, this would fetch real insights from the API:
  // const response = await fetch(`/api/deals/${deal.id}/insights`);
  // const data = await response.json();
  // const insights = data.insights;
  // Then sync to Salesforce via:
  // await fetch(`/api/gong/insights/${insight.id}/approve`, { method: 'POST' });

  useEffect(() => {
    setLoading(false);
  }, [deals]);

  const pendingInsights = insights.filter(i => i.status === 'pending');

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
    <div style={{
      marginBottom: '32px',
      padding: '24px',
      backgroundColor: '#fff8f0',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid #fde0cc',
    }}>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--theme-text-primary)',
        margin: '0 0 24px 0',
      }}>
        🎯 Gong Insights Pending Review ({pendingInsights.length})
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {pendingInsights.map(insight => (
          <GongInsightCard
            key={insight.id}
            insight={insight}
            dealId={insight.dealId}
            onSync={handleSync}
          />
        ))}
      </div>
    </div>
  );
}
