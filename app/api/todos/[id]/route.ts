import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

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
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
    });

    if (!todo || todo.userId !== user.id) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updated = await prisma.todo.update({
      where: { id: parseInt(id) },
      data: body,
      include: { deal: true },
    });

    // Log activity if completed
    if (body.completed && !todo.completed) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          dealId: todo.dealId,
          action: 'todo_completed',
          description: `Completed: "${todo.content}"`,
        },
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
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
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
    });

    if (!todo || todo.userId !== user.id) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    await prisma.todo.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: 'Todo deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
