import * as dotenv from 'dotenv';
import * as path from 'path';
import { prisma } from '@/lib/db';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const USER_ID = 1; // Hardcoded for prototype

async function main() {
  console.log('🗑️  Clearing existing data...');

  // Delete all data in reverse order of dependencies
  await prisma.activityLog.deleteMany({ where: { userId: USER_ID } });
  await prisma.todo.deleteMany({ where: { userId: USER_ID } });
  await prisma.calendarEvent.deleteMany({ where: { userId: USER_ID } });
  await prisma.deal.deleteMany({ where: { userId: USER_ID } });

  console.log('✅ Cleared existing data');

  console.log('🌱 Seeding 5 real companies...');

  // Seed 8 companies with realistic, smaller deal sizes
  const deals = [
    {
      name: 'Acme Corp - Starter Plan',
      company: 'Acme Corp',
      email: 'contact@acmecorp.com',
      amount: 25000,
      stage: 'demo',
      status: 'active',
      closeDateDaysFromNow: 30,
    },
    {
      name: 'TechFlow - POC Deal',
      company: 'TechFlow',
      email: 'sales@techflow.io',
      amount: 45000,
      stage: 'poc',
      status: 'active',
      closeDateDaysFromNow: 15,
    },
    {
      name: 'DataSync - Enterprise',
      company: 'DataSync',
      email: 'enterprise@datasync.com',
      amount: 75000,
      stage: 'validation',
      status: 'active',
      closeDateDaysFromNow: 7,
    },
    {
      name: 'CloudWorks - Mid-Market',
      company: 'CloudWorks',
      email: 'procurement@cloudworks.io',
      amount: 55000,
      stage: 'poc',
      status: 'active',
      closeDateDaysFromNow: 21,
    },
    {
      name: 'StartupX - Growth Plan',
      company: 'StartupX',
      email: 'hello@startupx.com',
      amount: 18000,
      stage: 'demo',
      status: 'active',
      closeDateDaysFromNow: 45,
    },
    {
      name: 'GlobalInc - Annual',
      company: 'GlobalInc',
      email: 'contracts@globalinc.com',
      amount: 120000,
      stage: 'validation',
      status: 'active',
      closeDateDaysFromNow: 10,
    },
    {
      name: 'InnovateLabs - Trial',
      company: 'InnovateLabs',
      email: 'sales@innovatelabs.io',
      amount: 35000,
      stage: 'demo',
      status: 'active',
      closeDateDaysFromNow: 60,
    },
    {
      name: 'FutureScale - Partnership',
      company: 'FutureScale',
      email: 'partnerships@futurescale.com',
      amount: 95000,
      stage: 'poc',
      status: 'active',
      closeDateDaysFromNow: 28,
    },
  ];

  const createdDeals = [];

  for (const dealData of deals) {
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + dealData.closeDateDaysFromNow);

    const deal = await prisma.deal.create({
      data: {
        userId: USER_ID,
        name: dealData.name,
        email: dealData.email,
        amount: dealData.amount,
        stage: dealData.stage,
        status: dealData.status,
      },
    });

    createdDeals.push(deal);

    // Log creation activity
    await prisma.activityLog.create({
      data: {
        userId: USER_ID,
        dealId: deal.id,
        action: 'deal_created',
        description: `Deal "${dealData.name}" created - ${dealData.company}`,
      },
    });

    console.log(`✅ Created deal: ${dealData.name}`);
  }

  // Add some todos for deals
  console.log('📝 Adding todos...');

  const todoData = [
    { dealId: createdDeals[0].id, content: 'Prepare integration documentation for Stripe API' },
    { dealId: createdDeals[0].id, content: 'Schedule technical deep-dive with payment team' },
    { dealId: createdDeals[1].id, content: 'Send Notion workspace template' },
    { dealId: createdDeals[1].id, content: 'Collect user requirements from stakeholders' },
    { dealId: createdDeals[2].id, content: 'Share Figma design system documentation' },
    { dealId: createdDeals[2].id, content: 'Confirm budget approval' },
    { dealId: createdDeals[3].id, content: 'Complete HubSpot CRM assessment' },
    { dealId: createdDeals[3].id, content: 'Schedule executive briefing' },
    { dealId: createdDeals[4].id, content: 'Send Slack workspace setup guide' },
  ];

  for (const todo of todoData) {
    await prisma.todo.create({
      data: {
        userId: USER_ID,
        dealId: todo.dealId,
        content: todo.content,
        completed: Math.random() > 0.7, // 30% completed
      },
    });
  }

  console.log('✅ Added todos');

  // Add some activity log entries
  console.log('📊 Adding activity...');

  const activities = [
    { dealId: createdDeals[0].id, action: 'call_scheduled', description: 'Initial discovery call scheduled for next week' },
    { dealId: createdDeals[0].id, action: 'email_sent', description: 'Sent proposal document' },
    { dealId: createdDeals[1].id, action: 'demo_completed', description: 'Product demo completed, positive feedback' },
    { dealId: createdDeals[2].id, action: 'proposal_sent', description: 'Custom proposal sent to procurement' },
    { dealId: createdDeals[2].id, action: 'email_sent', description: 'Follow-up email sent' },
    { dealId: createdDeals[3].id, action: 'call_scheduled', description: 'Technical assessment call scheduled' },
    { dealId: createdDeals[4].id, action: 'email_sent', description: 'Initial outreach email sent' },
  ];

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: {
        userId: USER_ID,
        dealId: activity.dealId,
        action: activity.action,
        description: activity.description,
      },
    });
  }

  console.log('✅ Added activity logs');

  console.log('\n🎉 Seeding complete!');
  console.log(`Created ${createdDeals.length} deals with realistic data`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
