import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  console.log('Testing Figma enrichment...\n');
  
  // Test with domain
  console.log('1. Testing with domain: figma.com');
  let response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Figma - Design Collaboration', domain: 'figma.com' }),
  });
  
  let data = await response.json();
  console.log('Result:', data.company?.name || 'NO COMPANY FOUND');
  
  // Test with just company name
  console.log('\n2. Testing with just query: Figma');
  response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Figma' }),
  });
  
  data = await response.json();
  console.log('Result:', data.company?.name || 'NO COMPANY FOUND');
  
  // Test with full name
  console.log('\n3. Testing with full query: Figma - Design Collaboration');
  response = await fetch('http://localhost:3000/api/enrichment/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Figma - Design Collaboration' }),
  });
  
  data = await response.json();
  console.log('Result:', data.company?.name || 'NO COMPANY FOUND');
  console.log('\nFull response:', JSON.stringify(data, null, 2));
}

test();
