'use client';

import { useEffect, useState } from 'react';

interface StatusData {
  status: string;
  count: number;
  value: number;
  avgHealth: number;
  percentage: string;
}

export function StatusBreakdown() {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDeals, setTotalDeals] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/reports/status');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();
        setData(result.statuses || []);
        setTotalDeals(result.totalDeals || 0);
      } catch (error) {
        console.error('Failed to fetch status data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !data || data.length === 0) {
    return <div className="text-center py-8 text-ink-lighter">{loading ? 'Loading...' : 'No data available'}</div>;
  }

  const statusColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    active: { bg: 'bg-emerald-50', border: 'border-emerald', text: 'text-emerald', dot: 'bg-emerald' },
    closed: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', dot: 'bg-blue-500' },
    on_hold: { bg: 'bg-amber-50', border: 'border-amber', text: 'text-amber', dot: 'bg-amber' },
    lost: { bg: 'bg-red-50', border: 'border-red', text: 'text-red', dot: 'bg-red' },
  };

  const statusLabels: Record<string, string> = {
    active: 'Active',
    closed: 'Closed',
    on_hold: 'On Hold',
    lost: 'Lost',
  };

  return (
    <div className="bg-white rounded-lg border border-line p-6">
      <h3 className="font-semibold text-ink mb-6">Deal Status Distribution</h3>

      <div className="space-y-4">
        {data.map(status => {
          const colors = statusColors[status.status] || statusColors.active;
          const healthColor = status.avgHealth >= 70 ? 'text-emerald' : status.avgHealth >= 50 ? 'text-amber' : 'text-red';

          return (
            <div key={status.status} className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <h4 className={`font-semibold ${colors.text}`}>{statusLabels[status.status]}</h4>
                </div>
                <div className="text-right">
                  <div className="font-bold text-ink">{status.count}</div>
                  <div className="text-xs text-ink-lighter">{status.percentage}% of total</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm mt-3">
                <span className="text-ink-lighter">Value: ${(status.value / 1000).toFixed(0)}k</span>
                <span className={`text-xs font-medium ${healthColor}`}>
                  Avg health: {status.avgHealth}/100
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-white bg-opacity-50 rounded-full overflow-hidden">
                <div
                  style={{ width: `${parseFloat(status.percentage)}%` }}
                  className={`h-full ${colors.dot} opacity-70`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-line mt-4">
        <div className="text-sm text-ink-lighter">
          Total deals: <span className="font-semibold text-ink">{totalDeals}</span>
        </div>
      </div>
    </div>
  );
}
