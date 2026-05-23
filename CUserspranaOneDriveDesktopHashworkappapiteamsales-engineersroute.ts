import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * Get list of all Sales Engineers (those who have logged in)
 * Accessible only to managers and admins
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'presales_lead' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all sales engineers, sorted by most recent activity
    const salesEngineers = await prisma.user.findMany({
      where: { role: 'sales_engineer' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
        // Count active deals for each SE
        dealAssignmentsSE: {
          where: {
            deal: {
              status: 'active',
            },
          },
          select: { id: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedSEs = salesEngineers.map((se) => ({
      id: se.id,
      name: se.name,
      email: se.email,
      image: se.image,
      lastActive: se.updatedAt,
      activeDealCount: se.dealAssignmentsSE.length,
    }));

    return NextResponse.json(formattedSEs);
  } catch (error) {
    console.error('Error fetching sales engineers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales engineers' },
      { status: 500 }
    );
  }
}
