import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { fetchGmailEmails } from '@/lib/gmail';

/**
 * Debug endpoint to check Gmail integration status and diagnose issues
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

    // 1. Check if user has Google OAuth account
    const googleAccount = await prisma.account.findFirst({
      where: { userId, provider: 'google' },
      select: {
        access_token: true,
        refresh_token: true,
        expires_at: true,
        provider: true,
        userId: true,
      },
    });

    if (!googleAccount) {
      return NextResponse.json({
        status: 'no_oauth',
        message: 'User has not linked Google account. Please sign in with Google first.',
        user: { id: userId, email: user.email },
      });
    }

    // 2. Check token validity
    const expiresAt = googleAccount.expires_at ? new Date(googleAccount.expires_at * 1000) : null;
    const isExpired = expiresAt ? expiresAt < new Date() : false;

    // 3. Try to fetch emails
    let emailFetchResult: any = null;
    try {
      const result = await fetchGmailEmails(googleAccount.access_token, 10);
      emailFetchResult = {
        success: true,
        emailsFound: result.emails.length,
        emails: result.emails.map(e => ({
          id: e.id,
          from: e.from,
          to: e.to,
          subject: e.subject,
          date: e.date,
        })),
      };
    } catch (error) {
      emailFetchResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // 4. Get last sync time
    const userPref = await prisma.userPreference.findUnique({
      where: { userId },
      select: { lastGmailSyncAt: true },
    });

    // 5. Get all contacts for this user
    const contacts = await prisma.contact.findMany({
      where: { userId },
      select: { dealId: true, email: true, name: true },
    });

    return NextResponse.json({
      status: 'ok',
      user: {
        id: userId,
        email: user.email,
        name: user.name,
      },
      oauth: {
        provider: googleAccount.provider,
        hasAccessToken: !!googleAccount.access_token,
        hasRefreshToken: !!googleAccount.refresh_token,
        tokenExpiredAt: expiresAt?.toISOString() || null,
        isTokenExpired: isExpired,
      },
      emailFetch: emailFetchResult,
      lastSync: userPref?.lastGmailSyncAt?.toISOString() || null,
      contacts: {
        count: contacts.length,
        list: contacts.map(c => ({ dealId: c.dealId, email: c.email, name: c.name })),
      },
      diagnostics: {
        readyToSync: !isExpired && !!googleAccount.access_token && emailFetchResult.success,
        issuesSummary: [
          !googleAccount.access_token ? 'No access token found' : null,
          isExpired ? 'OAuth token expired' : null,
          !emailFetchResult.success ? `Email fetch failed: ${emailFetchResult.error}` : null,
          contacts.length === 0 ? 'No contacts configured for matching' : null,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Gmail status debug error:', msg);
    return NextResponse.json(
      {
        status: 'error',
        message: msg,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
