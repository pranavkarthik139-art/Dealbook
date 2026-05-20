import { prisma } from '@/lib/db';
import { detectStall } from '@/lib/dealHealth';
import { getCurrentUser } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deals = await prisma.deal.findMany({
      where: { userId: user.id },
      include: {
        calendarEvents: true,
        todos: { where: { completed: false } },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const dealsWithMetadata = deals.map((deal) => {
      const stall = detectStall({
        id: deal.id,
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
        lastActivityAt: deal.lastActivityAt?.toISOString() || null,
        status: deal.status || undefined,
        stage: deal.stage || undefined,
      });

      return {
        ...deal,
        amount: deal.amount ? parseFloat(deal.amount.toString()) : null,
        stall,
      };
    });

    const summary = {
      total: deals.length,
      active: deals.filter((d) => d.status === 'active').length,
      closed: deals.filter((d) => d.status === 'closed').length,
      onHold: deals.filter((d) => d.status === 'on_hold').length,
      lost: deals.filter((d) => d.status === 'lost').length,
      stallCritical: dealsWithMetadata.filter((d) => d.stall.risk === 'critical').length,
      stallWarning: dealsWithMetadata.filter((d) => d.stall.risk === 'warning').length,
    };

    return NextResponse.json({ deals: dealsWithMetadata, summary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, amount, status = 'active', stage = 'demo', leadSource = 'inbound' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Deal name is required' },
        { status: 400 }
      );
    }

    const deal = await prisma.deal.create({
      data: {
        userId: user.id,
        name,
        email: email || null,
        amount: amount ? parseFloat(amount) : null,
        status,
        stage,
        leadSource: leadSource || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: deal.id,
        action: 'deal_created',
        description: `Deal "${name}" created`,
      },
    });

    const dealWithNumber = {
      ...deal,
      amount: deal.amount ? parseFloat(deal.amount.toString()) : null,
    };

    return NextResponse.json(dealWithNumber, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
