import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configure connection pooling for better Supabase compatibility
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Disable prepared statements to avoid 42P05 errors
  __internal: {
    engine: {
      enableEngineDebugMode: false,
    },
  },
});

// Disconnect and reconnect to avoid prepared statement conflicts
if (process.env.NODE_ENV === 'production') {
  prisma.$disconnect().then(() => {
    console.log('Prisma disconnected for fresh connection');
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
