import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { prisma } from '@/lib/db';

async function main() {
  const stripeDeal = await prisma.deal.findFirst({
    where: { userId: 1, name: { contains: 'Stripe' } }
  });
  
  console.log(`Stripe deal ID: ${stripeDeal?.id}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
