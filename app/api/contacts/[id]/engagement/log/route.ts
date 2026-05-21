import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const USER_ID = 1; // Hardcoded for prototype

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactId = parseInt(id);
    const {
      dealId,
      eventType,
      eventDescription,
      responseTime,
      metadata,
      eventDate,
    } = await request.json();

    // Validate required fields
    if (!dealId || !eventType) {
      return NextResponse.json(
        { error: 'dealId and eventType are required' },
        { status: 400 }
      );
    }

    // Validate event type
    const validEventTypes = [
      'email_sent',
      'email_received',
      'call_made',
      'meeting_attended',
      'message_sent',
    ];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        {
          error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Verify contact exists and belongs to user
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { deal: true },
    });

    if (!contact || contact.userId !== USER_ID) {
      return NextResponse.json(
        { error: 'Contact not found or unauthorized' },
        { status: 404 }
      );
    }

    // Verify deal exists and matches
    if (contact.dealId !== dealId) {
      return NextResponse.json(
        { error: 'Contact does not belong to this deal' },
        { status: 400 }
      );
    }

    // Create engagement log entry
    const engagement = await prisma.contactEngagementLog.create({
      data: {
        userId: USER_ID,
        contactId,
        dealId,
        eventType,
        eventDescription: eventDescription || null,
        responseTime: responseTime ? parseInt(responseTime) : null,
        metadata: metadata || null,
        eventDate: eventDate ? new Date(eventDate) : new Date(),
      },
    });

    // Update contact.lastContactedAt
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastContactedAt: new Date() },
    });

    // Update deal.lastActivityAt
    await prisma.deal.update({
      where: { id: dealId },
      data: { lastActivityAt: new Date() },
    });

    // Create activity log for this engagement
    await prisma.activityLog.create({
      data: {
        userId: USER_ID,
        dealId,
        action: `contact_engaged_${eventType}`,
        description: `${contact.name} - ${eventDescription || eventType}`,
        metadata: {
          contactId,
          contactName: contact.name,
          contactEmail: contact.email,
          eventType,
          eventDescription,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        engagement,
        contact: {
          ...contact,
          lastContactedAt: new Date(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging engagement:', error);
    return NextResponse.json(
      {
        error: 'Failed to log engagement',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
