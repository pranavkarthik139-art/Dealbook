import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get assignments for this user (deals assigned to them)
    const assignments = await prisma.dealAssignment.findMany({
      where: { seUserId: user.id },
      include: {
        deal: true,
        assignedByUser: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { dealId, seUserId } = await req.json();

    if (!dealId || !seUserId) {
      return NextResponse.json(
        { error: 'dealId and seUserId required' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await prisma.dealAssignment.create({
      data: {
        dealId,
        seUserId,
        assignedByUserId: user.id,
      },
      include: {
        deal: true,
        seUser: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId,
        action: 'deal_assigned',
        description: `Deal assigned to ${assignment.seUser.name || assignment.seUser.email}`,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
