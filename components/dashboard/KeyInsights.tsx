'use client';

import React, { useEffect, useState } from 'react';

interface Insight {
  id: string;
  type: 'stalled' | 'new' | 'closing_soon' | 'high_value';
  title: string;
  description: string;
  icon: string;
  color: string;
  action?: string;
}

export function KeyInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        // Fetch deals and generate insights
        const response = await fetch('/api/deals');
        const data = await response.json();
        const deals = data.deals || [];

        const generatedInsights: Insight[] = [];

        // Check for stalled deals
        const stalledCount = deals.filter((d: any) => {
          if (!d.lastActivityAt) return true;
          const daysSinceActivity = Math.floor((Date.now() - new Date(d.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceActivity > 7;
        }).length;

        if (stalledCount > 0) {
          generatedInsights.push({
            id: 'stalled',
            type: 'stalled',
            title: `${stalledCount} deal${stalledCount > 1 ? 's' : ''} stalled`,
            description: `${stalledCount} deal${stalledCount > 1 ? 's' : ''} without activity for 7+ days`,
            icon: '⏸️',
            color: 'var(--error)',
            action: 'Review & follow up'
          });
        }

        // Check for new deals
        const newDeals = deals.filter((d: any) => {
          const daysOld = Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          return daysOld <= 7;
        }).length;

        if (newDeals > 0) {
          generatedInsights.push({
            id: 'new',
            type: 'new',
            title: `${newDeals} new deal${newDeals > 1 ? 's' : ''}`,
            description: `Recently added to your pipeline`,
            icon: '✨',
            color: 'var(--success)',
            action: 'Get started'
          });
        }

        // Check for high-value deals
        const highValue = deals.filter((d: any) => (d.amount || 0) > 300000).length;
        if (highValue > 0) {
          generatedInsights.push({
            id: 'high_value',
            type: 'high_value',
            title: `${highValue} deal${highValue > 1 ? 's' : ''} >$300K`,
            description: `High-priority revenue opportunities`,
            icon: '💰',
            color: 'var(--cobalt)',
            action: 'Prioritize'
          });
        }

        // Total active deals
        const activeCount = deals.filter((d: any) => d.status !== 'lost').length;
        generatedInsights.push({
          id: 'total',
          type: 'closing_soon',
          title: `${activeCount} active deals`,
          description: `Currently in pipeline, total pipeline value`,
          icon: '📊',
          color: 'var(--warning)',
          action: 'View all'
        });

        setInsights(generatedInsights.slice(0, 3)); // Show top 3 insights
      } catch (error) {
        console.error('Failed to generate insights:', error);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, []);

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: '0 0 var(--space-4) 0'
      }}>💡 Key Insights</h2>

      {loading ? (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--ink-lighter)',
          fontSize: 'var(--text-sm)'
        }}>Generating insights...</div>
      ) : insights.length === 0 ? (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--ink-lighter)',
          fontSize: 'var(--text-sm)',
          backgroundColor: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)'
        }}>
          No critical insights right now
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}>
          {insights.map((insight) => (
            <div
              key={insight.id}
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--paper)',
                border: `1px solid ${insight.color}33`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                borderLeft: `4px solid ${insight.color}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)'
              }}>
                <span style={{
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {insight.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontWeight: 600,
                    color: insight.color,
                    margin: '0 0 2px 0',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {insight.title}
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--ink-lighter)',
                    margin: '0 0 var(--space-2) 0'
                  }}>
                    {insight.description}
                  </p>
                  {insight.action && (
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      color: insight.color,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      {insight.action} →
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
