import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const USER_ID = 1;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const activities = await prisma.activityLog.findMany({
      where: { userId: USER_ID },
      include: { deal: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
