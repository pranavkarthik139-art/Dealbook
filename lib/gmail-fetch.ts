'use server';

import { google } from 'googleapis';

export interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body: string;
  date: Date;
  isIncoming: boolean; // true if from prospect, false if from us
}

/**
 * Fetch emails from Gmail where prospect email is involved
 * Returns emails in reverse chronological order (newest first)
 */
export async function fetchEmailsForContact(
  accessToken: string,
  prospectEmail: string,
  limit: number = 50
): Promise<GmailEmail[]> {
  try {
    const gmail = google.gmail({ version: 'v1', auth: accessToken });

    // Query: emails involving the prospect email
    // Include both incoming (from prospect) and outgoing (to prospect)
    const query = `(from:${prospectEmail} OR to:${prospectEmail}) in:anywhere`;

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: limit,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return [];
    }

    // Fetch full message details for each email
    const emails: GmailEmail[] = await Promise.all(
      response.data.messages.map(async (msg) => {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        });

        const headers = fullMsg.data.payload?.headers || [];
        const from = headers.find(h => h.name === 'From')?.value || '';
        const to = (headers.find(h => h.name === 'To')?.value || '').split(',').map(e => e.trim()).filter(Boolean);
        const cc = (headers.find(h => h.name === 'Cc')?.value || '').split(',').map(e => e.trim()).filter(Boolean);
        const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
        const dateStr = headers.find(h => h.name === 'Date')?.value || '';
        const date = new Date(dateStr);

        // Extract email body (plain text or HTML)
        let body = '';
        const parts = fullMsg.data.payload?.parts || [];

        // Look for plain text part first, then HTML
        const textPart = parts.find(p => p.mimeType === 'text/plain');
        const htmlPart = parts.find(p => p.mimeType === 'text/html');
        const selectedPart = textPart || htmlPart;

        if (selectedPart?.body?.data) {
          body = Buffer.from(selectedPart.body.data, 'base64').toString('utf-8');
        } else if (fullMsg.data.payload?.body?.data) {
          body = Buffer.from(fullMsg.data.payload.body.data, 'base64').toString('utf-8');
        }

        // Determine if email is incoming (from prospect) or outgoing (to prospect)
        const isIncoming = from.toLowerCase().includes(prospectEmail.toLowerCase());

        return {
          id: msg.id!,
          threadId: msg.threadId!,
          from,
          to,
          cc: cc.length > 0 ? cc : undefined,
          subject,
          snippet: fullMsg.data.snippet || '',
          body: body.trim(),
          date,
          isIncoming,
        };
      })
    );

    // Sort by date descending (newest first)
    return emails.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error fetching emails from Gmail:', error);
    return [];
  }
}

