import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const USER_ID = 1;

export async function POST(request: NextRequest) {
  try {
    const { dealId, daysAgo } = await request.json();

    if (!dealId || daysAgo === undefined) {
      return NextResponse.json(
        { error: 'dealId and daysAgo required' },
        { status: 400 }
      );
    }

    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const updated = await prisma.deal.update({
      where: { id: parseInt(dealId) },
      data: { lastActivityAt: date },
    });

    return NextResponse.json({
      success: true,
      dealId: updated.id,
      name: updated.name,
      lastActivityAt: updated.lastActivityAt,
      daysAgo,
      message: `Set ${updated.name} lastActivityAt to ${daysAgo} days ago`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
