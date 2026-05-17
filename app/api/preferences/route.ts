import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const USER_ID = 1; // Hardcoded for prototype

export async function GET() {
  try {
    let prefs = await prisma.userPreference.findUnique({
      where: { userId: USER_ID },
    });

    // Create default preferences if they don't exist
    if (!prefs) {
      prefs = await prisma.userPreference.create({
        data: {
          userId: USER_ID,
          timezonePrimary: 'Asia/Kolkata',
          timezoneSecondary: 'America/New_York',
        },
      });
    }

    return NextResponse.json(prefs, { status: 200 });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    let prefs = await prisma.userPreference.findUnique({
      where: { userId: USER_ID },
    });

    if (!prefs) {
      prefs = await prisma.userPreference.create({
        data: {
          userId: USER_ID,
          ...body,
        },
      });
    } else {
      prefs = await prisma.userPreference.update({
        where: { userId: USER_ID },
        data: body,
      });
    }

    return NextResponse.json(prefs, { status: 200 });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
