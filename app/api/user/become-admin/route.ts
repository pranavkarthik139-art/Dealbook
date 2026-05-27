import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * POST endpoint to set current user to admin
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated to admin',
      user: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
