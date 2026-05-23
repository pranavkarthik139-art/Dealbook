import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * Assign a deal to a Sales Engineer
 * Accessible only to managers and admins
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'presales_lead' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { dealId, seUserId } = await req.json();

    if (!dealId || !seUserId) {
      return NextResponse.json(
        { error: 'dealId and seUserId are required' },
        { status: 400 }
      );
    }

    // Verify deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(dealId) },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify SE exists
    const seUser = await prisma.user.findUnique({
      where: { id: parseInt(seUserId) },
    });

    if (!seUser || seUser.role !== 'sales_engineer') {
      return NextResponse.json(
        { error: 'Sales Engineer not found' },
        { status: 404 }
      );
    }

    // Remove old assignment if exists
    await prisma.dealAssignment.deleteMany({
      where: { dealId: parseInt(dealId) },
    });

    // Create new assignment
    const assignment = await prisma.dealAssignment.create({
      data: {
        dealId: parseInt(dealId),
        seUserId: parseInt(seUserId),
        assignedByUserId: user.id,
      },
      include: {
        seUser: true,
        deal: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: parseInt(dealId),
        action: 'deal_assigned',
        description: `Deal "${deal.name}" assigned to ${seUser.name}`,
        metadata: {
          seUserId: seUserId,
          seName: seUser.name,
          assignedByUserId: user.id,
          assignedBy: user.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      assignment: {
        dealId: assignment.deal.id,
        dealName: assignment.deal.name,
        seId: assignment.seUser.id,
        seName: assignment.seUser.name,
        assignedAt: assignment.assignedAt,
      },
    });
  } catch (error) {
    console.error('Error assigning deal:', error);
    return NextResponse.json(
      { error: 'Failed to assign deal', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get deal assignments
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'presales_lead' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const assignments = await prisma.dealAssignment.findMany({
      include: {
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
            stage: true,
            status: true,
          },
        },
        seUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
