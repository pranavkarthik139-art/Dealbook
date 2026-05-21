import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');

    if (!dealId) {
      return NextResponse.json({ error: 'dealId required' }, { status: 400 });
    }

    const calls = await prisma.call.findMany({
      where: {
        dealId: parseInt(dealId),
        userId: user.id,
      },
      orderBy: { callDate: 'desc' },
    });

    return NextResponse.json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dealId, title, callDate, durationMinutes, attendees, notes } = body;

    if (!dealId || !title || !callDate) {
      return NextResponse.json(
        { error: 'dealId, title, and callDate are required' },
        { status: 400 }
      );
    }

    const call = await prisma.call.create({
      data: {
        userId: user.id,
        dealId: parseInt(dealId),
        title,
        callDate: new Date(callDate),
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        attendees: attendees || [],
        notes: notes || null,
        gongDescription: null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: parseInt(dealId),
        action: 'call_logged',
        description: `Call logged: ${title}`,
        metadata: {
          callId: call.id,
          attendees: attendees || [],
        },
      },
    });

    // Update deal lastActivityAt
    await prisma.deal.update({
      where: { id: parseInt(dealId) },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    console.error('Error creating call:', error);
    return NextResponse.json(
      { error: 'Failed to create call' },
      { status: 500 }
    );
  }
}
