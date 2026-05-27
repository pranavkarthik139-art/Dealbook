import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
  try {
    // 1. Check session
    const session = await getServerSession(authOptions);

    // 2. Check user extraction
    const user = await getCurrentUser();

    // 3. Check database connection
    const userCount = await prisma.user.count();
    const dealCount = await prisma.deal.count();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        email: session?.user?.email || 'no session',
      },
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        role: user?.role,
      },
      database: {
        users: userCount,
        deals: dealCount,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
