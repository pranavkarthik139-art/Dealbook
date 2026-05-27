import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Debug endpoint - list all deals in database with their user IDs
 */
export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        stage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const userCounts = deals.reduce(
      (acc, deal) => {
        acc[deal.userId] = (acc[deal.userId] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    return NextResponse.json({
      totalDeals: deals.length,
      dealsByUser: userCounts,
      deals,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
