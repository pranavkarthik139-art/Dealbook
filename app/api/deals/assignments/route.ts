import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error(`[Assignments] User not found: ${session.user.email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`[Assignments] Fetching for user: ${user.email} (ID: ${user.id})`);

    // Check if requesting all assignments (for settings page)
    const url = new URL(req.url);
    const getAll = url.searchParams.get('all') === 'true';

    let assignments;

    if (getAll) {
      // Get all assignments (for settings/delegation page)
      assignments = await prisma.dealAssignment.findMany({
        include: {
          deal: true,
          seUser: true,
          assignedByUser: true,
        },
        orderBy: { assignedAt: 'desc' },
      });
    } else {
      // Get assignments for this user only (deals assigned to them)
      assignments = await prisma.dealAssignment.findMany({
        where: { seUserId: user.id },
        include: {
          deal: true,
          seUser: true,
          assignedByUser: true,
        },
        orderBy: { assignedAt: 'desc' },
      });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error(`[Assignments POST] User not found: ${session.user.email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { dealId, seUserId } = body;

    console.log(`[Assignments POST] Request: dealId=${dealId}, seUserId=${seUserId}, by user=${user.id}`);

    if (!dealId || !seUserId) {
      return NextResponse.json(
        { error: 'dealId and seUserId are required' },
        { status: 400 }
      );
    }

    // Verify deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      console.error(`[Assignments POST] Deal not found: ${dealId}`);
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Verify SE user exists
    const seUser = await prisma.user.findUnique({
      where: { id: seUserId },
    });

    if (!seUser) {
      console.error(`[Assignments POST] SE user not found: ${seUserId}`);
      return NextResponse.json(
        { error: 'Sales Engineer not found' },
        { status: 404 }
      );
    }

    // Check if already assigned
    const existing = await prisma.dealAssignment.findFirst({
      where: {
        dealId,
        seUserId,
      },
    });

    if (existing) {
      console.warn(`[Assignments POST] Already assigned: deal=${dealId}, se=${seUserId}`);
      return NextResponse.json(
        { error: 'This deal is already assigned to this SE' },
        { status: 409 }
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

    console.log(`[Assignments POST] Success: assignment created, deal=${dealId}, se=${seUserId}`);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('[Assignments POST] Caught error:', error);

    // Handle Prisma-specific errors
    if (error && typeof error === 'object') {
      const err = error as any;

      if ('code' in err) {
        console.error(`[Assignments POST] Prisma error code: ${err.code}, message: ${err.message}`);
        return NextResponse.json(
          { error: 'Database constraint error', message: err.message || 'Unknown database error' },
          { status: 500 }
        );
      }

      if ('message' in err) {
        console.error(`[Assignments POST] Error message: ${err.message}`);
        return NextResponse.json(
          { error: 'Error during assignment', message: err.message },
          { status: 500 }
        );
      }
    }

    // Safe error message extraction
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(`[Assignments POST] Error instance message: ${errorMessage}`);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error(`[Assignments POST] Final error message: ${errorMessage}`);
    return NextResponse.json(
      { error: 'Failed to create assignment', message: errorMessage },
      { status: 500 }
    );
  }
}
