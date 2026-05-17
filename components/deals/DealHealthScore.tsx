'use client';

import { calculateDealHealth, getHealthStatus, getHealthReason } from '@/lib/dealHealth';

interface Deal {
  id: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
  status?: string;
  stage?: string;
  todos?: Array<{ completed: boolean }>;
  calendarEvents?: Array<{ startTime: string }>;
}

export function DealHealthScore({ deal }: { deal: Deal }) {
  const health = calculateDealHealth(deal);
  const status = getHealthStatus(health);
  const reason = getHealthReason(deal);

  return (
    <div className="bg-white rounded-lg border border-line p-6">
      <h3 className="font-medium text-ink mb-6">Deal Health</h3>

      {/* Health Score Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative h-32 w-32">
          <svg className="transform -rotate-90 h-32 w-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={status.color === 'green' ? 'var(--green)' : status.color === 'amber' ? 'var(--amber)' : 'var(--red)'}
              strokeWidth="8"
              strokeDasharray={`${(health / 100) * 351.86} 351.86`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className={`text-4xl font-bold ${status.colorClass}`}>{health}</p>
              <p className="text-xs text-ink-lighter">/ 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-6">
        <p className={`text-sm font-semibold ${status.colorClass} mb-2`}>
          {status.label}
        </p>
        <p className="text-xs text-ink-lighter">{reason}</p>
      </div>

      {/* Risk Flags */}
      {deal.status === 'lost' && (
        <div className="p-3 bg-red-light rounded-lg mb-4">
          <p className="text-xs text-red font-medium">🚨 Deal marked as lost</p>
        </div>
      )}

      {deal.status === 'on_hold' && (
        <div className="p-3 bg-amber-light rounded-lg mb-4">
          <p className="text-xs text-amber font-medium">⏸️ Deal on hold</p>
        </div>
      )}
    </div>
  );
}
