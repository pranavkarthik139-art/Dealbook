import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * Rich test data with real companies and Apollo-style enrichment
 * 2 deals per evaluation phase (8 total)
 */
const REAL_DEALS = [
  // DEMO STAGE (2 deals)
  {
    name: 'Notion Integration Platform',
    amount: 450000,
    stage: 'demo',
    status: 'active',
    probability: 45,
    leadSource: 'referral',
    daysToClose: 45,
    company: {
      name: 'Notion Labs, Inc.',
      industry: 'Productivity / Workspace Platform',
      employees: '200 - 400',
      funding: '$10B (Series C)',
      founded: '2016',
      headquarters: 'San Francisco, CA',
      website: 'notion.so',
      annualRevenue: '$100M+',
    },
    contacts: [
      { name: 'Sarah Anderson', email: 'sanderson@notion.so', title: 'Head of Partnerships', role: 'decision_maker' },
      { name: 'Tom Wellington', email: 'twellington@notion.so', title: 'Product Manager', role: 'influencer' },
    ],
  },
  {
    name: 'GitHub Enterprise Cloud',
    amount: 650000,
    stage: 'demo',
    status: 'active',
    probability: 52,
    leadSource: 'outbound',
    daysToClose: 52,
    company: {
      name: 'GitHub, Inc. (Microsoft)',
      industry: 'Developer Platform / Version Control',
      employees: '2,000+',
      funding: 'Public (via Microsoft)',
      founded: '2008',
      headquarters: 'San Francisco, CA',
      website: 'github.com',
      annualRevenue: 'Part of Microsoft ($200B+)',
    },
    contacts: [
      { name: 'Emily Laurent', email: 'elauring@github.com', title: 'Enterprise Sales Manager', role: 'decision_maker' },
      { name: 'Dev Patel', email: 'dpatel@github.com', title: 'Solutions Engineer', role: 'technical_buyer' },
    ],
  },
  // POC STAGE (2 deals)
  {
    name: 'Figma Design Systems',
    amount: 750000,
    stage: 'poc',
    status: 'active',
    probability: 72,
    leadSource: 'outbound',
    daysToClose: 35,
    company: {
      name: 'Figma, Inc.',
      industry: 'Design & Collaboration Tools',
      employees: '800 - 1,200',
      funding: '$15B (Series E)',
      founded: '2012',
      headquarters: 'San Francisco, CA',
      website: 'figma.com',
      annualRevenue: '$400M+',
    },
    contacts: [
      { name: 'Priya Patel', email: 'priya.patel@figma.com', title: 'Chief Commercial Officer', role: 'economic_buyer' },
      { name: 'David Kim', email: 'david.kim@figma.com', title: 'Solutions Architect', role: 'technical_buyer' },
      { name: 'Linda Nguyen', email: 'linda.nguyen@figma.com', title: 'VP of Operations', role: 'influencer' },
    ],
  },
  {
    name: 'Asana Work Management Platform',
    amount: 620000,
    stage: 'poc',
    status: 'active',
    probability: 68,
    leadSource: 'inbound',
    daysToClose: 38,
    company: {
      name: 'Asana, Inc.',
      industry: 'Work Management / Productivity',
      employees: '1,200 - 1,500',
      funding: '$12B (Public - ASAN)',
      founded: '2008',
      headquarters: 'San Francisco, CA',
      website: 'asana.com',
      annualRevenue: '$500M+',
    },
    contacts: [
      { name: 'Marcus Johnson', email: 'mjohnson@asana.com', title: 'Head of Enterprise Sales', role: 'decision_maker' },
      { name: 'Sophia Chen', email: 'schen@asana.com', title: 'Customer Success Manager', role: 'technical_buyer' },
      { name: 'Patrick Moore', email: 'pmoore@asana.com', title: 'Solutions Engineer', role: 'influencer' },
    ],
  },
  // VALIDATION STAGE (2 deals)
  {
    name: 'Slack Technologies',
    amount: 1200000,
    stage: 'validation',
    status: 'active',
    probability: 85,
    leadSource: 'inbound',
    daysToClose: 20,
    company: {
      name: 'Slack Technologies, Inc.',
      industry: 'SaaS / Team Communication',
      employees: '2,500 - 5,000',
      funding: '$7.1B (Series D)',
      founded: '2011',
      headquarters: 'San Francisco, CA',
      website: 'slack.com',
      annualRevenue: '$1.1B+',
    },
    contacts: [
      { name: 'Alex Chen', email: 'alex.chen@slack.com', title: 'VP of Sales Operations', role: 'decision_maker' },
      { name: 'Maria Rodriguez', email: 'maria.rodriguez@slack.com', title: 'Director of Procurement', role: 'influencer' },
      { name: 'James Park', email: 'james.park@slack.com', title: 'Senior Sales Engineer', role: 'technical_buyer' },
    ],
  },
  {
    name: 'Stripe Payment Processing',
    amount: 890000,
    stage: 'validation',
    status: 'active',
    probability: 78,
    leadSource: 'inbound',
    daysToClose: 28,
    company: {
      name: 'Stripe, Inc.',
      industry: 'Payment Processing & Fintech',
      employees: '3,500 - 5,000',
      funding: '$95B (Private)',
      founded: '2010',
      headquarters: 'San Francisco, CA',
      website: 'stripe.com',
      annualRevenue: '$500M+',
    },
    contacts: [
      { name: 'Michael Zhang', email: 'michael.zhang@stripe.com', title: 'Senior Account Executive', role: 'decision_maker' },
      { name: 'Lisa Wong', email: 'lisa.wong@stripe.com', title: 'Technical Solutions Engineer', role: 'technical_buyer' },
      { name: 'Robert Chen', email: 'robert.chen@stripe.com', title: 'Director of Enterprise', role: 'influencer' },
    ],
  },
  // CLOSED STAGE (2 deals)
  {
    name: 'HubSpot CRM Expansion',
    amount: 2100000,
    stage: 'closed',
    status: 'closed',
    probability: 100,
    leadSource: 'partner',
    daysToClose: -8,
    company: {
      name: 'HubSpot, Inc.',
      industry: 'CRM & Marketing Automation',
      employees: '7,000+',
      funding: 'Public (HUBS)',
      founded: '2006',
      headquarters: 'Cambridge, MA',
      website: 'hubspot.com',
      annualRevenue: '$1.6B+',
    },
    contacts: [
      { name: 'Jennifer Santos', email: 'jsantos@hubspot.com', title: 'VP of Enterprise Sales', role: 'economic_buyer' },
      { name: 'David Walsh', email: 'dwalsh@hubspot.com', title: 'Director of Partnerships', role: 'influencer' },
    ],
  },
  {
    name: 'Atlassian Jira Implementation',
    amount: 1650000,
    stage: 'closed',
    status: 'closed',
    probability: 100,
    leadSource: 'partner',
    daysToClose: -15,
    company: {
      name: 'Atlassian Corporation',
      industry: 'Software Development & Collaboration',
      employees: '4,500+',
      funding: 'Public (TEAM)',
      founded: '2002',
      headquarters: 'Sydney, Australia (HQ in California)',
      website: 'atlassian.com',
      annualRevenue: '$2.3B+',
    },
    contacts: [
      { name: 'Katherine Powell', email: 'kpowell@atlassian.com', title: 'VP of Enterprise Solutions', role: 'decision_maker' },
      { name: 'Nathan Rodriguez', email: 'nrodriguez@atlassian.com', title: 'Solutions Architect', role: 'technical_buyer' },
      { name: 'Grace Liu', email: 'gliu@atlassian.com', title: 'Account Manager', role: 'influencer' },
    ],
  },
];

