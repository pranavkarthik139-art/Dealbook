// Test if Phase 4 tables exist
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing Phase 4 database schema...\n');

    // Test User model
    try {
      const users = await prisma.user.findMany({ take: 1 });
      console.log('✅ User table exists');
    } catch (e) {
      console.log('❌ User table missing:', e.message.split('\n')[0]);
    }

    // Test DealTemplate model
    try {
      const templates = await prisma.dealTemplate.findMany({ take: 1 });
      console.log('✅ DealTemplate table exists');
    } catch (e) {
      console.log('❌ DealTemplate table missing:', e.message.split('\n')[0]);
    }

    // Test DealAutomation model
    try {
      const automations = await prisma.dealAutomation.findMany({ take: 1 });
      console.log('✅ DealAutomation table exists');
    } catch (e) {
      console.log('❌ DealAutomation table missing:', e.message.split('\n')[0]);
    }

    // Test SharedDeal model
    try {
      const shared = await prisma.sharedDeal.findMany({ take: 1 });
      console.log('✅ SharedDeal table exists');
    } catch (e) {
      console.log('❌ SharedDeal table missing:', e.message.split('\n')[0]);
    }

    // Test Forecast model
    try {
      const forecasts = await prisma.forecast.findMany({ take: 1 });
      console.log('✅ Forecast table exists');
    } catch (e) {
      console.log('❌ Forecast table missing:', e.message.split('\n')[0]);
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
