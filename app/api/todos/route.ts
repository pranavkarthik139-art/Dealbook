import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const USER_ID = 1; // Hardcoded for prototype

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');

    const todos = await prisma.todo.findMany({
      where: {
        userId: USER_ID,
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
        userId: USER_ID,
        content,
        dealId: dealId ? parseInt(dealId) : null,
      },
      include: { deal: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: USER_ID,
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
