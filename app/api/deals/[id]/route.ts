import { prisma } from '@/lib/db';
import { detectStall } from '@/lib/dealHealth';
import { NextRequest, NextResponse } from 'next/server';

const USER_ID = 1; // Hardcoded for prototype

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(id) },
      include: {
        calendarEvents: { orderBy: { startTime: 'asc' } },
        todos: { orderBy: { createdAt: 'desc' } },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!deal || deal.userId !== USER_ID) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
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
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!deal || deal.userId !== USER_ID) {
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
        userId: USER_ID,
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
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!deal || deal.userId !== USER_ID) {
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
