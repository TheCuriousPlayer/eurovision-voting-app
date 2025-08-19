import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get all competitions
    const competitions = await prisma.competition.findMany();

    const results = [];

    for (const competition of competitions) {
      // Get all votes for this competition (don't delete anything)
      const votes = await prisma.vote.findMany({
        where: { competitionId: competition.id }
      });

      console.log(`Competition ${competition.year} has ${votes.length} actual votes`);

      // Just recalculate the cumulative results
      const countryPoints: { [country: string]: number } = {};
      
      // Initialize all countries to 0
      competition.countries.forEach(country => {
        countryPoints[country as string] = 0;
      });

      // Sum up all votes
      votes.forEach(vote => {
        const points = vote.points as { [country: string]: number };
        Object.entries(points).forEach(([country, pointsValue]) => {
          if (countryPoints[country] !== undefined) {
            countryPoints[country] += pointsValue;
          }
        });
      });

      // Update cumulative results with correct count
      await prisma.cumulativeResult.upsert({
        where: { competitionId: competition.id },
        update: {
          results: countryPoints,
          totalVotes: votes.length, // Use actual vote count
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: countryPoints,
          totalVotes: votes.length
        }
      });

      results.push({
        year: competition.year,
        actualVotes: votes.length,
        topCountries: Object.entries(countryPoints)
          .filter(([, points]) => points > 0)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Results recalculated without deleting votes',
      competitions: results
    });
  } catch (error) {
    console.error('Recalculate error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
