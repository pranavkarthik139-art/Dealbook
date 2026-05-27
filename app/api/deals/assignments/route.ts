import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/auth.config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only managers and admins can view assignments
    if (!['admin', 'presales_lead'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all assignments with deal and SE info
    const assignments = await prisma.dealAssignment.findMany({
      where: {
        assignedByUserId: user.id,
      },
      include: {
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
            stage: true,
          },
        },
        seUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only managers and admins can assign deals
    if (!['admin', 'presales_lead'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { dealId, seUserId } = body;

    if (!dealId || !seUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: dealId, seUserId' },
        { status: 400 }
      );
    }

    // Verify the deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(dealId) },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify the SE user exists
    const seUser = await prisma.user.findUnique({
      where: { id: parseInt(seUserId) },
    });

    if (!seUser) {
      return NextResponse.json({ error: 'Sales engineer not found' }, { status: 404 });
    }

    // Create or update assignment
    const assignment = await prisma.dealAssignment.upsert({
      where: {
        dealId_seUserId: {
          dealId: parseInt(dealId),
          seUserId: parseInt(seUserId),
        },
      },
      create: {
        dealId: parseInt(dealId),
        seUserId: parseInt(seUserId),
        assignedByUserId: user.id,
      },
      update: {
        assignedByUserId: user.id,
        assignedAt: new Date(),
      },
      include: {
        deal: true,
        seUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      assignment,
      message: `Deal "${deal.name}" assigned to ${seUser.name}`,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to assign deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only managers and admins can delete assignments
    if (!['admin', 'presales_lead'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { dealId, seUserId } = body;

    if (!dealId || !seUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: dealId, seUserId' },
        { status: 400 }
      );
    }

    // Delete the assignment
    await prisma.dealAssignment.delete({
      where: {
        dealId_seUserId: {
          dealId: parseInt(dealId),
          seUserId: parseInt(seUserId),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment removed',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
