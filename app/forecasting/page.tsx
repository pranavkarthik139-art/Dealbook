'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ForecastData {
  totalDeals: number;
  totalValue: number;
  projectedRevenue: number;
  overallProbability: number;
  confidence: number;
  byStage: Record<
    string,
    {
      dealCount: number;
      totalValue: number;
      expectedValue: number;
      avgProbability: number;
    }
  >;
  metrics: {
    avgDealSize: number;
    avgProbability: number;
    stageDistribution: Array<{ stage: string; percentage: number }>;
  };
}

export default function ForecastingPage() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/forecasting/pipeline');
      const data = await response.json();

      if (data.success) {
        setForecast(data.forecast);
      } else {
        setError('Failed to load forecast');
      }
    } catch (err) {
      setError('Error loading forecast');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-lighter)' }}>
        Loading forecast...
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--red)' }}>
        {error || 'No forecast data'}
      </div>
    );
  }

  const stages = ['demo', 'poc', 'validation', 'closed'];
  const maxValue = Math.max(
    ...stages.map((s) => forecast.byStage[s]?.expectedValue || 0),
    1
  );

  const getStageColor = (stage: string): string => {
    const colors: Record<string, string> = {
      demo: '#6366f1',
      poc: '#f59e0b',
      validation: '#10b981',
      closed: '#10b981',
    };
    return colors[stage] || '#6366f1';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/deals"
          style={{
            color: 'var(--cobalt)',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '16px',
            display: 'block',
          }}
        >
          ← Back to Deals
        </Link>
        <h1
          style={{
            fontSize: '32px',
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: 0,
            marginBottom: '8px',
          }}
        >
          Pipeline Forecast
        </h1>
        <p style={{ color: 'var(--ink-lighter)', margin: 0 }}>
          Revenue projection and deal pipeline analysis
        </p>
      </div>

      {/* Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <MetricCard
          label="Total Pipeline"
          value={`$${(forecast.totalValue / 1000000).toFixed(1)}M`}
          subtext={`${forecast.totalDeals} deals`}
        />
        <MetricCard
          label="Projected Revenue"
          value={`$${(forecast.projectedRevenue / 1000000).toFixed(1)}M`}
          subtext={`Expected value (${forecast.overallProbability}% confidence)`}
          highlight
        />
        <MetricCard
          label="Forecast Confidence"
          value={`${forecast.confidence}%`}
          subtext="Based on recent activity"
        />
        <MetricCard
          label="Avg Deal Size"
          value={`$${(forecast.metrics.avgDealSize / 1000).toFixed(0)}k`}
          subtext={`Average: ${Math.round(forecast.metrics.avgProbability)}% probability`}
        />
      </div>

      {/* Pipeline by Stage */}
      <div
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 24px 0',
          }}
        >
          Pipeline by Stage
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {stages.map((stage) => {
            const stageData = forecast.byStage[stage];
            if (!stageData) return null;

            const percentage = (stageData.expectedValue / maxValue) * 100;
            const stageColor = getStageColor(stage);

            return (
              <div key={stage}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {stage}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--ink-lighter)',
                        marginLeft: '12px',
                      }}
                    >
                      {stageData.dealCount} deal{stageData.dealCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: 'var(--ink)' }}>
                      ${(stageData.expectedValue / 1000000).toFixed(2)}M expected
                    </span>
                    <span style={{ color: 'var(--ink-lighter)' }}>
                      (${(stageData.totalValue / 1000000).toFixed(2)}M total)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: '28px',
                    backgroundColor: 'var(--paper-alt)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: stageColor,
                      transition: 'width 300ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '12px',
                    }}
                  >
                    {percentage > 15 && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'white',
                        }}
                      >
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--ink-lighter)',
                  }}
                >
                  Avg probability: {stageData.avgProbability}% •{' '}
                  Per-deal: ${(stageData.expectedValue / Math.max(stageData.dealCount, 1) / 1000).toFixed(0)}k
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {forecast.metrics.stageDistribution.map((dist) => (
          <div
            key={dist.stage}
            style={{
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-lighter)',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {dist.stage}
            </p>
            <p
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: getStageColor(dist.stage),
                margin: 0,
              }}
            >
              {dist.percentage}%
            </p>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-lighter)',
                margin: '8px 0 0 0',
              }}
            >
              of deals
            </p>
          </div>
        ))}
      </div>

      {/* Legend & Notes */}
      <div
        style={{
          backgroundColor: 'var(--paper-alt)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '20px',
          fontSize: '13px',
          color: 'var(--ink-lighter)',
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: '0 0 12px 0', fontWeight: 600, color: 'var(--ink)' }}>
          About This Forecast
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>
            <strong>Total Pipeline:</strong> Sum of all deal amounts
          </li>
          <li>
            <strong>Projected Revenue:</strong> Pipeline × Average probability
          </li>
          <li>
            <strong>Confidence:</strong> Increases with recent activity (calls, emails, updates)
          </li>
          <li>
            <strong>Expected Value:</strong> Stage total × Average stage probability
          </li>
        </ul>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}

function MetricCard({ label, value, subtext, highlight }: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: `1px solid ${highlight ? 'var(--cobalt)' : 'var(--line)'}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: highlight ? 'var(--shadow)' : 'none',
      }}
    >
      <p
        style={{
          fontSize: '12px',
          color: 'var(--ink-lighter)',
          margin: '0 0 8px 0',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: highlight ? 'var(--cobalt)' : 'var(--ink)',
          margin: '0 0 4px 0',
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: '12px', color: 'var(--ink-lighter)', margin: 0 }}>
        {subtext}
      </p>
    </div>
  );
}
