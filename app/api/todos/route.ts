import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');

    const todos = await prisma.todo.findMany({
      where: {
        userId: parseInt(user.id),
        ...(dealId && { dealId: parseInt(dealId) }),
      },
      include: { deal: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, dealId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        userId: parseInt(user.id),
        content,
        dealId: dealId ? parseInt(dealId) : null,
      },
      include: { deal: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: parseInt(user.id),
        dealId: dealId ? parseInt(dealId) : null,
        action: 'todo_created',
        description: `To-do: "${content}"`,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
