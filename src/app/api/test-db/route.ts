import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const competitions = await prisma.competition.findMany();
    return NextResponse.json({ 
      success: true, 
      competitions: competitions.length,
      env: process.env.DATABASE_URL ? 'DATABASE_URL configured' : 'DATABASE_URL missing'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.DATABASE_URL ? 'DATABASE_URL configured' : 'DATABASE_URL missing'
    });
  }
}
