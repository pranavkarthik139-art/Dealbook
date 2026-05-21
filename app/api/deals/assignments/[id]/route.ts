import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const assignmentId = parseInt(id);

    const assignment = await prisma.dealAssignment.findUnique({
      where: { id: assignmentId },
      include: { deal: true, seUser: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to remove assignment (must be manager/admin)
    if (user.role === 'sales_engineer') {
      return NextResponse.json(
        { error: 'Sales engineers cannot remove assignments' },
        { status: 403 }
      );
    }

    // Delete assignment
    await prisma.dealAssignment.delete({
      where: { id: assignmentId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: assignment.dealId,
        action: 'deal_unassigned',
        description: `Deal unassigned from ${assignment.seUser.name || assignment.seUser.email}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
