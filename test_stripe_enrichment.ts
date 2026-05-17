import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { prisma } from '@/lib/db';

async function main() {
  const stripeDeal = await prisma.deal.findFirst({
    where: { userId: 1, name: { contains: 'Stripe' } }
  });
  
  if (!stripeDeal) {
    console.log('No Stripe deal found');
    return;
  }
  
  console.log('Testing enrichment with Stripe deal:');
  console.log(`Name: ${stripeDeal.name}`);
  console.log(`Email: ${stripeDeal.email}`);
  
  const domain = stripeDeal.email?.split('@')[1];
  console.log(`Extracted domain: ${domain}`);
  
  const response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: stripeDeal.name,
      domain: domain,
    }),
  });
  
  console.log(`\nEnrichment API Response: ${response.status}`);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
