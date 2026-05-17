import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { prisma } from '@/lib/db';

async function main() {
  const leverDeal = await prisma.deal.findUnique({
    where: { id: 21 }
  });
  
  console.log('Lever Deal:');
  console.log(JSON.stringify(leverDeal, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
