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
    const contactId = parseInt(id);

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact || contact.userId !== user.id) {
      return NextResponse.json(
        { error: 'Contact not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const contactId = parseInt(id);
    const { name, email, title, role, company, linkedinUrl, notes } = await request.json();

    // Verify contact exists and belongs to user
    const existing = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Contact not found or unauthorized' },
        { status: 404 }
      );
    }

    // If email is being changed, check for duplicates in the deal
    if (email && email !== existing.email) {
      const duplicate = await prisma.contact.findUnique({
        where: {
          dealId_email: {
            dealId: existing.dealId,
            email,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Contact with this email already exists for this deal' },
          { status: 409 }
        );
      }
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(title !== undefined && { title: title || null }),
        ...(role !== undefined && { role: role || null }),
        ...(company !== undefined && { company: company || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const contactId = parseInt(id);

    // Verify contact exists and belongs to user
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact || contact.userId !== user.id) {
      return NextResponse.json(
        { error: 'Contact not found or unauthorized' },
        { status: 404 }
      );
    }

    // If this is the primary contact for the deal, clear that reference
    await prisma.deal.updateMany({
      where: { primaryContactId: contactId },
      data: { primaryContactId: null },
    });

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
