import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { prisma } from '@/lib/db';

async function main() {
  const slackDeal = await prisma.deal.findFirst({
    where: { userId: 1, name: { contains: 'Slack' } }
  });
  
  if (!slackDeal) {
    console.log('No Slack deal found');
    return;
  }
  
  console.log('Slack Deal Details:');
  console.log(`ID: ${slackDeal.id}`);
  console.log(`Name: "${slackDeal.name}"`);
  console.log(`Email: "${slackDeal.email}"`);
  
  const domain = slackDeal.email?.split('@')[1];
  console.log(`Extracted domain: "${domain}"`);
  
  console.log('\n--- Testing Enrichment API ---');
  
  const response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: slackDeal.name,
      domain: domain || undefined,
    }),
  });
  
  console.log(`Response status: ${response.status}`);
  const data = await response.json();
  
  if (data.company) {
    console.log(`✅ Company found: ${data.company.name}`);
  } else {
    console.log(`❌ No company returned`);
    console.log(`Success: ${data.success}`);
    console.log(`Full response:`, JSON.stringify(data, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
