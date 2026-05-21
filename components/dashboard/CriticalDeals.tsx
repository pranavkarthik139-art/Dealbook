'use client';

import React, { useEffect, useState } from 'react';

interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
  healthScore?: number;
  lastActivityAt?: string | null;
}

export function CriticalDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        // Filter deals with health score < 50 (at risk) or no recent activity
        const critical = (data.deals || [])
          .filter((d: Deal) => (d.healthScore || 100) < 50)
          .slice(0, 5);
        setDeals(critical);
      } catch (error) {
        console.error('Failed to fetch critical deals:', error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const getRiskColor = (healthScore?: number) => {
    if (!healthScore || healthScore < 30) return { bg: '#fee2e2', text: '#dc2626', label: 'Critical' };
    if (healthScore < 50) return { bg: '#fef3c7', text: '#d97706', label: 'At Risk' };
    return { bg: '#d1fae5', text: '#059669', label: 'Healthy' };
  };

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: '0 0 var(--space-4) 0'
      }}>🚨 Critical Deals</h2>

      {loading ? (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--ink-lighter)',
          fontSize: 'var(--text-sm)'
        }}>Loading...</div>
      ) : deals.length === 0 ? (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--ink-lighter)',
          fontSize: 'var(--text-sm)',
          backgroundColor: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)'
        }}>
          All deals are healthy! 🎉
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}>
          {deals.map((deal) => {
            const risk = getRiskColor(deal.healthScore);
            return (
              <div
                key={deal.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--paper)',
                  border: `1px solid ${risk.text}33`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  gap: 'var(--space-3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Risk badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: risk.bg,
                    color: risk.text,
                    fontWeight: 700,
                    fontSize: 'var(--text-xs)',
                    flexShrink: 0
                  }}
                >
                  {Math.round(deal.healthScore || 0)}
                </div>

                {/* Deal info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 600,
                    color: 'var(--ink)',
                    margin: '0 0 2px 0',
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {deal.name}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--ink-lighter)',
                    margin: 0
                  }}>
                    {deal.stage} • {deal.amount ? `$${(deal.amount / 1000).toFixed(0)}k` : 'TBD'}
                  </p>
                </div>

                {/* Status badge */}
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius)',
                    backgroundColor: risk.bg,
                    color: risk.text,
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {risk.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
