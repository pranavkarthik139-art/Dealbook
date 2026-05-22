import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchEmailsForContact } from '@/lib/gmail-fetch';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dealId = parseInt(id);

    // Get the deal
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        primaryContact: true, // Relation to Contact model
      },
    });

    if (!deal || deal.userId !== parseInt(user.id)) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Get prospect email from deal
    // Priority: primaryContact.email > deal.email
    const prospectEmail = deal.primaryContact?.email || deal.email;

    if (!prospectEmail) {
      return NextResponse.json(
        { emails: [], message: 'No prospect email found for this deal' },
        { status: 200 }
      );
    }

    // Get Gmail token from user preferences
    const userPref = await prisma.userPreference.findUnique({
      where: { userId: parseInt(user.id) },
    });

    if (!userPref?.gmailToken) {
      return NextResponse.json(
        {
          emails: [],
          prospectEmail,
          message: 'Gmail not connected. Please authorize email access in settings.'
        },
        { status: 200 }
      );
    }

    // Fetch emails from Gmail for this prospect
    const emails = await fetchEmailsForContact(userPref.gmailToken, prospectEmail, 50);

    return NextResponse.json({
      emails,
      prospectEmail,
      count: emails.length,
    });
  } catch (error) {
    console.error('Error fetching emails for deal:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
