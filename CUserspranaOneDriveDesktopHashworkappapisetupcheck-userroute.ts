import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json(
        { authenticated: false, error: 'Not logged in' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isManager: user.role === 'presales_lead' || user.role === 'admin',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
