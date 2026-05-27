import { prisma } from '@/lib/db';
import { detectStall } from '@/lib/dealHealth';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    console.log('[API] GET /api/deals/[id] - User:', user?.email, 'Role:', user?.role);

    if (!user) {
      console.error('[API] No user found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const parsedId = parseInt(id);
    console.log('[API] Fetching deal with ID:', parsedId, 'Type:', typeof parsedId);

    const deal = await prisma.deal.findUnique({
      where: { id: parsedId },
      include: {
        calendarEvents: { orderBy: { startTime: 'asc' } },
        todos: { orderBy: { createdAt: 'desc' } },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
        contacts: true,
      },
    });

    console.log('[API] Deal query result:', deal ? `Found (ID: ${deal.id}, Owner: ${deal.userId})` : 'Not found');

    if (!deal) {
      console.error('[API] Deal ID', parsedId, 'not found in database');
      // Log available deal IDs for debugging
      const allDeals = await prisma.deal.findMany({
        select: { id: true, userId: true, name: true },
        take: 5,
      });
      console.log('[API] Sample available deals:', allDeals);

      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Authorization check: User can see their own deals, or managers/admins can see all
    const isOwner = deal.userId === user.id;
    const isManager = user.role === 'presales_lead' || user.role === 'admin';

    console.log('[API] Authorization check - isOwner:', isOwner, 'isManager:', isManager, 'userRole:', user.role);

    if (!isOwner && !isManager) {
      console.warn('[API] Access denied - user', user.id, 'not authorized for deal', deal.id);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const stall = detectStall({
      id: deal.id,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
      lastActivityAt: deal.lastActivityAt?.toISOString() || null,
      status: deal.status || undefined,
      stage: deal.stage || undefined,
    });

    const dealWithMetadata = {
      ...deal,
      amount: deal.amount ? parseFloat(deal.amount.toString()) : null,
      probability: deal.probability || 50,
      expectedCloseDate: deal.expectedCloseDate?.toISOString() || null,
      stall,
    };

    return NextResponse.json(dealWithMetadata, { status: 200 });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!deal || deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updated = await prisma.deal.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        updatedAt: new Date(),
      },
    });

    // Log activity with specific action for stage changes
    let action = 'deal_updated';
    let description = 'Deal updated';

    if (body.stage && body.stage !== deal.stage) {
      action = 'stage_changed';
      description = `Moved from ${deal.stage} to ${body.stage}`;
    }

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: deal.id,
        action,
        description,
        metadata: body,
      },
    });

    const updatedWithNumber = {
      ...updated,
      amount: updated.amount ? parseFloat(updated.amount.toString()) : null,
    };

    return NextResponse.json(updatedWithNumber, { status: 200 });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!deal || deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    await prisma.deal.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: 'Deal deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
