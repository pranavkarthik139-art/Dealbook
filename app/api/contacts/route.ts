import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const USER_ID = 1; // hardcoded for prototype

export async function GET(request: NextRequest) {
  try {
    const dealId = request.nextUrl.searchParams.get('dealId');

    if (!dealId) {
      return NextResponse.json(
        { error: 'dealId query parameter required' },
        { status: 400 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        userId: USER_ID,
        dealId: parseInt(dealId),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dealId, name, email, title, role, company, linkedinUrl, notes } = await request.json();

    if (!dealId || !name || !email) {
      return NextResponse.json(
        { error: 'dealId, name, and email are required' },
        { status: 400 }
      );
    }

    // Verify deal exists and belongs to user
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(dealId) },
    });

    if (!deal || deal.userId !== USER_ID) {
      return NextResponse.json(
        { error: 'Deal not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check for duplicate email in deal
    const existing = await prisma.contact.findUnique({
      where: {
        dealId_email: {
          dealId: parseInt(dealId),
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
        userId: USER_ID,
        dealId: parseInt(dealId),
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
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
