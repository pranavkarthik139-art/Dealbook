import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    // Only admins can set roles
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can set user roles' },
        { status: 403 }
      );
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'email and role are required' },
        { status: 400 }
      );
    }

    // Valid roles
    const validRoles = ['admin', 'presales_lead', 'sales_engineer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
