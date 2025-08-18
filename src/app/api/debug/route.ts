import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check all tables
    const competitions = await prisma.competition.findMany();
    const votes = await prisma.vote.findMany();
    const cumulativeResults = await prisma.cumulativeResult.findMany();

    return NextResponse.json({ 
      success: true,
      data: {
        competitions,
        votes,
        cumulativeResults
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
