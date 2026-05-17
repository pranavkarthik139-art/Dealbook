import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { fetchGmailEmails, matchEmailToDeal } from '@/lib/gmail';

const USER_ID = 1; // hardcoded for prototype

export async function POST(request: NextRequest) {
  try {
    // Get user session (NextAuth stores OAuth tokens here)
    const session = await getServerSession() as any;

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please log in with Google first.' },
        { status: 400 }
      );
    }

    console.log('📧 Starting email sync for user:', USER_ID);

    // Fetch emails from Gmail using OAuth token
    const { emails } = await fetchGmailEmails(session.accessToken, 50);

    // Fetch all contacts for matching (email-based)
    const contacts = await prisma.contact.findMany({
      where: { userId: USER_ID },
      select: { dealId: true, email: true },
    });

    console.log(`📧 Found ${contacts.length} contacts for matching`);

    // Process each email
    let activitiesLogged = 0;
    const emailsWithDeals = emails.map(email => ({
      ...email,
      dealId: matchEmailToDeal(email, contacts),
    }));

    const matchedEmails = emailsWithDeals.filter(e => e.dealId);
    console.log(`📧 Matched ${matchedEmails.length} emails to deals`);

    for (const email of matchedEmails) {
      if (!email.dealId) continue;

      try {
        // Check if email already logged (via gmailId deduplication)
        const existing = await prisma.activityLog.findFirst({
          where: {
            dealId: email.dealId,
            action: 'email_received',
            metadata: {
              path: ['gmailId'],
              equals: email.id,
            },
          },
        });

        if (existing) {
          console.log(`📧 Email ${email.id} already logged, skipping`);
          continue;
        }

        // Create activity log
        const activity = await prisma.activityLog.create({
          data: {
            userId: USER_ID,
            dealId: email.dealId,
            action: 'email_received',
            description: `Email from ${email.from}: "${email.subject}"`,
            metadata: {
              gmailId: email.id,
              from: email.from,
              to: email.to,
              cc: email.cc || [],
              subject: email.subject,
              snippet: email.snippet.substring(0, 200),
            },
          },
        });

        // Update deal.lastActivityAt
        await prisma.deal.update({
          where: { id: email.dealId },
          data: { lastActivityAt: new Date() },
        });

        // Update contact.lastContactedAt if email is from contact
        const senderContact = contacts.find(
          c =>
            c.dealId === email.dealId &&
            c.email.toLowerCase() === email.from.toLowerCase()
        );

        if (senderContact) {
          await prisma.contact.updateMany({
            where: { dealId: email.dealId, email: senderContact.email },
            data: { lastContactedAt: new Date() },
          });
        }

        activitiesLogged++;
        console.log(
          `✅ Logged email activity for deal ${email.dealId}: "${email.subject}"`
        );
      } catch (error) {
        console.error(
          `Error processing email ${email.id} for deal ${email.dealId}:`,
          error
        );
      }
    }

    // Update last sync time
    await prisma.userPreference.update({
      where: { userId: USER_ID },
      data: { lastGmailSyncAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      emails: emailsWithDeals,
      matched: matchedEmails.length,
      total: emailsWithDeals.length,
      activitiesLogged,
      message: `Synced ${emailsWithDeals.length} emails, logged ${activitiesLogged} activities`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Email sync error:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync emails',
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
