'use client';

import Link from 'next/link';

interface DealIntelligenceCardProps {
  deal: {
    id: number;
    name: string;
    amount: number | null;
    stage: string | null;
    status: string | null;
    lastActivityAt: string | null;
  };
  intelligence?: {
    healthScore: number;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    momentum: 'positive' | 'neutral' | 'negative';
    signals: {
      contactEngagement: Array<{
        contactName: string;
        engagementLevel: 'engaged' | 'moderate' | 'silent';
        daysSinceLastContact?: number;
        riskFactors: string[];
      }>;
      activityTrend: {
        last7Days: number;
        daysWithoutActivity: number;
        trendDirection: 'up' | 'flat' | 'down';
      };
      milestoneVelocity: {
        daysAheadBehind: number;
        velocityTrend: 'accelerating' | 'stable' | 'decelerating';
      };
    };
    reasoning: {
      keyInsights: string[];
      concernsAndOpportunities: {
        concerns: string[];
      };
    };
  };
}

/**
 * DealIntelligenceCard Component
 * Displays deal intelligence in a compact card format
 * Shows health score, risk level, key insights, and recommended actions
 */
export default function DealIntelligenceCard({
  deal,
  intelligence,
}: DealIntelligenceCardProps) {
  if (!intelligence) {
    return (
      <Link href={`/deals/${deal.id}`}>
        <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition cursor-pointer">
          <h3 className="font-semibold text-slate-900">{deal.name}</h3>
          <p className="text-sm text-slate-600">Loading intelligence...</p>
        </div>
      </Link>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      default:
        return '→';
    }
  };

  const silentContacts = intelligence.signals.contactEngagement.filter(
    (c) => c.engagementLevel === 'silent'
  );

  const primaryConcern = intelligence.reasoning.concernsAndOpportunities.concerns[0];
  const primaryInsight = intelligence.reasoning.keyInsights[0];

  return (
    <Link href={`/deals/${deal.id}`}>
      <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition cursor-pointer h-full">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{deal.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {deal.stage && <span className="inline-block bg-slate-100 px-2 py-1 rounded mr-2">{deal.stage}</span>}
            {deal.amount && (
              <span className="font-semibold text-slate-700">${(deal.amount / 1000).toFixed(0)}K</span>
            )}
          </p>
        </div>

        {/* Health & Risk Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Health Score */}
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={
                    intelligence.healthScore >= 75
                      ? '#10b981'
                      : intelligence.healthScore >= 50
                        ? '#f59e0b'
                        : '#ef4444'
                  }
                  strokeWidth="3"
                  strokeDasharray={`${(intelligence.healthScore / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-900">
                  {intelligence.healthScore}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Health</p>
              <p className="text-sm font-semibold text-slate-900">Score</p>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className="flex flex-col justify-center">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold text-center border ${getRiskColor(intelligence.riskLevel)}`}
            >
              {intelligence.riskLevel.toUpperCase()}
            </span>
            <p className="text-xs text-slate-500 mt-1 text-center">Risk</p>
          </div>
        </div>

        {/* Momentum */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">{getMomentumIcon(intelligence.momentum)}</span>
          <div>
            <p className="text-xs text-slate-500">Momentum</p>
            <p className="text-sm font-semibold text-slate-900 capitalize">
              {intelligence.momentum}
            </p>
          </div>
        </div>

        {/* Key Insights */}
        {primaryInsight && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-900 line-clamp-2">{primaryInsight}</p>
          </div>
        )}

        {/* Concerns */}
        {primaryConcern && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs text-amber-900 line-clamp-2">⚠️ {primaryConcern}</p>
          </div>
        )}

        {/* Silent Stakeholders */}
        {silentContacts.length > 0 && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-900">
              🔇 {silentContacts.length} silent{' '}
              {silentContacts.length === 1 ? 'contact' : 'contacts'}
            </p>
            <ul className="text-xs text-red-800 mt-1">
              {silentContacts.slice(0, 2).map((contact) => (
                <li key={contact.contactName}>• {contact.contactName}</li>
              ))}
              {silentContacts.length > 2 && (
                <li>• +{silentContacts.length - 2} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Activity Status */}
        <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
          <p>
            Last activity:{' '}
            {deal.lastActivityAt
              ? new Date(deal.lastActivityAt).toLocaleDateString()
              : 'Never'}
          </p>
          <p>
            Activity this week: {intelligence.signals.activityTrend.last7Days}{' '}
            events
          </p>
        </div>

        {/* CTA */}
        <button className="w-full mt-3 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 font-medium">
          View Intelligence
        </button>
      </div>
    </Link>
  );
}
