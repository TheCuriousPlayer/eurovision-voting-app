import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check all tables
    const competitions = await prisma.competition.findMany();
    const votes = await prisma.vote.findMany();
    const cumulativeResults = await prisma.cumulativeResult.findMany();

    // Focus on 2023 competition
    const comp2023 = competitions.find(c => c.year === 2023);
    const votes2023 = votes.filter(v => v.competitionId === comp2023?.id);
    const cached2023 = cumulativeResults.find(cr => cr.competitionId === comp2023?.id);

    const response = NextResponse.json({ 
      success: true,
      focus2023: {
        competitionExists: !!comp2023,
        competitionId: comp2023?.id,
        votesCount: votes2023.length,
        cachedExists: !!cached2023,
        cachedTotalVotes: cached2023?.totalVotes,
        cachedLastUpdated: cached2023?.lastUpdated
      },
      data: {
        competitions,
        votes,
        cumulativeResults
      }
    });
    
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
