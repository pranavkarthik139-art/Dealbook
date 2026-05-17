import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  console.log('🔍 Testing Lever enrichment...');
  
  const response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Lever',
      domain: 'lever.co',
    }),
  });
  
  console.log(`Response status: ${response.status}`);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
