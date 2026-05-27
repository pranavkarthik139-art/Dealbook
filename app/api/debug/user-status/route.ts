import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * Debug endpoint - shows current user and deals status
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Get user full details
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { deals: { select: { id: true, name: true, userId: true } } },
    });

    // Get all deals count
    const allDealsCount = await prisma.deal.count();

    // Get user's deals count
    const userDealsCount = await prisma.deal.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      dealStats: {
        totalDealsInDB: allDealsCount,
        yourDeals: userDealsCount,
        yourDealsList: fullUser?.deals || [],
      },
    });
  } catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
