import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all deals grouped by status
    const deals = await prisma.deal.findMany({
      where: { userId: parseInt(user.id) },
      select: {
        id: true,
        name: true,
        amount: true,
        status: true,
        health: true,
        stage: true,
      },
    });

    // Aggregate by status
    const statusBreakdown: Record<string, { count: number; value: number; avgHealth: number }> = {
      active: { count: 0, value: 0, avgHealth: 0 },
      closed: { count: 0, value: 0, avgHealth: 0 },
      on_hold: { count: 0, value: 0, avgHealth: 0 },
      lost: { count: 0, value: 0, avgHealth: 0 },
    };

    const healthScores: Record<string, number[]> = {
      active: [],
      closed: [],
      on_hold: [],
      lost: [],
    };

    for (const deal of deals) {
      const status = deal.status || 'active';
      if (statusBreakdown[status]) {
        statusBreakdown[status].count += 1;
        statusBreakdown[status].value += deal.amount ? Number(deal.amount) : 0;
        if (deal.health) {
          healthScores[status].push(deal.health);
        }
      }
    }

    // Calculate average health per status
    for (const [status, scores] of Object.entries(healthScores)) {
      if (scores.length > 0) {
        statusBreakdown[status].avgHealth = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length
        );
      }
    }

    const totalValue = Object.values(statusBreakdown).reduce((sum, s) => sum + s.value, 0);
    const totalDeals = deals.length;

    return NextResponse.json({
      totalDeals,
      totalValue,
      statusBreakdown,
      statuses: Object.entries(statusBreakdown).map(([status, data]) => ({
        status,
        count: data.count,
        value: data.value,
        avgHealth: data.avgHealth,
        percentage: totalDeals > 0 ? ((data.count / totalDeals) * 100).toFixed(1) : '0',
      })),
    });
  } catch (error) {
    console.error('Status report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status report' },
      { status: 500 }
    );
  }
}
