// Check what tables exist in the database
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `;

    console.log('Tables in public schema:');
    result.forEach(row => {
      console.log('  -', row.table_name);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
