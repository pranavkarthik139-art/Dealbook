'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';

interface DealSummary {
  total: number;
  active: number;
  closed: number;
  onHold: number;
  lost: number;
}

export function DealsSnapshot() {
  const [summary, setSummary] = useState<DealSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/deals');
        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
        }
      } catch (error) {
        console.error('Failed to fetch deal summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="h-32 flex items-center justify-center"><Spinner /></div>;
  }

  if (!summary) {
    return <Card>Failed to load deals summary</Card>;
  }

  const statCards = [
    { label: 'Total Deals', value: summary.total, variant: 'default' as const },
    { label: 'Active', value: summary.active, variant: 'active' as const },
    { label: 'Closed', value: summary.closed, variant: 'closed' as const },
    { label: 'On Hold', value: summary.onHold, variant: 'on-hold' as const },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">Deals Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
              <Badge variant={stat.variant}>{stat.label}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
