// Test Supabase connection
require('dotenv').config();

const url = process.env.DIRECT_URL;
if (!url) {
  console.error('❌ DIRECT_URL not found in .env');
  process.exit(1);
}

console.log('Testing connection to:', url.split('@')[1]?.split('/')[0] || 'unknown');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful!');
    console.log('Test query result:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    if (error.code === 'P1000') {
      console.error('\nThis is an authentication error. Check:');
      console.error('1. Your Supabase credentials in .env');
      console.error('2. That your Supabase project is not paused');
      console.error('3. That the password does not have URL-unsafe characters');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
