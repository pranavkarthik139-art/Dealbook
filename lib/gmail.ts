import { google } from 'googleapis';

export interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body?: string;
  date: Date;
  labels: string[];
}

export function matchEmailToDeal(
  email: GmailEmail,
  contacts: Array<{ dealId: number; email: string }>
): number | undefined {
  // Priority 1: Exact email match with contact emails
  const allEmails = [email.from, ...email.to, ...(email.cc || [])];

  for (const contact of contacts) {
    if (allEmails.some(e => e.toLowerCase() === contact.email.toLowerCase())) {
      return contact.dealId;
    }
  }

  return undefined;
}

export async function fetchGmailEmails(
  accessToken: string,
  limit: number = 50,
  pageToken?: string
): Promise<{ emails: GmailEmail[]; nextPageToken?: string }> {
  try {
    // Set up authentication
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      process.env.NEXTAUTH_URL || 'http://localhost:3000/api/auth/callback/google'
    );
    auth.setCredentials({ access_token: accessToken });

    const gmailWithAuth = google.gmail({
      version: 'v1',
      auth: auth,
    });

    console.log('📧 Fetching emails from Gmail...');

    const response = await gmailWithAuth.users.messages.list({
      userId: 'me',
      maxResults: limit,
      pageToken,
      q: 'is:unread',
    });

    const messages = response.data.messages || [];

    const emails: GmailEmail[] = await Promise.all(
      messages.map(async (msg) => {
        try {
          const fullMsg = await gmailWithAuth.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          });

          const headers = fullMsg.data.payload?.headers || [];
          const fromHeader = headers.find(h => h.name === 'From')?.value || '';
          const toHeader = headers.find(h => h.name === 'To')?.value || '';
          const ccHeader = headers.find(h => h.name === 'Cc')?.value || '';
          const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
          const date = new Date(parseInt(fullMsg.data.internalDate || '0'));

          // Extract email addresses from headers
          const extractEmails = (header: string) =>
            header
              .split(',')
              .map(e => {
                // Handle "Name <email@example.com>" format
                const match = e.match(/<(.+?)>/);
                return match ? match[1].trim() : e.trim();
              })
              .filter(Boolean);

          return {
            id: msg.id!,
            threadId: msg.threadId!,
            from: extractEmails(fromHeader)[0] || '',
            to: extractEmails(toHeader),
            cc: extractEmails(ccHeader),
            subject,
            snippet: fullMsg.data.snippet || '',
            body: fullMsg.data.payload?.parts?.[0]?.body?.data || '',
            date,
            labels: fullMsg.data.labelIds || [],
          };
        } catch (error) {
          console.error(`Error fetching message ${msg.id}:`, error);
          throw error;
        }
      })
    );

    console.log(`📧 Retrieved ${emails.length} emails from Gmail`);

    return {
      emails,
      nextPageToken: response.data.nextPageToken ?? undefined,
    };
  } catch (error) {
    console.error('❌ Error fetching Gmail emails:', error);
    throw error;
  }
}
