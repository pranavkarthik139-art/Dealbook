'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityData {
  days: number;
  totalActivities: number;
  activityByDay: Array<{ date: string; count: number }>;
  actionBreakdown: Record<string, number>;
  mostActiveDeals: Array<{ dealId: number; dealName: string; activityCount: number }>;
}

const ACTION_ICONS: Record<string, string> = {
  deal_created: '✨',
  deal_updated: '🔄',
  todo_created: '📝',
  todo_completed: '✓',
  call_scheduled: '📞',
  status_changed: '🔀',
  email_received: '📧',
  email_sent: '📤',
  proposal_sent: '📎',
  demo_completed: '🎯',
  meeting_scheduled: '📅',
  default: '📌',
};

export function ActivityReport() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/reports/activity?days=${days}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [days]);

  if (loading || !data) {
    return <div className="text-center py-8 text-ink-lighter">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Activity Summary */}
      <div className="bg-white rounded-lg border border-line p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">Activity Summary</h3>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg text-sm bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-cobalt">{data.totalActivities}</div>
            <div className="text-xs text-ink-lighter mt-1">Activities in {data.days} days</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald">
              {data.totalActivities > 0 ? Math.round(data.totalActivities / data.days) : 0}
            </div>
            <div className="text-xs text-ink-lighter mt-1">Avg per day</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber">{data.mostActiveDeals.length}</div>
            <div className="text-xs text-ink-lighter mt-1">Active deals</div>
          </div>
        </div>
      </div>

      {/* Action Breakdown */}
      <div className="bg-white rounded-lg border border-line p-6">
        <h3 className="font-semibold text-ink mb-4">Activity Types</h3>
        <div className="space-y-2">
          {Object.entries(data.actionBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{ACTION_ICONS[action] || ACTION_ICONS.default}</span>
                  <span className="text-sm capitalize text-ink">
                    {action.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-sm font-medium text-ink">{count}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Most Active Deals */}
      {data.mostActiveDeals.length > 0 && (
        <div className="bg-white rounded-lg border border-line p-6">
          <h3 className="font-semibold text-ink mb-4">Most Active Deals</h3>
          <div className="space-y-3">
            {data.mostActiveDeals.map((deal, idx) => (
              <div key={deal.dealId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-cobalt w-5">{idx + 1}</div>
                  <div>
                    <a
                      href={`/deals/${deal.dealId}`}
                      className="text-sm font-medium text-cobalt hover:underline"
                    >
                      {deal.dealName}
                    </a>
                  </div>
                </div>
                <div className="text-sm font-medium text-ink">{deal.activityCount} activities</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
