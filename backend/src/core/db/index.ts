import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Per-query logging is opt-in (PRISMA_LOG_QUERIES=true) — on by default it printed every query
    // of every request in dev, burying actual errors.
    log:
      process.env.PRISMA_LOG_QUERIES === 'true'
        ? ['query', 'error', 'warn']
        : process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;
