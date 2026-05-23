import { NextRequest, NextResponse } from 'next/server';
import { fetchCalendarEvents } from '@/lib/google-calendar';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(user.id);

    // Get user's Google OAuth account with access token
    const googleAccount = await prisma.account.findFirst({
      where: { userId, provider: 'google' },
    });

    if (!googleAccount?.access_token) {
      return NextResponse.json(
        { error: 'Google account not connected. Please sign in with Google.' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('start');
    const endDateStr = searchParams.get('end');

    // Default to today and tomorrow
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = endDateStr ? new Date(endDateStr) : new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    // Use user's primary calendar with their OAuth token
    const events = await fetchCalendarEvents('primary', startDate, endDate, googleAccount.access_token);

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
