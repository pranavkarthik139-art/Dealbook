'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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

  const handleCardClick = (status?: string) => {
    if (status) {
      router.push(`/deals?status=${status}`);
    } else {
      router.push('/deals');
    }
  };

  if (loading) {
    return <div className="h-32 flex items-center justify-center"><Spinner /></div>;
  }

  if (!summary) {
    return <Card>Failed to load deals summary</Card>;
  }

  const statCards = [
    { label: 'Total Deals', value: summary.total, variant: 'default' as const, status: undefined },
    { label: 'Active', value: summary.active, variant: 'active' as const, status: 'active' },
    { label: 'Closed', value: summary.closed, variant: 'closed' as const, status: 'closed' },
    { label: 'On Hold', value: summary.onHold, variant: 'on-hold' as const, status: 'on_hold' },
  ];

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: '0 0 var(--space-4) 0'
      }}>📊 Your Pipeline</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-6)',
        gridAutoColumns: 'minmax(0, 1fr)'
      }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            onClick={() => handleCardClick(stat.status)}
            style={{
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6) var(--space-5)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--cobalt-light)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              e.currentTarget.style.borderColor = 'var(--line)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Background accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, var(--cobalt-light), transparent)',
              opacity: 0.3,
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: 'var(--text-5xl)',
                fontWeight: 700,
                color: 'var(--cobalt)',
                marginBottom: 'var(--space-3)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums'
              }}>{stat.value}</div>
              <Badge variant={stat.variant}>{stat.label}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
