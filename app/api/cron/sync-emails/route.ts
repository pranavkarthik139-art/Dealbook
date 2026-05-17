import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchGmailEmails, matchEmailToDeal } from '@/lib/gmail';

// Verify cron secret to prevent unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET || 'default-dev-secret';

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all users who have Gmail connected
    const usersWithGmail = await prisma.userPreference.findMany({
      where: {
        gmailToken: { not: null },
      },
      select: {
        userId: true,
        gmailToken: true,
        lastGmailSyncAt: true,
      },
    });

    console.log(`[Email Sync] Starting sync for ${usersWithGmail.length} users`);

    const results: any[] = [];

    for (const userPref of usersWithGmail) {
      try {
        if (!userPref.gmailToken) continue;

        const USER_ID = userPref.userId;

        // Fetch emails from Gmail
        const { emails } = await fetchGmailEmails(userPref.gmailToken, 50);

        // Fetch all deals + contacts for matching
        const deals = await prisma.deal.findMany({
          where: { userId: USER_ID },
          select: { id: true, name: true, email: true },
        });

        const contacts = await prisma.contact.findMany({
          where: { userId: USER_ID },
          select: { dealId: true, email: true },
        });

        // Process each email
        let activitiesLogged = 0;
        const emailsWithDeals = emails.map(email => ({
          ...email,
          dealId: matchEmailToDeal(email, deals, contacts),
        }));

        for (const email of emailsWithDeals) {
          if (email.dealId) {
            // Check if email already logged
            const existing = await prisma.activityLog.findFirst({
              where: {
                dealId: email.dealId,
                metadata: { path: ['gmailId'], equals: email.id },
              },
            });

            if (existing) continue;

            // Create activity log
            await prisma.activityLog.create({
              data: {
                userId: USER_ID,
                dealId: email.dealId,
                action: 'email_received',
                description: `Email from ${email.from}: "${email.subject}"`,
                metadata: {
                  gmailId: email.id,
                  from: email.from,
                  to: email.to,
                  subject: email.subject,
                  snippet: email.snippet,
                },
              },
            });

            // Update deal.lastActivityAt
            await prisma.deal.update({
              where: { id: email.dealId },
              data: { lastActivityAt: new Date() },
            });

            // Update contact.lastContactedAt
            const contact = contacts.find(
              c => c.dealId === email.dealId && (email.to.includes(c.email) || email.from === c.email)
            );
            if (contact) {
              await prisma.contact.updateMany({
                where: { dealId: email.dealId, email: contact.email },
                data: { lastContactedAt: new Date() },
              });
            }

            activitiesLogged++;
          }
        }

        // Update last sync time
        await prisma.userPreference.update({
          where: { userId: USER_ID },
          data: { lastGmailSyncAt: new Date() },
        });

        results.push({
          userId: USER_ID,
          emailsProcessed: emailsWithDeals.length,
          emailsMatched: emailsWithDeals.filter(e => e.dealId).length,
          activitiesLogged,
        });

        console.log(`[Email Sync] User ${USER_ID}: ${emailsWithDeals.length} emails, ${activitiesLogged} logged`);
      } catch (error) {
        console.error(`[Email Sync] Error for user ${userPref.userId}:`, error);
        results.push({
          userId: userPref.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced emails for ${usersWithGmail.length} users`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Email Sync] Cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Email sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
