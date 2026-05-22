import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let prefs = await prisma.userPreference.findUnique({
      where: { userId: parseInt(user.id) },
    });

    // If not found, return default
    if (!prefs) {
      console.log(`No preferences found for user ${user.id}, using defaults`);
      return NextResponse.json({
        userId: parseInt(user.id),
        timezonePrimary: 'Asia/Kolkata',
        timezoneSecondary: 'America/New_York',
        cardColorMetric: 'stall_severity',
      }, { status: 200 });
    }

    return NextResponse.json({
      ...prefs,
      cardColorMetric: (prefs as any).cardColorMetric || 'stall_severity',
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    let prefs = await prisma.userPreference.findUnique({
      where: { userId: parseInt(user.id) },
    });

    if (!prefs) {
      prefs = await prisma.userPreference.create({
        data: {
          userId: parseInt(user.id),
          ...body,
        } as any,
      });
    } else {
      prefs = await prisma.userPreference.update({
        where: { userId: parseInt(user.id) },
        data: body as any,
      });
    }

    return NextResponse.json({
      ...prefs,
      cardColorMetric: (prefs as any).cardColorMetric || 'stall_severity',
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
