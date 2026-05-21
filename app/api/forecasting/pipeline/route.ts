import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 1;

/**
 * GET /api/forecasting/pipeline
 * Returns revenue forecast by stage with confidence levels
 * Aggregates all deals with their probability and expected close date
 */
export async function GET(request: NextRequest) {
  try {
    const deals = await prisma.deal.findMany({
      where: { userId: USER_ID },
      select: {
        id: true,
        name: true,
        amount: true,
        stage: true,
        probability: true,
        expectedCloseDate: true,
        createdAt: true,
        lastActivityAt: true,
      },
    });

    // Aggregate by stage
    const byStage: Record<
      string,
      {
        count: number;
        totalValue: number;
        weightedValue: number; // value * probability / 100
        avgProbability: number;
        expectedValue: number;
      }
    > = {};

    const stages = ['demo', 'poc', 'validation', 'closed'];
    stages.forEach((stage) => {
      byStage[stage] = {
        count: 0,
        totalValue: Number(0),
        weightedValue: Number(0),
        avgProbability: 0,
        expectedValue: 0,
      };
    });

    let totalProbabilities = 0;
    let totalDeals = 0;

    deals.forEach((deal) => {
      const stage = deal.stage || 'demo';
      if (!byStage[stage]) {
        byStage[stage] = {
          count: 0,
          totalValue: Number(0),
          weightedValue: Number(0),
          avgProbability: 0,
          expectedValue: 0,
        };
      }

      const amount = deal.amount ? Number(deal.amount) : 0;
      const probability = deal.probability || 50;

      byStage[stage].count++;
      byStage[stage].totalValue += Number(amount);
      byStage[stage].weightedValue += Math.round(amount * (probability / 100));
      byStage[stage].avgProbability += probability;

      totalProbabilities += probability;
      totalDeals++;
    });

    // Calculate averages
    Object.keys(byStage).forEach((stage) => {
      if (byStage[stage].count > 0) {
        byStage[stage].avgProbability =
          byStage[stage].avgProbability / byStage[stage].count;
      }
      byStage[stage].expectedValue = byStage[stage].weightedValue;
    });

    // Calculate totals
    const totalValue = Object.values(byStage).reduce(
      (sum, s) => sum + Number(s.totalValue),
      0
    );
    const totalWeightedValue = Object.values(byStage).reduce(
      (sum, s) => sum + s.expectedValue,
      0
    );
    const overallProbability =
      totalDeals > 0 ? Math.round(totalProbabilities / totalDeals) : 0;

    // Calculate confidence (higher activity = higher confidence)
    const now = Date.now();
    const recentActivityCount = deals.filter(
      (d) =>
        d.lastActivityAt &&
        now - new Date(d.lastActivityAt).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    const confidence = Math.min(
      95,
      Math.round(50 + (recentActivityCount / Math.max(totalDeals, 1)) * 45)
    );

    return NextResponse.json({
      success: true,
      forecast: {
        period: 'current',
        periodStart: new Date(),
        totalDeals,
        totalValue,
        projectedRevenue: totalWeightedValue,
        overallProbability,
        confidence,
        byStage: Object.entries(byStage).reduce(
          (acc, [stage, data]) => {
            acc[stage] = {
              dealCount: data.count,
              totalValue: Number(data.totalValue),
              expectedValue: data.expectedValue,
              avgProbability: Math.round(data.avgProbability),
            };
            return acc;
          },
          {} as Record<string, any>
        ),
        metrics: {
          avgDealSize: totalDeals > 0 ? totalValue / totalDeals : 0,
          avgProbability: overallProbability,
          stageDistribution: Object.entries(byStage).map(([stage, data]) => ({
            stage,
            percentage:
              totalDeals > 0 ? Math.round((data.count / totalDeals) * 100) : 0,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching pipeline forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline forecast' },
      { status: 500 }
    );
  }
}
