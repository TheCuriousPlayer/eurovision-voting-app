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

    // Focus on 2026 Preview competition (year code 202600)
    const comp2026Preview = competitions.find(c => c.year === 202600);
    const votes2026Preview = votes.filter(v => v.competitionId === comp2026Preview?.id);
    const cached2026Preview = cumulativeResults.find(cr => cr.competitionId === comp2026Preview?.id);

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
      focus2026Preview: {
        competitionExists: !!comp2026Preview,
        competitionId: comp2026Preview?.id,
        votesCount: votes2026Preview.length,
        cachedExists: !!cached2026Preview,
        cachedTotalVotes: cached2026Preview?.totalVotes,
        cachedLastUpdated: cached2026Preview?.lastUpdated
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
