import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/automations/:id - Get automation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const automationId = parseInt(id);
    const automation = await prisma.dealAutomation.findUnique({
      where: { id: automationId },
      include: {
        rules: true,
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 10,
        },
      },
    });

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!automation || automation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Automation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      automation,
    });
  } catch (error) {
    console.error('Error fetching automation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation' },
      { status: 500 }
    );
  }
}

// PATCH /api/automations/:id - Update automation
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
    const automationId = parseInt(id);
    const body = await request.json();
    const { name, description, trigger, triggerConfig, action, actionConfig, enabled } = body;

    // Verify ownership
    const existing = await prisma.dealAutomation.findUnique({
      where: { id: automationId },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Automation not found' },
        { status: 404 }
      );
    }

    const automation = await prisma.dealAutomation.update({
      where: { id: automationId },
      data: {
        name,
        description,
        trigger,
        triggerConfig,
        action,
        actionConfig,
        enabled,
      },
      include: {
        rules: true,
      },
    });

    return NextResponse.json({
      success: true,
      automation,
    });
  } catch (error) {
    console.error('Error updating automation:', error);
    return NextResponse.json(
      { error: 'Failed to update automation' },
      { status: 500 }
    );
  }
}

// DELETE /api/automations/:id - Delete automation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const automationId = parseInt(id);

    // Verify ownership
    const existing = await prisma.dealAutomation.findUnique({
      where: { id: automationId },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Automation not found' },
        { status: 404 }
      );
    }

    await prisma.dealAutomation.delete({
      where: { id: automationId },
    });

    return NextResponse.json({
      success: true,
      message: 'Automation deleted',
    });
  } catch (error) {
    console.error('Error deleting automation:', error);
    return NextResponse.json(
      { error: 'Failed to delete automation' },
      { status: 500 }
    );
  }
}
