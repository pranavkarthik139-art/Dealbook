import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { differenceInDays, startOfDay, subDays } from 'date-fns';

const USER_ID = 1;

export async function GET(request: NextRequest) {
  try {
    const days = request.nextUrl.searchParams.get('days') || '30';
    const daysNum = parseInt(days);

    // Get activity logs from the past N days
    const startDate = subDays(new Date(), daysNum);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId: USER_ID,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        action: true,
        createdAt: true,
        dealId: true,
        deal: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate by day
    const activityByDay: Record<string, { date: string; count: number; actions: Record<string, number> }> = {};

    for (const activity of activities) {
      const dateKey = startOfDay(new Date(activity.createdAt)).toISOString().split('T')[0];

      if (!activityByDay[dateKey]) {
        activityByDay[dateKey] = {
          date: dateKey,
          count: 0,
          actions: {},
        };
      }

      activityByDay[dateKey].count += 1;
      activityByDay[dateKey].actions[activity.action] = (activityByDay[dateKey].actions[activity.action] || 0) + 1;
    }

    // Get action types breakdown
    const actionBreakdown: Record<string, number> = {};
    for (const activity of activities) {
      actionBreakdown[activity.action] = (actionBreakdown[activity.action] || 0) + 1;
    }

    // Get deals by activity (most active)
    const dealActivityMap: Record<number, number> = {};
    for (const activity of activities) {
      if (activity.dealId) {
        dealActivityMap[activity.dealId] = (dealActivityMap[activity.dealId] || 0) + 1;
      }
    }

    const mostActiveDealIds = Object.entries(dealActivityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => parseInt(id));

    const mostActiveDeals = mostActiveDealIds.length > 0
      ? await prisma.deal.findMany({
          where: { id: { in: mostActiveDealIds } },
          select: { id: true, name: true },
        })
      : [];

    const mostActiveDealsList = mostActiveDealIds.map(id => {
      const deal = mostActiveDeals.find(d => d.id === id);
      return {
        dealId: id,
        dealName: deal?.name || 'Unknown',
        activityCount: dealActivityMap[id],
      };
    });

    return NextResponse.json({
      days: daysNum,
      totalActivities: activities.length,
      activityByDay: Object.values(activityByDay).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      actionBreakdown,
      mostActiveDeals: mostActiveDealsList,
    });
  } catch (error) {
    console.error('Activity report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity report' },
      { status: 500 }
    );
  }
}
