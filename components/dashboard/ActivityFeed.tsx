'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: number;
  action: string;
  description: string;
  deal?: { name: string } | null;
  createdAt: string;
}

const actionIcons: Record<string, string> = {
  deal_created: '✨',
  deal_updated: '🔄',
  todo_created: '📝',
  todo_completed: '✓',
  call_scheduled: '📞',
  default: '•',
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activity?limit=15');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div className="h-40 flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div>
      <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">Activity Feed</h2>
      <Card>
        {activities.length === 0 ? (
          <p className="text-slate-600 text-center py-8">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0 text-lg">
                  {actionIcons[activity.action] || actionIcons.default}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">
                    {activity.description}
                    {activity.deal && (
                      <span className="font-medium ml-1">{activity.deal.name}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
