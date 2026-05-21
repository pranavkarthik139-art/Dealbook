const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  console.log('Adding lead_source column to deals table...');

  try {
    await prisma.$executeRaw`
      ALTER TABLE deals
      ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100)
    `;
    console.log('✓ Column added successfully!');
  } catch (e) {
    console.log('⚠ Column already exists or error:', e.message.slice(0, 150));
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
