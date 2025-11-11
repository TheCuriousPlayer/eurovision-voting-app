import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Retrieve cumulative jury results for competition 202004
export async function GET() {
  try {
    // Find the competition
    const competition = await prisma.competition.findFirst({
      where: { year: 202004 }
    });

    if (!competition) {
      return NextResponse.json({
        countryPoints: {},
        totalVotes: 0
      });
    }

    // Get cumulative results
    const cumulativeId = `${competition.id}juri`;
    const cumulativeResult = await prisma.cumulativeResult.findUnique({
      where: { id: cumulativeId }
    });

    if (!cumulativeResult) {
      return NextResponse.json({
        countryPoints: {},
        totalVotes: 0
      });
    }

    // Parse results - handle both string and number formats
    const countryPoints: { [country: string]: number } = {};
    const countryVoteCounts: { [country: string]: number } = {};
    
    Object.entries(cumulativeResult.results as Record<string, unknown>).forEach(([country, value]) => {
      if (typeof value === 'string') {
        // Extract total from detailed breakdown string
        const total = parseInt(value.split(',')[0]);
        countryPoints[country] = isNaN(total) ? 0 : total;
      } else if (typeof value === 'number') {
        countryPoints[country] = value;
      }
    });

    // Get vote counts for tiebreaker
    if (cumulativeResult.voteCounts) {
      Object.entries(cumulativeResult.voteCounts as Record<string, unknown>).forEach(([country, count]) => {
        if (typeof count === 'number') {
          countryVoteCounts[country] = count;
        }
      });
    }

    return NextResponse.json({
      countryPoints,
      countryVoteCounts,
      totalVotes: cumulativeResult.totalVotes || 0
    });

  } catch (error) {
    console.error('Error fetching jury results:', error);
    return NextResponse.json({
      error: 'Failed to fetch results',
      countryPoints: {},
      totalVotes: 0
    }, { status: 500 });
  }
}
