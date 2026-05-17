import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { prisma } from '@/lib/db';

async function main() {
  // Get all deals
  const deals = await prisma.deal.findMany({ where: { userId: 1 } });
  console.log('📋 Deals in database:');
  deals.forEach(d => {
    console.log(`  - ${d.name} (email: ${d.email})`);
  });

  // Test enrichment with Stripe deal
  const stripeDeal = deals.find(d => d.name.includes('Stripe'));
  if (stripeDeal && stripeDeal.email) {
    console.log(`\n🔍 Testing enrichment with ${stripeDeal.name} (${stripeDeal.email})`);
    
    const domain = stripeDeal.email.split('@')[1];
    console.log(`📧 Extracted domain: ${domain}`);
    
    // Call enrichment endpoint
    const response = await fetch('http://localhost:3000/api/enrichment/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: stripeDeal.name,
        domain: domain,
      }),
    });
    
    console.log(`\n📡 Enrichment API Response: ${response.status}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
