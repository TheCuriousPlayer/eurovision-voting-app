import { NextResponse } from 'next/server';
import { ResultsData } from '@/types/votes';
import { dbStorage } from '@/lib/database-storage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Initialize competitions
    await dbStorage.initializeCompetitions();
    
    // Get cumulative results from database
    const cumulativeResults = await dbStorage.getCumulativeResults(2023);
    console.log('Public API: Read cumulative results with', cumulativeResults.totalVotes, 'total votes');

    // Direct verification of vote count in votes table
    const competition = await prisma.competition.findUnique({ where: { year: 2023 } });
    let directCount = 0;
    if (competition) {
      directCount = await prisma.vote.count({ where: { competitionId: competition.id } });
    }
    console.log('Public API: Direct vote table count =', directCount);

    if (directCount > 0 && cumulativeResults.totalVotes === 0) {
      console.warn('Public API: MISMATCH detected (cached 0 vs direct', directCount, ') -> forcing recompute');
      // Inline recompute logic (duplicate of updateCumulativeResults but visible here to avoid private access)
      if (competition) {
        const votes = await prisma.vote.findMany({ where: { competitionId: competition.id } });
        const countryPoints: Record<string, number> = {};
        competition.countries.forEach(c => { countryPoints[c] = 0; });
        votes.forEach(v => {
          const pts = v.points as Record<string, number>;
            Object.entries(pts).forEach(([c, val]) => {
              if (countryPoints[c] !== undefined) countryPoints[c] += val;
            });
        });
        const totalVotes = votes.length;
        if (totalVotes > 0) {
          await prisma.cumulativeResult.upsert({
            where: { competitionId: competition.id },
            update: { results: countryPoints, totalVotes, lastUpdated: new Date() },
            create: { competitionId: competition.id, results: countryPoints, totalVotes }
          });
          cumulativeResults.countryPoints = countryPoints;
          cumulativeResults.totalVotes = totalVotes;
          console.log('Public API: Inline recompute stored with', totalVotes, 'votes');
        }
      }
    }

    const results: ResultsData = {
      countryPoints: cumulativeResults.countryPoints,
      totalVotes: cumulativeResults.totalVotes,
      // No userVote for public endpoint (omitting the property)
    };

    console.log('Public API: Returning cumulative results with total votes:', results.totalVotes);

    const res = NextResponse.json({
      ...results,
      _debug: {
        directVoteCount: directCount,
        servedAt: new Date().toISOString(),
      }
    });
  res.headers.set('Cache-Control', 'no-store');
  return res;
  } catch (error) {
    console.error('Error in GET /api/votes/2023/public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
