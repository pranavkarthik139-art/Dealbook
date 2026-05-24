'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Spinner } from '../common/Spinner';

interface IntelligenceAlertsProps {
  dealId: number;
}

/**
 * IntelligenceAlerts Component
 * Displays deal intelligence attributes: risk, momentum, velocity, engagement
 * Clean, minimal design that integrates with deal metadata
 */
export function IntelligenceAlerts({ dealId }: IntelligenceAlertsProps) {
  const theme = useTheme();
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}/intelligence`);
        if (!response.ok) throw new Error('Failed to fetch intelligence');

        const data = await response.json();
        setIntelligence(data.intelligence);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch intelligence');
        console.error('Error fetching intelligence:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntelligence();
  }, [dealId]);

  if (loading) {
    return (
      <div className="flex justify-center py-3">
        <Spinner />
      </div>
    );
  }

  if (error || !intelligence) {
    return null;
  }

  const silentContacts = intelligence.signals.contactEngagement.filter(
    (c: any) => c.engagementLevel === 'silent'
  );

  const engagedContacts = intelligence.signals.contactEngagement.filter(
    (c: any) => c.engagementLevel === 'engaged'
  );

  const textColor = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const labelColor = theme === 'dark' ? '#cbd5e1' : '#64748b';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'var(--line)';

  return (
    <div className="space-y-4">

      {/* Risk Attribute */}
      <div>
        <p style={{ color: labelColor }} className="text-xs font-semibold uppercase tracking-wide mb-1">Risk</p>
        <p style={{ color: textColor }} className="text-sm font-medium">{intelligence.riskLevel.charAt(0).toUpperCase() + intelligence.riskLevel.slice(1)} • {intelligence.riskScore}/100</p>
      </div>

      {/* Momentum Attribute */}
      <div>
        <p style={{ color: labelColor }} className="text-xs font-semibold uppercase tracking-wide mb-1">Momentum</p>
        <p style={{ color: textColor }} className="text-sm font-medium">
          {intelligence.momentum === 'positive'
            ? '📈 Accelerating'
            : intelligence.momentum === 'negative'
              ? '📉 Declining'
              : '→ Stable'}
        </p>
      </div>

      {/* Velocity Attribute */}
      <div>
        <p style={{ color: labelColor }} className="text-xs font-semibold uppercase tracking-wide mb-1">Activity Velocity</p>
        <p style={{ color: textColor }} className="text-sm font-medium">{intelligence.signals.activityTrend.last7DaysAverage.toFixed(1)} activities/day</p>
      </div>

      {/* Engagement Attribute */}
      <div>
        <p style={{ color: labelColor }} className="text-xs font-semibold uppercase tracking-wide mb-1">Engagement</p>
        <p style={{ color: textColor }} className="text-sm font-medium">{engagedContacts.length}/{intelligence.signals.contactEngagement.length} stakeholders engaged</p>
        {silentContacts.length > 0 && (
          <p style={{ color: labelColor }} className="text-xs mt-1">⚠️ {silentContacts.length} silent stakeholder{silentContacts.length > 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Key Insights - Compact */}
      {intelligence.reasoning.keyInsights && intelligence.reasoning.keyInsights.length > 0 && (
        <div style={{ borderTopColor: borderColor }} className="pt-2 border-t">
          <p style={{ color: labelColor }} className="text-xs font-semibold uppercase tracking-wide mb-2">Insights</p>
          <ul className="space-y-1">
            {intelligence.reasoning.keyInsights.slice(0, 2).map((insight: string, idx: number) => (
              <li key={idx} style={{ color: labelColor }} className="text-xs">{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
