import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use raw SQL queries to avoid Prisma connection issues
    const [competitions, cumulativeResults, votes] = await Promise.all([
      prisma.$queryRaw`SELECT * FROM competitions LIMIT 10`,
      prisma.$queryRaw`SELECT * FROM cumulative_results LIMIT 10`, 
      prisma.$queryRaw`SELECT id, "userId", "userName", "userEmail", "competitionId", "createdAt", "updatedAt" FROM votes LIMIT 10`
    ]);
    
    return NextResponse.json({
      competitions,
      cumulativeResults,
      votes,
      message: 'Data fetched successfully using raw SQL'
    });
  } catch (error) {
    console.error('Test data error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Failed to fetch data from database'
    }, { status: 500 });
  }
}
