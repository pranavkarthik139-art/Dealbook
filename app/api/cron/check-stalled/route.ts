import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { differenceInDays } from 'date-fns';

const CRON_SECRET = process.env.CRON_SECRET || 'default-dev-secret';

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all deals with no recent activity
    const deals = await prisma.deal.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        lastActivityAt: true,
        createdAt: true,
      },
    });

    const now = new Date();
    const stalledDeals = deals.filter(deal => {
      const lastActivityDate = deal.lastActivityAt ? new Date(deal.lastActivityAt) : new Date(deal.createdAt);
      const daysSinceActivity = differenceInDays(now, lastActivityDate);
      return daysSinceActivity >= 7; // Stalled if no activity for 7+ days
    });

    console.log(`[Stall Check] Found ${stalledDeals.length} stalled deals out of ${deals.length} total`);

    // TODO: Send notifications to users about stalled deals
    // This could trigger:
    // - Email notifications
    // - In-app alerts
    // - Slack messages
    // - SMS reminders

    return NextResponse.json({
      success: true,
      totalDeals: deals.length,
      stalledDeals: stalledDeals.length,
      deals: stalledDeals.map(d => ({
        id: d.id,
        name: d.name,
        lastActivity: d.lastActivityAt,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Stall Check] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Stall check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
