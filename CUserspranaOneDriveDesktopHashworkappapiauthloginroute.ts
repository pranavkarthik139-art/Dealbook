import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/db';

/**
 * Track user login activity
 * Called after successful NextAuth login
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log login activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'user_login',
        description: `${user.name} (${user.role}) logged in`,
        metadata: {
          email: user.email,
          role: user.role,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Update user's last activity timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track login' },
      { status: 500 }
    );
  }
}
