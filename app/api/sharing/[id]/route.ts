import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

// PATCH /api/sharing/:id - Update share permissions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const shareId = parseInt(id);
    const body = await request.json();
    const { permission, expiresAt } = body;

    // Verify ownership
    const existing = await prisma.sharedDeal.findUnique({
      where: { id: shareId },
    });

    if (!existing || existing.sharedByUserId !== user.id) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.sharedDeal.update({
      where: { id: shareId },
      data: {
        permission,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      include: {
        deal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      sharedDeal: updated,
    });
  } catch (error) {
    console.error('Error updating share:', error);
    return NextResponse.json(
      { error: 'Failed to update share' },
      { status: 500 }
    );
  }
}

// DELETE /api/sharing/:id - Revoke share
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shareId = parseInt(id);

    // Verify ownership
    const existing = await prisma.sharedDeal.findUnique({
      where: { id: shareId },
    });

    if (!existing || existing.sharedByUserId !== user.id) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    await prisma.sharedDeal.delete({
      where: { id: shareId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: existing.dealId,
        action: 'deal_share_revoked',
        description: `Share with ${existing.sharedWithEmail} revoked`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Share revoked',
    });
  } catch (error) {
    console.error('Error revoking share:', error);
    return NextResponse.json(
      { error: 'Failed to revoke share' },
      { status: 500 }
    );
  }
}
