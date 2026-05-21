import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

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
    const call = await prisma.call.findUnique({
      where: { id: parseInt(id) },
    });

    if (!call || call.userId !== user.id) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error fetching call:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call' },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    const { title, callDate, durationMinutes, attendees, notes, gongDescription } = body;

    const call = await prisma.call.findUnique({
      where: { id: parseInt(id) },
    });

    if (!call || call.userId !== user.id) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    const updatedCall = await prisma.call.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(callDate && { callDate: new Date(callDate) }),
        ...(durationMinutes !== undefined && { durationMinutes: durationMinutes ? parseInt(durationMinutes) : null }),
        ...(attendees && { attendees }),
        ...(notes !== undefined && { notes }),
        ...(gongDescription !== undefined && { gongDescription }),
      },
    });

    // Log activity if Gong description was updated
    if (gongDescription !== undefined && gongDescription !== call.gongDescription) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          dealId: call.dealId,
          action: 'gong_description_updated',
          description: `Gong description updated for call: ${call.title}`,
          metadata: {
            callId: call.id,
          },
        },
      });
    }

    return NextResponse.json(updatedCall);
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json(
      { error: 'Failed to update call' },
      { status: 500 }
    );
  }
}

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
    const call = await prisma.call.findUnique({
      where: { id: parseInt(id) },
    });

    if (!call || call.userId !== user.id) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    await prisma.call.delete({
      where: { id: parseInt(id) },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: call.dealId,
        action: 'call_deleted',
        description: `Call deleted: ${call.title}`,
        metadata: {
          callId: call.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting call:', error);
    return NextResponse.json(
      { error: 'Failed to delete call' },
      { status: 500 }
    );
  }
}
