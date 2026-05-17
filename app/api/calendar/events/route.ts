import { NextRequest, NextResponse } from 'next/server';
import { fetchCalendarEvents } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('start');
    const endDateStr = searchParams.get('end');
    const calendarId = 'pranavkarthik139@gmail.com'; // Hardcoded for now

    // Default to today and tomorrow
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = endDateStr ? new Date(endDateStr) : new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    const events = await fetchCalendarEvents(calendarId, startDate, endDate);

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Calendar events API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch calendar events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
