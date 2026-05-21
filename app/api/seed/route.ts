import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Demo mode: hardcoded user ID
    const userId = 1;

    // First, delete all existing deals for this user to have a clean slate
    await prisma.activityLog.deleteMany({
      where: { userId },
    });
    await prisma.todo.deleteMany({
      where: { userId },
    });
    await prisma.deal.deleteMany({
      where: { userId },
    });

    // Create 12 mock deals with real companies
    const mockDeals = [
      {
        userId,
        name: 'Slack - Enterprise Upgrade & Integration',
        email: 'procurement@slack.com',
        amount: 350000,
        stage: 'validation',
        status: 'active',
      },
      {
        userId,
        name: 'Stripe - Payment Processing Suite',
        email: 'partnerships@stripe.com',
        amount: 125000,
        stage: 'poc',
        status: 'active',
      },
      {
        userId,
        name: 'Salesforce - CRM Implementation',
        email: 'deals@salesforce.com',
        amount: 500000,
        stage: 'demo',
        status: 'active',
      },
      {
        userId,
        name: 'Figma - Design System Rollout',
        email: 'business@figma.com',
        amount: 180000,
        stage: 'validation',
        status: 'active',
      },
      {
        userId,
        name: 'Notion - Enterprise Wiki Platform',
        email: 'enterprise@notion.so',
        amount: 95000,
        stage: 'poc',
        status: 'active',
      },
      {
        userId,
        name: 'Airtable - Database Platform Migration',
        email: 'business@airtable.com',
        amount: 275000,
        stage: 'validation',
        status: 'active',
      },
      {
        userId,
        name: 'Asana - Project Management Suite',
        email: 'sales@asana.com',
        amount: 220000,
        stage: 'demo',
        status: 'active',
      },
      {
        userId,
        name: 'Monday.com - Workflow Automation',
        email: 'enterprise@monday.com',
        amount: 180000,
        stage: 'poc',
        status: 'active',
      },
      {
        userId,
        name: 'Miro - Digital Whiteboarding Platform',
        email: 'business@miro.com',
        amount: 145000,
        stage: 'validation',
        status: 'active',
      },
      {
        userId,
        name: 'Zapier - Integration Platform',
        email: 'enterprise@zapier.com',
        amount: 95000,
        stage: 'demo',
        status: 'active',
      },
      {
        userId,
        name: 'Auth0 - Identity Platform',
        email: 'sales@auth0.com',
        amount: 320000,
        stage: 'poc',
        status: 'active',
      },
      {
        userId,
        name: 'Datadog - Monitoring & Analytics',
        email: 'enterprise@datadog.com',
        amount: 425000,
        stage: 'validation',
        status: 'active',
      },
    ];

    const createdDeals = [];

    for (const deal of mockDeals) {
      const created = await prisma.deal.create({
        data: {
          ...deal,
          lastActivityAt: new Date(),
        },
      });

      // Log activity for each deal
      await prisma.activityLog.create({
        data: {
          userId,
          dealId: created.id,
          action: 'deal_created',
          description: `Deal "${created.name}" created via seed`,
        },
      });

      createdDeals.push(created);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdDeals.length} mock deals`,
      deals: createdDeals,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed deals', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
