import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * Set the current user to admin role
 * Only works if user exists in database
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    // Update user role to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    });

    return NextResponse.json({
      success: true,
      message: 'User role updated to admin',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('[Set Admin] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
