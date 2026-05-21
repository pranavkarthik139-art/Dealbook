import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results: any = {
      emailSynced: false,
      calendarSynced: false,
      message: 'Sync attempted',
    };

    // Sync Email from Gmail
    if (user.preferences?.gmailToken) {
      try {
        const emailRes = await fetch(`http://localhost:3000/api/email/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (emailRes.ok) {
          results.emailSynced = true;
        }
      } catch (error) {
        console.error('Email sync error:', error);
      }
    }

    // Sync Calendar from Google Calendar
    if (user.preferences?.googleCalendarToken) {
      try {
        const calendarRes = await fetch(`http://localhost:3000/api/calendar/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (calendarRes.ok) {
          results.calendarSynced = true;
        }
      } catch (error) {
        console.error('Calendar sync error:', error);
      }
    }

    // Update last sync timestamp
    if (user.preferences) {
      await prisma.userPreference.update({
        where: { userId: user.id },
        data: { lastGmailSyncAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
