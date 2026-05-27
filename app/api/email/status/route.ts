import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';

/**
 * Check Gmail integration status and OAuth token validity
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

    // Check if user has Google OAuth account with access token
    const googleAccount = await prisma.account.findFirst({
      where: { userId, provider: 'google' },
      select: {
        access_token: true,
        refresh_token: true,
        expires_at: true,
        id: true,
      },
    });

    if (!googleAccount) {
      return NextResponse.json({
        connected: false,
        message: 'Gmail not connected. Please sign in with Google first.',
      });
    }

    const hasAccessToken = !!googleAccount.access_token;
    const hasRefreshToken = !!googleAccount.refresh_token;
    const expiresAt = googleAccount.expires_at ? new Date(googleAccount.expires_at * 1000) : null;
    const isExpired = expiresAt ? expiresAt < new Date() : false;

    // Get last sync time
    const userPref = await prisma.userPreference.findUnique({
      where: { userId },
      select: { lastGmailSyncAt: true },
    });

    return NextResponse.json({
      connected: true,
      hasAccessToken,
      hasRefreshToken,
      isExpired,
      expiresAt: expiresAt?.toISOString() || null,
      lastSyncAt: userPref?.lastGmailSyncAt?.toISOString() || null,
      message: 'Gmail is connected and ready to sync',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error checking email status:', msg);
    return NextResponse.json(
      { error: 'Failed to check email status', message: msg },
      { status: 500 }
    );
  }
}
