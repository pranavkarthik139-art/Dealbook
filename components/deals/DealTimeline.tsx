'use client';

import { formatDistanceToNow } from 'date-fns';
import { CallActivityItem } from './CallActivityItem';

interface Activity {
  id: number;
  action: string;
  description?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface Call {
  id: number;
  title: string;
  callDate: string;
  durationMinutes?: number;
  attendees: string[];
  notes?: string;
  gongDescription?: string;
  gongInsightSummary?: string;
  gongRiskLevel?: string;
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

interface DealTimelineProps {
  activities?: Activity[];
  calls?: Call[];
  onUpdateGongDescription?: (callId: number, description: string) => Promise<void>;
}

export function DealTimeline({
  activities = [],
  calls = [],
  onUpdateGongDescription
}: DealTimelineProps) {
  // Combine and sort all items by date
  const allItems = [
    ...activities.map(a => ({ type: 'activity', item: a, date: new Date(a.createdAt) })),
    ...calls.map(c => ({ type: 'call', item: c, date: new Date(c.callDate) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (allItems.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-line p-6">
        <h3 className="font-medium text-ink mb-4">Activity Timeline</h3>
        <p className="text-sm text-ink-lighter text-center py-8">
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-line p-6">
      <h3 className="font-medium text-ink mb-6">Activity Timeline</h3>

      <div className="space-y-4">
        {allItems.map((item) => {
          if (item.type === 'activity') {
            const activity = item.item as Activity;
            return (
              <div key={`activity-${activity.id}`} className="flex gap-4 pb-4 border-b border-line last:border-b-0">
                {/* Icon */}
                <div className="text-xl flex-shrink-0 mt-1">
                  {ACTION_ICONS[activity.action] || ACTION_ICONS.default}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">
                    {activity.description || formatActionType(activity.action)}
                  </p>
                  <p className="text-xs text-ink-lighter mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          } else {
            const call = item.item as Call;
            return (
              <div key={`call-${call.id}`} className="pb-4 border-b border-line last:border-b-0">
                <CallActivityItem
                  call={call}
                  onUpdateGongDescription={onUpdateGongDescription || (() => Promise.resolve())}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

function formatActionType(action: string): string {
  const labels: Record<string, string> = {
    deal_created: 'Deal created',
    deal_updated: 'Deal updated',
    todo_created: 'To-do created',
    todo_completed: 'To-do completed',
    call_scheduled: 'Call scheduled',
    status_changed: 'Status changed',
    email_received: 'Email received',
    email_sent: 'Email sent',
    proposal_sent: 'Proposal sent',
    demo_completed: 'Demo completed',
    meeting_scheduled: 'Meeting scheduled',
  };
  return labels[action] || action;
}
