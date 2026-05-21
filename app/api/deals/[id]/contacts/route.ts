import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dealId = parseInt(id);

    // Verify deal exists and belongs to user
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal || deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Deal not found or unauthorized' },
        { status: 404 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        userId: USER_ID,
        dealId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching deal contacts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dealId = parseInt(id);
    const { name, email, title, role, company, linkedinUrl, notes } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'name and email are required' },
        { status: 400 }
      );
    }

    // Verify deal exists and belongs to user
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal || deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Deal not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check for duplicate email in deal
    const existing = await prisma.contact.findUnique({
      where: {
        dealId_email: {
          dealId,
          email,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Contact with this email already exists for this deal' },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        dealId,
        name,
        email,
        title: title || null,
        role: role || null,
        company: company || null,
        linkedinUrl: linkedinUrl || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating deal contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
