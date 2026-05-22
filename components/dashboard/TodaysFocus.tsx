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

        // First sync with Google Calendar (with 3 second timeout)
        try {
          const abortController = new AbortController();
          const timeoutId = setTimeout(() => abortController.abort(), 3000);

          const syncResponse = await fetch('/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            }),
            signal: abortController.signal,
          });

          clearTimeout(timeoutId);
          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            setSynced(syncData.success === true);
          }
        } catch (error) {
          console.error('Failed to sync calendar:', error);
          setSynced(false);
        }

        // Then fetch events (with 3 second timeout)
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 3000);

        const response = await fetch(
          `/api/calendar/events?start=${startISO}&end=${endISO}`,
          { signal: abortController.signal }
        );

        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          const eventsList = Array.isArray(data) ? data : (data.events || []);
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
    return <div style={{
      padding: 'var(--space-8)',
      textAlign: 'center',
      color: 'var(--ink-lighter)'
    }}>Loading calendar...</div>;
  }

  const upcomingEvents = events.slice(0, 4);

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: '0 0 var(--space-4) 0'
      }}>📅 Today's Focus</h2>
      {upcomingEvents.length === 0 ? (
        <Card>
          <p style={{
            color: 'var(--ink-lighter)',
            textAlign: 'center',
            paddingTop: 'var(--space-8)',
            paddingBottom: 'var(--space-8)',
            margin: 0
          }}>No calls scheduled for today</p>
        </Card>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}>
          {upcomingEvents.map((event) => (
            <Card key={event.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontWeight: 600,
                    color: 'var(--ink)',
                    marginBottom: 'var(--space-2)',
                    margin: '0 0 var(--space-2) 0',
                    fontSize: 'var(--text-base)'
                  }}>{event.title}</h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--ink-lighter)',
                    marginBottom: 'var(--space-3)',
                    margin: '0 0 var(--space-3) 0'
                  }}>
                    {new Date(event.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    {formatDistanceToNow(new Date(event.startTime), { addSuffix: true })}
                  </p>
                  {event.attendees.length > 0 && (
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--ink-lighter)',
                      marginBottom: 'var(--space-3)',
                      margin: '0 0 var(--space-3) 0'
                    }}>
                      Attendees: {event.attendees.join(', ')}
                    </p>
                  )}
                  {event.deal && (
                    <div style={{ display: 'inline-block' }}>
                      <a
                        href={`/deals/${event.deal.id}`}
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500,
                          color: 'var(--cobalt)',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'color var(--transition-base)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cobalt-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cobalt)'}
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
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--warning)',
          marginTop: 'var(--space-3)',
          margin: 'var(--space-3) 0 0 0'
        }}>
          💡 Tip: Connect your Google Calendar in preferences to auto-sync calls
        </p>
      )}
    </div>
  );
}
