import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { prisma } from '@/lib/db';

async function main() {
  const deal = await prisma.deal.findFirst({
    where: { userId: 1, name: { contains: 'Stripe' } }
  });
  
  if (!deal || !deal.email) {
    console.log('No deal with email found');
    return;
  }
  
  console.log('Testing enrichment with:', deal.name, deal.email);
  
  const domain = deal.email.split('@')[1];
  
  try {
    const response = await fetch('http://localhost:3000/api/enrichment/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: deal.name, domain }),
    });
    
    const data = await response.json();
    console.log('Success:', !!data.company);
    console.log('Company name:', data.company?.name);
    console.log('Full response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

main().finally(() => prisma.$disconnect());
