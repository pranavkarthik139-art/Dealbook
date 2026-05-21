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
      <h2 style={{
        fontSize: 'var(--text-lg)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: '0 0 var(--space-6) 0'
      }}>Activity Feed</h2>
      <Card>
        {activities.length === 0 ? (
          <p style={{
            color: 'var(--ink-lighter)',
            textAlign: 'center',
            paddingTop: 'var(--space-8)',
            paddingBottom: 'var(--space-8)',
            margin: 0
          }}>No activity yet</p>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0
          }}>
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  paddingBottom: 'var(--space-3)',
                  paddingTop: 'var(--space-3)',
                  borderBottom: index < activities.length - 1 ? '1px solid var(--line-light)' : 'none',
                  fontSize: 'var(--text-lg)'
                }}
              >
                <div style={{
                  flexShrink: 0,
                  fontSize: 'var(--text-lg)'
                }}>
                  {actionIcons[activity.action] || actionIcons.default}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--ink)',
                    margin: 0,
                    lineHeight: 'var(--leading-normal)'
                  }}>
                    {activity.description}
                    {activity.deal && (
                      <span style={{
                        fontWeight: 600,
                        marginLeft: 'var(--space-2)'
                      }}>{activity.deal.name}</span>
                    )}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--ink-lighter)',
                    marginTop: 'var(--space-1)',
                    margin: 'var(--space-1) 0 0 0'
                  }}>
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
