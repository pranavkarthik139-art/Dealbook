import * as dotenv from 'dotenv';
import * as path from 'path';
import { prisma } from '@/lib/db';
import { generateCallInsights, generateMockTranscript } from '@/lib/google-meet';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedDemoData() {
  console.log('🌱 Seeding demo account with realistic data...');

  // Get or create demo user
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@dealbook.com' },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@dealbook.com',
        name: 'Demo User',
        role: 'presales_lead',
      },
    });
    console.log('✅ Created demo user');
  }

  const USER_ID = demoUser.id;

  console.log(`🗑️  Clearing demo user's existing data...`);

  // Delete all data in reverse order of dependencies
  await prisma.activityLog.deleteMany({ where: { userId: USER_ID } });
  await prisma.todo.deleteMany({ where: { userId: USER_ID } });
  await prisma.contact.deleteMany({ where: { userId: USER_ID } });
  await prisma.call.deleteMany({ where: { userId: USER_ID } });
  await prisma.deal.deleteMany({ where: { userId: USER_ID } });

  console.log('✅ Cleared existing data');

  console.log('🌱 Seeding realistic deal scenarios...');

  // Seed 8 companies with realistic deal scenarios and contacts
  const dealsData = [
    {
      name: 'Acme Corp - Enterprise Implementation',
      email: 'john.smith@acmecorp.com',
      amount: 125000,
      stage: 'validation',
      status: 'active',
      leadSource: 'inbound',
      contacts: [
        { name: 'John Smith', email: 'john.smith@acmecorp.com', title: 'VP Engineering', role: 'technical_buyer' },
        { name: 'Sarah Johnson', email: 'sarah.j@acmecorp.com', title: 'CTO', role: 'decision_maker' },
        { name: 'Mike Chen', email: 'mike.chen@acmecorp.com', title: 'DevOps Lead', role: 'influencer' },
      ],
      callDaysAgo: 2,
      callTitle: 'Technical Architecture Review',
    },
    {
      name: 'TechFlow - POC Integration',
      email: 'alex@techflow.io',
      amount: 65000,
      stage: 'poc',
      status: 'active',
      leadSource: 'referral',
      contacts: [
        { name: 'Alex Rodriguez', email: 'alex@techflow.io', title: 'Engineering Manager', role: 'technical_buyer' },
        { name: 'Lisa Park', email: 'lisa@techflow.io', title: 'Head of Products', role: 'decision_maker' },
      ],
      callDaysAgo: 5,
      callTitle: 'POC Scope Discussion',
    },
    {
      name: 'DataSync - Full Migration',
      email: 'procurement@datasync.com',
      amount: 280000,
      stage: 'validation',
      status: 'active',
      leadSource: 'partner',
      contacts: [
        { name: 'Emma Wilson', email: 'emma.w@datasync.com', title: 'Chief Technology Officer', role: 'decision_maker' },
        { name: 'Robert King', email: 'robert@datasync.com', title: 'Infrastructure Manager', role: 'technical_buyer' },
        { name: 'Patricia Lee', email: 'patricia@datasync.com', title: 'VP Operations', role: 'economic_buyer' },
      ],
      callDaysAgo: 1,
      callTitle: 'Budget Approval & Timeline',
    },
    {
      name: 'CloudWorks - Pilot Program',
      email: 'procurement@cloudworks.io',
      amount: 45000,
      stage: 'demo',
      status: 'active',
      leadSource: 'inbound',
      contacts: [
        { name: 'David Martinez', email: 'david@cloudworks.io', title: 'Technical Lead', role: 'technical_buyer' },
      ],
      callDaysAgo: 8,
      callTitle: 'Initial Product Demo',
    },
    {
      name: 'StartupX - Growth Infrastructure',
      email: 'hello@startupx.com',
      amount: 38000,
      stage: 'demo',
      status: 'active',
      leadSource: 'outbound',
      contacts: [
        { name: 'Jessica Wu', email: 'jessica@startupx.com', title: 'Founder & CEO', role: 'decision_maker' },
      ],
      callDaysAgo: 14,
      callTitle: 'Founder Call - Product Fit',
    },
    {
      name: 'GlobalInc - Enterprise Agreement',
      email: 'contracts@globalinc.com',
      amount: 150000,
      stage: 'poc',
      status: 'active',
      leadSource: 'inbound',
      contacts: [
        { name: 'Thomas Anderson', email: 'thomas.a@globalinc.com', title: 'SVP Technology', role: 'decision_maker' },
        { name: 'Jennifer Brown', email: 'jennifer.b@globalinc.com', title: 'Solutions Architect', role: 'technical_buyer' },
        { name: 'Mark Johnson', email: 'mark.j@globalinc.com', title: 'Procurement Director', role: 'economic_buyer' },
      ],
      callDaysAgo: 3,
      callTitle: 'Contract Review with Legal',
    },
    {
      name: 'InnovateLabs - R&D Modernization',
      email: 'cto@innovatelabs.io',
      amount: 85000,
      stage: 'demo',
      status: 'active',
      leadSource: 'event',
      contacts: [
        { name: 'Dr. Nathan Price', email: 'nathan@innovatelabs.io', title: 'Chief Technology Officer', role: 'decision_maker' },
        { name: 'Rachel Chen', email: 'rachel@innovatelabs.io', title: 'Engineering Lead', role: 'technical_buyer' },
      ],
      callDaysAgo: 10,
      callTitle: 'Product Demo & Roadmap',
    },
    {
      name: 'FutureScale - Strategic Partnership',
      email: 'partnerships@futurescale.com',
      amount: 200000,
      stage: 'validation',
      status: 'active',
      leadSource: 'partner',
      contacts: [
        { name: 'Gregory Walsh', email: 'gregory@futurescale.com', title: 'President of Engineering', role: 'decision_maker' },
        { name: 'Olivia Thompson', email: 'olivia@futurescale.com', title: 'VP of Infrastructure', role: 'technical_buyer' },
      ],
      callDaysAgo: 4,
      callTitle: 'Executive Alignment & Pricing',
    },
  ];

  const createdDeals = [];

  for (const dealData of dealsData) {
    const deal = await prisma.deal.create({
      data: {
        userId: USER_ID,
        name: dealData.name,
        email: dealData.email,
        amount: dealData.amount,
        stage: dealData.stage,
        status: dealData.status,
        leadSource: dealData.leadSource,
      },
    });

    createdDeals.push(deal);

    // Create contacts for this deal
    console.log(`  📇 Adding ${dealData.contacts.length} contacts...`);
    for (const contactData of dealData.contacts) {
      await prisma.contact.create({
        data: {
          userId: USER_ID,
          dealId: deal.id,
          name: contactData.name,
          email: contactData.email,
          title: contactData.title,
          role: contactData.role,
        },
      });
    }

    // Create a call for this deal
    const callDate = new Date();
    callDate.setDate(callDate.getDate() - dealData.callDaysAgo);

    const call = await prisma.call.create({
      data: {
        userId: USER_ID,
        dealId: deal.id,
        title: dealData.callTitle,
        callDate,
        durationMinutes: Math.round(45 + Math.random() * 30), // 45-75 minutes
        attendees: dealData.contacts.map(c => c.email),
      },
    });

    // Generate AI insights for the call using Claude
    console.log(`  🤖 Generating AI insights for "${dealData.callTitle}"...`);
    try {
      const mockMeeting = generateMockTranscript();
      mockMeeting.title = dealData.callTitle;
      mockMeeting.date = callDate;
      mockMeeting.participants = dealData.contacts.map(c => c.email);

      const insights = await generateCallInsights(mockMeeting);

      // Update call with insights
      await prisma.call.update({
        where: { id: call.id },
        data: {
          gongSummary: insights.summary,
          gongSentiment: insights.sentiment,
          gongRiskLevel: insights.riskLevel,
        },
      });

      console.log(`     ✨ Insights generated (sentiment: ${insights.sentiment}, risk: ${insights.riskLevel})`);
    } catch (error) {
      console.log(`     ⚠️  Skipped insights (Claude API not available)`);
    }

    // Log deal creation activity
    await prisma.activityLog.create({
      data: {
        userId: USER_ID,
        dealId: deal.id,
        action: 'deal_created',
        description: `Deal "${dealData.name}" created`,
      },
    });

    // Log call activity
    await prisma.activityLog.create({
      data: {
        userId: USER_ID,
        dealId: deal.id,
        action: 'call_scheduled',
        description: `Call: ${dealData.callTitle}`,
      },
    });

    console.log(`✅ Created deal: ${dealData.name} with ${dealData.contacts.length} contacts & call`);
  }

  // Add comprehensive todos for deals
  console.log('📝 Adding todos for each deal...');

  const todoData = [
    // Acme Corp todos
    { dealId: 0, content: 'Prepare architecture documentation for integration team', completed: true },
    { dealId: 0, content: 'Schedule technical deep-dive with engineering team', completed: true },
    { dealId: 0, content: 'Send security assessment requirements', completed: false },
    { dealId: 0, content: 'Confirm timeline and resource allocation with CTO', completed: false },

    // TechFlow todos
    { dealId: 1, content: 'Finalize POC scope document', completed: true },
    { dealId: 1, content: 'Set up testing environment for POC', completed: false },
    { dealId: 1, content: 'Schedule weekly sync calls with engineering', completed: false },

    // DataSync todos
    { dealId: 2, content: 'Prepare migration plan documentation', completed: true },
    { dealId: 2, content: 'Conduct data audit with DataSync team', completed: true },
    { dealId: 2, content: 'Get legal sign-off on contract', completed: false },
    { dealId: 2, content: 'Finalize pricing and terms', completed: false },

    // CloudWorks todos
    { dealId: 3, content: 'Send product demo slides', completed: true },
    { dealId: 3, content: 'Follow up with demo feedback', completed: false },

    // StartupX todos
    { dealId: 4, content: 'Send startup discount proposal', completed: false },
    { dealId: 4, content: 'Prepare onboarding timeline', completed: false },

    // GlobalInc todos
    { dealId: 5, content: 'Prepare contract review notes', completed: true },
    { dealId: 5, content: 'Coordinate with legal on compliance', completed: true },
    { dealId: 5, content: 'Final pricing negotiation', completed: false },

    // InnovateLabs todos
    { dealId: 6, content: 'Prepare R&D program overview', completed: false },
    { dealId: 6, content: 'Schedule follow-up technical discussion', completed: false },

    // FutureScale todos
    { dealId: 7, content: 'Finalize partnership terms', completed: true },
    { dealId: 7, content: 'Prepare executive summary for board', completed: false },
  ];

  for (const todo of todoData) {
    await prisma.todo.create({
      data: {
        userId: USER_ID,
        dealId: createdDeals[todo.dealId].id,
        content: todo.content,
        completed: todo.completed,
      },
    });
  }

  console.log(`✅ Added ${todoData.length} todos across deals`);

  // Add additional activity log entries for deal progress
  console.log('📊 Adding activity history...');

  const additionalActivities = [
    { dealId: 0, action: 'email_sent', description: 'Sent initial technical requirements', daysAgo: 7 },
    { dealId: 0, action: 'proposal_sent', description: 'Sent custom proposal with pricing', daysAgo: 5 },
    { dealId: 1, action: 'email_sent', description: 'Sent POC agreement', daysAgo: 8 },
    { dealId: 2, action: 'email_sent', description: 'Sent migration timeline', daysAgo: 6 },
    { dealId: 3, action: 'email_sent', description: 'Demo recording sent', daysAgo: 4 },
    { dealId: 5, action: 'email_sent', description: 'Contract terms received from legal', daysAgo: 5 },
    { dealId: 7, action: 'proposal_sent', description: 'Strategic partnership proposal', daysAgo: 9 },
  ];

  for (const activity of additionalActivities) {
    const activityDate = new Date();
    activityDate.setDate(activityDate.getDate() - activity.daysAgo);

    await prisma.activityLog.create({
      data: {
        userId: USER_ID,
        dealId: createdDeals[activity.dealId].id,
        action: activity.action,
        description: activity.description,
        createdAt: activityDate,
      },
    });
  }

  console.log(`✅ Added ${additionalActivities.length} activity entries`);

  console.log('\n🎉 Demo data seeding complete!');
  console.log(`✨ Created ${createdDeals.length} realistic deals`);
  console.log(`✨ With ${dealsData.reduce((sum, d) => sum + d.contacts.length, 0)} contacts across deals`);
  console.log(`✨ And ${createdDeals.length} calls with activity history`);
  console.log(`\n📋 Total pipeline value: $${dealsData.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}`);
}

async function main() {
  try {
    await seedDemoData();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
