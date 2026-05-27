import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    // Reassign all deals from userId 1 to current user
    const dealsUpdated = await prisma.deal.updateMany({
      where: { userId: 1 },
      data: { userId: user.id }
    });

    // Reassign all contacts
    const contactsUpdated = await prisma.contact.updateMany({
      where: { userId: 1 },
      data: { userId: user.id }
    });

    // Reassign all activities
    const activitiesUpdated = await prisma.activityLog.updateMany({
      where: { userId: 1 },
      data: { userId: user.id }
    });

    return NextResponse.json({
      success: true,
      message: 'All deals reassigned to your account',
      deals: dealsUpdated.count,
      contacts: contactsUpdated.count,
      activities: activitiesUpdated.count,
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('[Fix Deals] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fix deals', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
