import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Figma', domain: 'figma.com' }),
  });
  
  const data = await response.json();
  
  console.log('Company name:', data.company?.name);
  console.log('\nAll fields returned:');
  console.log('- employeeCountRange:', data.company?.employeeCountRange);
  console.log('- employeeCount:', data.company?.employeeCount);
  console.log('- yearFounded:', data.company?.yearFounded);
  console.log('- fundingStage:', data.company?.fundingStage);
  console.log('- fundingAmount:', data.company?.fundingAmount);
  console.log('- revenueRange:', data.company?.revenueRange);
  console.log('- estimatedRevenue:', data.company?.estimatedRevenue);
  console.log('- lastRaisedDate:', data.company?.lastRaisedDate);
  console.log('- lastRaisedAmount:', data.company?.lastRaisedAmount);
  
  console.log('\nFull company object:');
  console.log(JSON.stringify(data.company, null, 2));
}

test();
