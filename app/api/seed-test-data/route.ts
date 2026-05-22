import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Seed test data for the demo
 * Auth disabled for MVP
 */
export async function POST() {
  try {
    // Auth disabled - use default user ID 1
    const USER_ID = 1;

    // Create test deals
    const deals = await Promise.all([
      prisma.deal.create({
        data: {
          userId: USER_ID,
          name: 'Acme Corp - POC',
          email: 'john@acmecorp.com',
          amount: 250000,
          status: 'active',
          stage: 'poc',
          probability: 75,
          leadSource: 'inbound',
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      }),
      prisma.deal.create({
        data: {
          userId: USER_ID,
          name: 'TechStart - Enterprise Deal',
          email: 'sarah@techstart.com',
          amount: 500000,
          status: 'active',
          stage: 'validation',
          probability: 60,
          leadSource: 'outbound',
          expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        },
      }),
      prisma.deal.create({
        data: {
          userId: USER_ID,
          name: 'Global Industries - Demo',
          email: 'mike@globalind.com',
          amount: 100000,
          status: 'active',
          stage: 'demo',
          probability: 30,
          leadSource: 'referral',
          expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
      }),
      prisma.deal.create({
        data: {
          userId: USER_ID,
          name: 'Innovate Labs - Closed',
          email: 'emma@innovatelabs.com',
          amount: 350000,
          status: 'closed',
          stage: 'closed',
          probability: 100,
          leadSource: 'partner',
          expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      }),
    ]);

    // Create contacts for each deal
    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      await prisma.contact.create({
        data: {
          userId: USER_ID,
          dealId: deal.id,
          name: deal.email?.split('@')[0].replace('.', ' ').toUpperCase() || 'Contact',
          email: deal.email || 'contact@example.com',
          title: 'VP of Sales',
          role: 'decision_maker',
          company: deal.name.split(' - ')[0],
        },
      });
    }

    // Create activity logs
    for (const deal of deals) {
      await prisma.activityLog.create({
        data: {
          userId: USER_ID,
          dealId: deal.id,
          action: 'deal_created',
          description: `Deal "${deal.name}" created`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Test data seeded successfully',
      user: {
        id: USER_ID,
        email: 'demo@dealbook.com',
        name: 'Demo User',
      },
      dealsCreated: deals.length,
      deals: deals.map(d => ({
        id: d.id,
        name: d.name,
        stage: d.stage,
        status: d.status,
        amount: d.amount,
      })),
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed test data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if test data exists
 */
export async function GET() {
  try {
    const USER_ID = 1;

    const dealCount = await prisma.deal.count({
      where: { userId: USER_ID },
    });

    return NextResponse.json({
      hasTestData: dealCount > 0,
      dealCount,
      email: 'demo@dealbook.com',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check test data' },
      { status: 500 }
    );
  }
}
