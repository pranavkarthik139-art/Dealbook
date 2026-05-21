import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/templates - List all templates for user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.dealTemplate.findMany({
      where: { userId: user.id },
      include: {
        stages: { orderBy: { order: 'asc' } },
        milestones: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      dealType,
      defaultStage,
      expectedDuration,
      estimatedValue,
      stages,
      milestones,
    } = body;

    // Validate required fields
    if (!name || !dealType) {
      return NextResponse.json(
        { error: 'Name and dealType are required' },
        { status: 400 }
      );
    }

    // Create template
    const template = await prisma.dealTemplate.create({
      data: {
        userId: user.id,
        name,
        description,
        dealType,
        defaultStage: defaultStage || 'demo',
        expectedDuration,
        estimatedValue: estimatedValue ? Number(estimatedValue) : null,
        // Create stages if provided
        stages: stages ? {
          createMany: {
            data: stages.map((s: any, idx: number) => ({
              stageName: s.stageName,
              order: idx,
              expectedDays: s.expectedDays || 14,
            })),
          },
        } : undefined,
        // Create milestones if provided
        milestones: milestones ? {
          createMany: {
            data: milestones.map((m: any) => ({
              title: m.title,
              description: m.description,
              daysAfterStart: m.daysAfterStart,
            })),
          },
        } : undefined,
      },
      include: {
        stages: { orderBy: { order: 'asc' } },
        milestones: true,
      },
    });

    return NextResponse.json({
      success: true,
      template,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
