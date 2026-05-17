import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  console.log('Testing with exact deal name and domain:');
  
  const response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Stripe - Payment Infrastructure',  // Full deal name
      domain: 'stripe.com',
    }),
  });
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

test().catch(e => console.error(e));
