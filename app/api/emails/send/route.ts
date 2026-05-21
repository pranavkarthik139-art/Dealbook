import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { renderTemplate, emailTemplates } from '@/lib/emailTemplates';

const USER_ID = 1; // Hardcoded for prototype

interface SendEmailRequest {
  dealIds: number[];
  subject: string;
  body: string;
  template?: 'follow_up' | 'poc_reminder' | 'next_steps' | 'demo_schedule' | 'custom';
  includeUnsubscribe?: boolean;
}

interface EmailRecipient {
  contactId: number;
  contactName: string;
  email: string;
  dealId: number;
  dealName: string;
}

/**
 * Fetch all contacts for specified deals
 * Deduplicates by email address (takes last occurrence by deal)
 */
async function getRecipientsForDeals(dealIds: number[]): Promise<EmailRecipient[]> {
  const deals = await prisma.deal.findMany({
    where: {
      id: { in: dealIds },
      userId: USER_ID,
    },
    select: {
      id: true,
      name: true,
      contacts: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const recipients: EmailRecipient[] = [];
  const emailMap = new Map<string, EmailRecipient>();

  // Flatten contacts and track by email
  for (const deal of deals) {
    for (const contact of deal.contacts) {
      emailMap.set(contact.email, {
        contactId: contact.id,
        contactName: contact.name,
        email: contact.email,
        dealId: deal.id,
        dealName: deal.name,
      });
    }
  }

  recipients.push(...Array.from(emailMap.values()));
  return recipients;
}

/**
 * Send emails via Resend (or mock if not configured)
 */
async function sendEmailViaResend(
  subject: string,
  body: string,
  toEmail: string
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Mock send for development
    console.log(
      `[MOCK SEND] To: ${toEmail}, Subject: ${subject}, Body: ${body.substring(0, 50)}...`
    );
    return true;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@hashwork.dev',
        to: toEmail,
        subject,
        html: body.replace(/\n/g, '<br>'),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();
    const { dealIds, subject, body: emailBody, template } = body;

    if (!dealIds || dealIds.length === 0) {
      return NextResponse.json(
        { error: 'dealIds array is required' },
        { status: 400 }
      );
    }

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'subject and body are required' },
        { status: 400 }
      );
    }

    // Get all recipients for these deals
    const recipients = await getRecipientsForDeals(dealIds);

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          success: true,
          sent: 0,
          failed: 0,
          errors: [],
          message: 'No recipients found for the selected deals',
        },
        { status: 200 }
      );
    }

    // Send emails and log activities
    let sentCount = 0;
    let failedCount = 0;
    const errors: Array<{ email: string; reason: string }> = [];

    for (const recipient of recipients) {
      try {
        // Render template with actual values
        const finalSubject = subject
          .replace(/{{dealName}}/g, recipient.dealName)
          .replace(/{{contactName}}/g, recipient.contactName);

        const finalBody = emailBody
          .replace(/{{dealName}}/g, recipient.dealName)
          .replace(/{{contactName}}/g, recipient.contactName);

        // Send email
        const sendSuccess = await sendEmailViaResend(
          finalSubject,
          finalBody,
          recipient.email
        );

        if (sendSuccess) {
          // Create engagement log entry
          await prisma.contactEngagementLog.create({
            data: {
              userId: USER_ID,
              contactId: recipient.contactId,
              dealId: recipient.dealId,
              eventType: 'email_sent',
              eventDescription: finalSubject,
              metadata: {
                batchEmailSend: true,
                emailSubject: finalSubject,
                templateUsed: template || 'custom',
              },
              eventDate: new Date(),
            },
          });

          // Update contact.lastContactedAt
          await prisma.contact.update({
            where: { id: recipient.contactId },
            data: { lastContactedAt: new Date() },
          });

          // Update deal.lastActivityAt
          await prisma.deal.update({
            where: { id: recipient.dealId },
            data: { lastActivityAt: new Date() },
          });

          // Log activity
          await prisma.activityLog.create({
            data: {
              userId: USER_ID,
              dealId: recipient.dealId,
              action: 'batch_email_sent',
              description: `Batch email sent to ${recipient.contactName}: "${finalSubject}"`,
              metadata: {
                contactId: recipient.contactId,
                contactEmail: recipient.email,
                templateUsed: template || 'custom',
              },
            },
          });

          sentCount++;
        } else {
          failedCount++;
          errors.push({
            email: recipient.email,
            reason: 'Failed to send via email service',
          });
        }
      } catch (error) {
        failedCount++;
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          email: recipient.email,
          reason: errorMsg,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: recipients.length,
        errors,
        message: `Sent ${sentCount} emails${failedCount > 0 ? `, failed: ${failedCount}` : ''}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending batch emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send emails',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
