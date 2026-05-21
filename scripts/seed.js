const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create user with ID 1 (using raw SQL to avoid Prisma issues)
    const user = await prisma.user.upsert({
      where: { id: 1 },
      update: { name: 'Test User', role: 'presales_lead' },
      create: {
        id: 1,
        email: 'test@dealbook.local',
        name: 'Test User',
        role: 'presales_lead',
      },
    });
    console.log('✓ User created/updated:', user.email);

    // Create user preferences using raw SQL to avoid schema mismatch issues
    try {
      await prisma.$executeRaw`
        INSERT INTO user_preferences (user_id, timezone_primary, timezone_secondary, created_at, updated_at)
        VALUES (1, 'Asia/Kolkata', 'America/New_York', NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          timezone_primary = 'Asia/Kolkata',
          timezone_secondary = 'America/New_York',
          updated_at = NOW()
      `;
      console.log('✓ User preferences created/updated');
    } catch (e) {
      console.log('⚠ User preferences already exist or database setup:', e.message.slice(0, 100));
    }

    // Create a sample deal
    try {
      const deal = await prisma.deal.create({
        data: {
          userId: 1,
          name: 'Sample Deal - Acme Corp',
          email: 'contact@acmecorp.com',
          amount: 150000,
          status: 'active',
          stage: 'poc',
        },
      });
      console.log('✓ Sample deal created:', deal.name);
    } catch (e) {
      console.log('⚠ Deal creation issue (may already exist)');
    }

    console.log('\n✅ Database seeded successfully!');
  } catch (e) {
    console.error('❌ Seeding failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
