import { NextRequest, NextResponse } from 'next/server';
import { syncCalendarEvents } from '@/lib/google-calendar';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userId = 1; // Hardcoded for prototype
    const calendarId = 'pranavkarthik139@gmail.com'; // Hardcoded for now
    const { startDate: startDateStr, endDate: endDateStr } = await request.json().catch(() => ({}));

    // Default to today through end of week
    let startDate: Date;
    let endDate: Date;

    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else {
      // Get today in UTC
      const now = new Date();
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + 7); // Sync next 7 days
      endDate.setUTCHours(23, 59, 59, 999);
    }

    // Fetch all deals for matching (with email for attendee matching)
    const deals = await prisma.deal.findMany({
      where: { userId },
      select: { id: true, name: true, email: true },
    });

    // Sync calendar and match deals
    const eventsWithDeals = await syncCalendarEvents(calendarId, startDate, endDate, deals);

    // Log activities for calendar events and update deals
    let activitiesLogged = 0;
    for (const event of eventsWithDeals) {
      if (event.dealId) {
        // Check if event already exists to avoid duplicates
        const existingEvent = await prisma.calendarEvent.findFirst({
          where: {
            googleEventId: event.id,
            dealId: event.dealId,
          },
        });

        if (!existingEvent) {
          // Create calendar event in database
          const createdEvent = await prisma.calendarEvent.create({
            data: {
              userId,
              googleEventId: event.id,
              title: event.title,
              startTime: event.startTime,
              endTime: event.endTime,
              attendees: event.attendees,
              description: event.description,
              dealId: event.dealId,
            },
          });

          // Create activity log for the meeting
          await prisma.activityLog.create({
            data: {
              userId,
              dealId: event.dealId,
              action: 'meeting_scheduled',
              description: `Meeting: ${event.title} (${event.startTime.toLocaleDateString()})`,
              metadata: {
                attendees: event.attendees,
                duration: Math.round((event.endTime.getTime() - event.startTime.getTime()) / 60000),
              },
            },
          });

          // Update deal's lastActivityAt
          await prisma.deal.update({
            where: { id: event.dealId },
            data: { lastActivityAt: new Date() },
          });

          activitiesLogged++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      events: eventsWithDeals,
      matched: eventsWithDeals.filter((e) => e.dealId).length,
      total: eventsWithDeals.length,
      activitiesLogged,
    });
  } catch (error) {
    console.error('Calendar sync API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync calendar events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
