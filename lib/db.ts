import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : undefined,
    errorFormat: 'pretty',
  });
}

export const prisma =
  globalForPrisma.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Disconnect on process exit
if (typeof global !== 'undefined') {
  process.on('exit', async () => {
    await prisma.$disconnect();
  });
}
