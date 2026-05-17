'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { formatDistanceToNow } from 'date-fns';

interface CalendarEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  deal?: { id: number; name: string } | null;
}

export function TodaysFocus() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        // Get today and tomorrow in UTC to avoid timezone issues
        const now = new Date();
        const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        const endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + 1);

        // First sync with Google Calendar
        try {
          const syncResponse = await fetch('/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            }),
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            setSynced(syncData.success === true);
          }
        } catch (error) {
          console.error('Failed to sync calendar:', error);
          setSynced(false);
        }

        // Then fetch events
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();
        console.log('🔍 Calendar query:', { startISO, endISO });

        const response = await fetch(
          `/api/calendar/events?start=${startISO}&end=${endISO}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log('📅 Calendar API response:', data);
          // Handle both array and object responses
          const eventsList = Array.isArray(data) ? data : (data.events || []);
          console.log('📌 Parsed events:', eventsList);
          setEvents(eventsList);
        }
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, []);

  if (loading) {
    return <div className="mb-8 h-40 flex items-center justify-center"><Spinner /></div>;
  }

  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">Today's Focus</h2>
      {upcomingEvents.length === 0 ? (
        <Card>
          <p className="text-slate-600 text-center py-8">No calls scheduled for today</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {new Date(event.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    {formatDistanceToNow(new Date(event.startTime), { addSuffix: true })}
                  </p>
                  {event.attendees.length > 0 && (
                    <p className="text-xs text-slate-500 mb-3">
                      Attendees: {event.attendees.join(', ')}
                    </p>
                  )}
                  {event.deal && (
                    <div className="inline-block">
                      <a
                        href={`/deals/${event.deal.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {event.deal.name} →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {!synced && (
        <p className="text-xs text-amber-600 mt-3">
          💡 Tip: Connect your Google Calendar in preferences to auto-sync calls
        </p>
      )}
    </div>
  );
}
