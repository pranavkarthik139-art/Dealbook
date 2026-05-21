import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/templates/:id - Get template details
export async function GET(
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
    const template = await prisma.dealTemplate.findUnique({
      where: { id: templateId },
      include: {
        stages: { orderBy: { order: 'asc' } },
        milestones: true,
      },
    });

    if (!template || template.userId !== user.id) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PATCH /api/templates/:id - Update template
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
    const templateId = parseInt(id);
    const body = await request.json();
    const { name, description, dealType, defaultStage, expectedDuration, estimatedValue } = body;

    // Verify ownership
    const existing = await prisma.dealTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = await prisma.dealTemplate.update({
      where: { id: templateId },
      data: {
        name,
        description,
        dealType,
        defaultStage,
        expectedDuration,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      },
      include: {
        stages: { orderBy: { order: 'asc' } },
        milestones: true,
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/:id - Delete template
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
    const templateId = parseInt(id);

    // Verify ownership
    const existing = await prisma.dealTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    await prisma.dealTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
