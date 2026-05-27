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

    console.log('[API] Attempting to fetch deal...');
    let deal;
    try {
      // First, try to fetch just the deal without relations
      deal = await prisma.deal.findUnique({
        where: { id: parsedId },
      });
      console.log('[API] Basic deal query succeeded');

      if (!deal) {
        console.log('[API] Deal not found');
      } else {
        // Now try to fetch relations one by one
        console.log('[API] Fetching relations...');

        const calendarEvents = await prisma.calendarEvent.findMany({
          where: { dealId: parsedId },
          orderBy: { startTime: 'asc' },
        });
        console.log('[API] Calendar events fetched:', calendarEvents.length);

        const todos = await prisma.todo.findMany({
          where: { dealId: parsedId },
          orderBy: { createdAt: 'desc' },
        });
        console.log('[API] Todos fetched:', todos.length);

        const activityLogs = await prisma.activityLog.findMany({
          where: { dealId: parsedId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        console.log('[API] Activity logs fetched:', activityLogs.length);

        const contacts = await prisma.contact.findMany({
          where: { dealId: parsedId },
        });
        console.log('[API] Contacts fetched:', contacts.length);

        // Combine them into the deal object
        deal = {
          ...deal,
          calendarEvents,
          todos,
          activityLogs,
          contacts,
        };
        console.log('[API] Deal fully loaded with relations');
      }
    } catch (queryError) {
      console.error('[API] Deal query error:', queryError);
      throw queryError;
    }

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
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[API] Error fetching deal:', errorMsg);
    console.error('[API] Error stack:', errorStack);
    console.error('[API] Full error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch deal',
        details: errorMsg,
        type: error instanceof Error ? error.constructor.name : typeof error
      },
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
