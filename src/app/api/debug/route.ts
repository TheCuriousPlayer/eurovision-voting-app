import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check all tables - use counts and selects instead of fetching all records
    const competitions = await prisma.competition.findMany({
      select: { id: true, year: true, name: true }
    });
    const totalVotesCount = await prisma.vote.count();
    const cumulativeResults = await prisma.cumulativeResult.findMany({
      select: { competitionId: true, totalVotes: true, lastUpdated: true }
    });

    // Vote counts per competition (grouped in DB, not in memory)
    const voteCounts = await prisma.vote.groupBy({
      by: ['competitionId'],
      _count: { id: true }
    });
    const voteCountMap = Object.fromEntries(
      voteCounts.map(vc => [vc.competitionId, vc._count.id])
    );

    // Focus on 2023 competition
    const comp2023 = competitions.find(c => c.year === 2023);
    const cached2023 = cumulativeResults.find(cr => cr.competitionId === comp2023?.id);

    // Focus on 2026 Preview competition (year code 202600)
    const comp2026Preview = competitions.find(c => c.year === 202600);
    const cached2026Preview = cumulativeResults.find(cr => cr.competitionId === comp2026Preview?.id);

    const response = NextResponse.json({ 
      success: true,
      focus2023: {
        competitionExists: !!comp2023,
        competitionId: comp2023?.id,
        votesCount: comp2023 ? (voteCountMap[comp2023.id] ?? 0) : 0,
        cachedExists: !!cached2023,
        cachedTotalVotes: cached2023?.totalVotes,
        cachedLastUpdated: cached2023?.lastUpdated
      },
      focus2026Preview: {
        competitionExists: !!comp2026Preview,
        competitionId: comp2026Preview?.id,
        votesCount: comp2026Preview ? (voteCountMap[comp2026Preview.id] ?? 0) : 0,
        cachedExists: !!cached2026Preview,
        cachedTotalVotes: cached2026Preview?.totalVotes,
        cachedLastUpdated: cached2026Preview?.lastUpdated
      },
      data: {
        competitions,
        totalVotesCount,
        votesPerCompetition: voteCountMap,
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