/**
 * Seed test data for the demo
 */
export async function POST() {
  try {
    // Get the currently logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to seed data' },
        { status: 401 }
      );
    }

    const USER_ID = user.id;
    console.log(`[Seed] Seeding data for user ${user.email} (ID: ${USER_ID})`);

    // First, delete existing data to avoid conflicts
    await prisma.contact.deleteMany({ where: { userId: USER_ID } });
    await prisma.activityLog.deleteMany({ where: { userId: USER_ID } });
    await prisma.deal.deleteMany({ where: { userId: USER_ID } });

    // Create deals with enrichment metadata
    const deals = await Promise.all(
      REAL_DEALS.map((dealData) =>
        prisma.deal.create({
          data: {
            userId: USER_ID,
            name: dealData.name,
            email: dealData.contacts[0]?.email || 'contact@example.com',
            amount: dealData.amount,
            status: dealData.status,
            stage: dealData.stage,
            probability: dealData.probability,
            leadSource: dealData.leadSource,
            expectedCloseDate: new Date(
              Date.now() + dealData.daysToClose * 24 * 60 * 60 * 1000
            ),
          },
        })
      )
    );

    // Create contacts with enrichment data
    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      const dealData = REAL_DEALS[i];

      // Add multiple contacts per deal
      for (const contact of dealData.contacts) {
        await prisma.contact.create({
          data: {
            userId: USER_ID,
            dealId: deal.id,
            name: contact.name,
            email: contact.email,
            title: contact.title,
            role: contact.role,
            company: dealData.company.name,
            notes: `Apollo Enrichment:\n📊 Company Size: ${dealData.company.employees}\n💰 Funding: ${dealData.company.funding}\n🏢 Headquarters: ${dealData.company.headquarters}\n🌐 Website: ${dealData.company.website}`,
          },
        });
      }

      // Create activity logs with timeline
      const activities = [
        {
          action: 'deal_created',
          description: `Deal "${dealData.name}" created from ${dealData.leadSource} lead`,
          daysAgo: Math.floor(Math.random() * 30) + 5,
        },
        {
          action: 'email_received',
          description: `Email from ${dealData.contacts[0]?.name}: "Interested in discussing implementation timeline"`,
          daysAgo: Math.floor(Math.random() * 20) + 2,
        },
        {
          action: 'call_logged',
          description: `Discovery call with ${dealData.contacts[0]?.name} - High interest in features`,
          daysAgo: Math.floor(Math.random() * 15),
        },
      ];

      for (const activity of activities) {
        await prisma.activityLog.create({
          data: {
            userId: USER_ID,
            dealId: deal.id,
            action: activity.action,
            description: activity.description,
            metadata: {
              company: dealData.company.name,
              industry: dealData.company.industry,
              employees: dealData.company.employees,
              funding: dealData.company.funding,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rich test data seeded successfully',
      user: {
        id: USER_ID,
        email: 'demo@dealbook.com',
        name: 'Demo User',
      },
      dealsCreated: deals.length,
      deals: deals.map((d, i) => ({
        id: d.id,
        name: d.name,
        stage: d.stage,
        status: d.status,
        amount: d.amount,
        company: REAL_DEALS[i]?.company.name,
        industry: REAL_DEALS[i]?.company.industry,
        contactCount: REAL_DEALS[i]?.contacts.length,
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const dealCount = await prisma.deal.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      hasTestData: dealCount > 0,
      dealCount,
      email: user.email,
      userId: user.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check test data' },
      { status: 500 }
    );
  }
}
