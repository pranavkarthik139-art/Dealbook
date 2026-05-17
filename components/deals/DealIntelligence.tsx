'use client';

import { useMemo } from 'react';
import { analyzeDeal, DealIntelligence as DealIntelligenceType } from '@/lib/dealIntelligence';

interface DealIntelligenceProps {
  deal: {
    id: number;
    name: string;
    stage?: string;
    status?: string;
    createdAt: string;
    lastActivityAt?: string | null;
    todos?: Array<{ completed: boolean }>;
    contacts?: Array<{ id: number }>;
    calendarEvents?: Array<{ id: number }>;
    stall?: {
      isStalled: boolean;
      daysStalled: number;
      risk: string;
    };
  };
  health: number;
}

const MOMENTUM_ICONS: Record<string, string> = {
  positive: '📈',
  neutral: '➡️',
  negative: '📉',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red border-red bg-red-50',
  medium: 'text-amber border-amber bg-amber-50',
  low: 'text-slate-500 border-line bg-slate-50',
};

export function DealIntelligence({ deal, health }: DealIntelligenceProps) {
  const analysis = useMemo(() => {
    return analyzeDeal({
      id: deal.id,
      name: deal.name,
      stage: deal.stage,
      status: deal.status,
      health,
      lastActivityAt: deal.lastActivityAt,
      createdAt: deal.createdAt,
      contactCount: deal.contacts?.length || 0,
      upcomingCalls: deal.calendarEvents?.length || 0,
      completedTodos: deal.todos?.filter(t => t.completed).length || 0,
      totalTodos: deal.todos?.length || 0,
      stalled: deal.stall,
    });
  }, [deal, health]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red text-red';
      case 'high':
        return 'bg-amber-50 border-amber text-amber';
      case 'medium':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      default:
        return 'bg-green-50 border-green text-green';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div className={`rounded-lg border p-6 ${getRiskLevelColor(analysis.riskLevel)}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Deal Health</h3>
            <p className="text-sm opacity-75 mt-1">
              {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)} Risk
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{analysis.riskScore}</div>
            <div className="text-xs opacity-75">/ 100</div>
          </div>
        </div>

        {/* Risk Factors */}
        {analysis.riskReasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Risk Factors:</p>
            <ul className="text-sm space-y-1 opacity-90">
              {analysis.riskReasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-xs mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Momentum */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span>{MOMENTUM_ICONS[analysis.momentum]}</span>
          <span className="font-medium">
            {analysis.momentum.charAt(0).toUpperCase() + analysis.momentum.slice(1)} Momentum
          </span>
        </div>
      </div>

      {/* Next Actions */}
      {analysis.nextActions.length > 0 && (
        <div className="bg-white rounded-lg border border-line p-6">
          <h3 className="font-semibold text-ink mb-4">Recommended Next Steps</h3>
          <div className="space-y-3">
            {analysis.nextActions.map((action, i) => (
              <div
                key={i}
                className={`rounded-lg border p-4 ${PRIORITY_COLORS[action.priority]}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{action.action}</h4>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-white bg-opacity-60">
                    {action.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm opacity-90 mb-2">{action.reason}</p>
                {action.template && (
                  <p className="text-xs italic opacity-75 pt-2 border-t border-current border-opacity-20">
                    💡 {action.template}
                  </p>
                )}
                {action.suggestedDate && (
                  <p className="text-xs opacity-75 mt-2">
                    Suggested: {action.suggestedDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Actions Needed */}
      {analysis.nextActions.length === 0 && (
        <div className="bg-green-50 rounded-lg border border-green p-6 text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-green font-medium">Deal on track</p>
          <p className="text-sm text-green opacity-75 mt-1">
            No immediate actions needed. Keep momentum going.
          </p>
        </div>
      )}

      {/* Follow-Up Timing */}
      <div className="bg-slate-50 rounded-lg border border-line p-4">
        <p className="text-sm text-ink-lighter">
          <span className="font-medium text-ink">Suggested follow-up:</span> In{' '}
          <span className="font-medium text-ink">{analysis.suggestedFollowUpDays} day{analysis.suggestedFollowUpDays > 1 ? 's' : ''}</span>
        </p>
      </div>
    </div>
  );
}
