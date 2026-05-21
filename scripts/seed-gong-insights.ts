import { prisma } from '@/lib/db';

const USER_ID = 1;

async function seedGongInsights() {
  try {
    console.log('🌱 Seeding Gong insights...');

    // Get the first 3 deals
    const deals = await prisma.deal.findMany({
      where: { userId: USER_ID },
      take: 3,
    });

    if (deals.length === 0) {
      console.log('No deals found. Create some deals first.');
      return;
    }

    const mockInsights = [
      {
        dealId: deals[0]?.id,
        callBrief:
          'Customer discussed POC timeline and requirements. Legal team has concerns about data residency and compliance. Champion (John) is engaged and wants to move forward. CTO is still evaluating technical feasibility.',
        riskLevel: 'medium' as const,
        riskDescription: 'Legal blocker on data residency. Needs to be resolved before POC.',
        nextSteps:
          '• Send legal data sheet and compliance documentation\n• Schedule follow-up with legal team\n• Prepare technical architecture overview for CTO',
      },
      {
        dealId: deals[1]?.id,
        callBrief:
          'Initial discovery call with VP of Engineering. Strong interest in the product. Budget is approved for Q2. Wants to start POC next month.',
        riskLevel: 'low' as const,
        riskDescription: 'No blockers identified. Deal is moving forward.',
        nextSteps:
          '• Send proposal with POC terms\n• Schedule technical kick-off meeting\n• Confirm POC timeline and success criteria',
      },
      {
        dealId: deals[2]?.id,
        callBrief:
          'Call with procurement about contract terms. They raised concerns about payment terms and SLA requirements. No decision maker present in the call.',
        riskLevel: 'high' as const,
        riskDescription: 'Key stakeholder (decision maker) missing. Cannot move forward without their input.',
        nextSteps:
          '• Reschedule call with decision maker present\n• Prepare contract response addressing their concerns\n• Align on payment terms and SLA requirements',
      },
    ];

    for (const mockInsight of mockInsights) {
      if (!mockInsight.dealId) continue;

      const existing = await prisma.gongInsight.findFirst({
        where: { dealId: mockInsight.dealId, status: 'pending' },
      });

      if (!existing) {
        await prisma.gongInsight.create({
          data: {
            userId: USER_ID,
            dealId: mockInsight.dealId,
            callBrief: mockInsight.callBrief,
            riskLevel: mockInsight.riskLevel,
            riskDescription: mockInsight.riskDescription,
            nextSteps: mockInsight.nextSteps,
            status: 'pending',
          },
        });
        console.log(`✓ Created Gong insight for deal ${mockInsight.dealId}`);
      }
    }

    console.log('✅ Gong insights seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding Gong insights:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGongInsights();
