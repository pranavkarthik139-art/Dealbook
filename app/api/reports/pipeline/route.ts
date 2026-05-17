import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 1;

export async function GET(request: NextRequest) {
  try {
    // Get all deals grouped by stage
    const deals = await prisma.deal.findMany({
      where: { userId: USER_ID },
      select: {
        id: true,
        name: true,
        amount: true,
        stage: true,
        status: true,
        health: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate by stage
    const stageBreakdown: Record<string, { count: number; value: number; deals: any[] }> = {
      demo: { count: 0, value: 0, deals: [] },
      poc: { count: 0, value: 0, deals: [] },
      validation: { count: 0, value: 0, deals: [] },
      closed: { count: 0, value: 0, deals: [] },
    };

    for (const deal of deals) {
      const stage = deal.stage || 'demo';
      if (stageBreakdown[stage]) {
        stageBreakdown[stage].count += 1;
        stageBreakdown[stage].value += deal.amount || 0;
        stageBreakdown[stage].deals.push(deal);
      }
    }

    // Calculate metrics
    const totalValue = Object.values(stageBreakdown).reduce((sum, s) => sum + s.value, 0);
    const totalDeals = Object.values(stageBreakdown).reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({
      totalValue,
      totalDeals,
      stageBreakdown,
      stages: Object.entries(stageBreakdown).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
        percentage: totalDeals > 0 ? ((data.count / totalDeals) * 100).toFixed(1) : '0',
        valuePercentage: totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : '0',
      })),
    });
  } catch (error) {
    console.error('Pipeline report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline report' },
      { status: 500 }
    );
  }
}
