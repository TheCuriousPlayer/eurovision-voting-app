import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

// Legacy/divided countries mapping - distribute votes to successor states
const legacyCountries: { [legacy: string]: string[] } = {
  'Serbia and Montenegro': ['Serbia', 'Montenegro'],
  'Serbia Montenegro': ['Serbia', 'Montenegro'],
  'Yugoslavia': ['Serbia', 'Montenegro', 'Croatia', 'Slovenia', 'North Macedonia', 'Bosnia and Herzegovina']
};

export async function GET(request: NextRequest) {
  try {
    // Fetch votes from main competitions only (exclude 202001, 202002, 202003)
    // Also exclude competitions with Mode: 'hide'
    const allYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const years = allYears.filter(y => {
      const config = VOTE_CONFIG[String(y) as keyof typeof VOTE_CONFIG];
      return config?.Mode !== 'hide';
    });
    
    const competitions = await prisma.competition.findMany({
      where: {
        year: {
          in: years
        }
      },
      select: {
        id: true,
        year: true
      }
    });

    if (competitions.length === 0) {
      return NextResponse.json({ 
        countryCounts: {},
        countryPoints: {},
        totalVotes: 0,
        totalUsers: 0
      });
    }

    const competitionIds = competitions.map(c => c.id);
    const competitionYearMap = new Map(competitions.map(c => [c.id, c.year]));

    // Use cached cumulative results instead of fetching all votes
    const cachedResults = await prisma.cumulativeResult.findMany({
      where: {
        competitionId: {
          in: competitionIds
        }
      }
    });

    // Get unique user count efficiently with a single COUNT(DISTINCT) query
    const uniqueUserResult = await prisma.$queryRaw<[{ cnt: number }]>`
      SELECT COUNT(DISTINCT "userEmail")::int AS cnt
      FROM votes
      WHERE "competitionId" = ANY(${competitionIds}::text[])
    `;

    // Aggregate from cached results
    const countryCounts: { [country: string]: number } = {};
    const countryPoints: { [country: string]: number } = {};
    const byYear: { [year: number]: { countryCounts: { [country: string]: number }, countryPoints: { [country: string]: number } } } = {};
    let totalVotes = 0;

    cachedResults.forEach(cached => {
      const year = competitionYearMap.get(cached.competitionId);
      if (!year) return;

      totalVotes += cached.totalVotes;

      const results = cached.results as Record<string, unknown>;
      const voteCounts = (cached.voteCounts as Record<string, number>) || {};

      if (!byYear[year]) {
        byYear[year] = { countryCounts: {}, countryPoints: {} };
      }

      // Parse results - can be "total,12pts,10pts,..." string or plain number
      Object.entries(results).forEach(([country, value]) => {
        let pts = 0;
        if (typeof value === 'string') {
          pts = parseInt(value.split(',')[0]) || 0;
        } else if (typeof value === 'number') {
          pts = value;
        }

        // Handle legacy countries
        const successors = legacyCountries[country];
        const targets = successors && successors.length > 0 ? successors : [country];

        targets.forEach(target => {
          // Total points
          countryPoints[target] = (countryPoints[target] || 0) + pts;
          // Year-specific points
          byYear[year].countryPoints[target] = (byYear[year].countryPoints[target] || 0) + pts;
        });
      });

      // Parse vote counts
      Object.entries(voteCounts).forEach(([country, count]) => {
        const successors = legacyCountries[country];
        const targets = successors && successors.length > 0 ? successors : [country];

        targets.forEach(target => {
          countryCounts[target] = (countryCounts[target] || 0) + count;
          byYear[year].countryCounts[target] = (byYear[year].countryCounts[target] || 0) + count;
        });
      });
    });

    return NextResponse.json({
      countryCounts,
      countryPoints,
      totalVotes,
      totalUsers: uniqueUserResult[0]?.cnt ?? 0,
      competitions: competitions.map(c => c.year),
      byYear
    });

  } catch (error) {
    console.error('Error fetching global votes map:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global vote data' },
      { status: 500 }
    );
  }
}
