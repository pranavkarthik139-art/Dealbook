import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/automations - List all automations for user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automations = await prisma.dealAutomation.findMany({
      where: { userId: user.id },
      include: {
        rules: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      automations,
    });
  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

// POST /api/automations - Create new automation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      trigger,
      triggerConfig,
      action,
      actionConfig,
      enabled,
    } = body;

    // Validate required fields
    if (!name || !trigger || !action) {
      return NextResponse.json(
        { error: 'name, trigger, and action are required' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automation = await prisma.dealAutomation.create({
      data: {
        userId: user.id,
        name,
        description,
        trigger,
        triggerConfig: triggerConfig || {},
        action,
        actionConfig: actionConfig || {},
        enabled: enabled !== undefined ? enabled : true,
      },
      include: {
        rules: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        automation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}
