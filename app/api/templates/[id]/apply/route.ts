import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

// POST /api/templates/:id/apply - Apply template to new or existing deal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const templateId = parseInt(id);
    const body = await request.json();
    const { dealName, dealAmount, dealId } = body;

    // Verify template ownership
    const template = await prisma.dealTemplate.findUnique({
      where: { id: templateId },
      include: {
        milestones: true,
        stages: true,
      },
    });

    if (!template || template.userId !== user.id) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (dealId) {
      // Apply template to existing deal
      const deal = await prisma.deal.findUnique({
        where: { id: dealId },
      });

      if (!deal || deal.userId !== user.id) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        );
      }

      // Update deal with template
      await prisma.deal.update({
        where: { id: dealId },
        data: {
          templateId,
          stage: template.defaultStage,
          expectedCloseDate: new Date(
            Date.now() + (template.expectedDuration || 30) * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Create milestones as to-dos
      const todos = template.milestones.map((milestone) => ({
        userId: USER_ID,
        dealId,
        content: milestone.title,
      }));

      if (todos.length > 0) {
        await prisma.todo.createMany({
          data: todos,
        });
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: USER_ID,
          dealId,
          action: 'template_applied',
          description: `Applied template "${template.name}" to deal`,
          metadata: {
            templateId,
            templateName: template.name,
          },
        },
      });

      const updatedDeal = await prisma.deal.findUnique({
        where: { id: dealId },
        include: {
          contacts: true,
          todos: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Template applied to deal',
        deal: updatedDeal,
        todosCreated: todos.length,
      });
    } else {
      // Create new deal from template
      if (!dealName) {
        return NextResponse.json(
          { error: 'dealName is required for new deals' },
          { status: 400 }
        );
      }

      const newDeal = await prisma.deal.create({
        data: {
          userId: USER_ID,
          name: dealName,
          amount: dealAmount ? parseFloat(dealAmount) : null,
          templateId,
          stage: template.defaultStage,
          expectedCloseDate: new Date(
            Date.now() + (template.expectedDuration || 30) * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Create milestones as to-dos
      const todos = template.milestones.map((milestone) => ({
        userId: USER_ID,
        dealId: newDeal.id,
        content: milestone.title,
      }));

      if (todos.length > 0) {
        await prisma.todo.createMany({
          data: todos,
        });
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: USER_ID,
          dealId: newDeal.id,
          action: 'deal_created_from_template',
          description: `Deal created from template "${template.name}"`,
          metadata: {
            templateId,
            templateName: template.name,
          },
        },
      });

      // Increment template usage
      await prisma.dealTemplate.update({
        where: { id: templateId },
        data: { usage: { increment: 1 } },
      });

      const createdDeal = await prisma.deal.findUnique({
        where: { id: newDeal.id },
        include: {
          contacts: true,
          todos: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Deal created from template',
          deal: createdDeal,
          todosCreated: todos.length,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    );
  }
}
