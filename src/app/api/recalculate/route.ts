import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { buildDetailedResultsFromVotes } from '@/lib/database-storage';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all competitions
    const competitions = await prisma.competition.findMany();

    const results = [];

    for (const competition of competitions) {
      // Get all votes for this competition (don't delete anything)
      const votes = await prisma.vote.findMany({
        where: { competitionId: competition.id },
        select: { points: true, votes: true }
      });

      console.log(`Competition ${competition.year} has ${votes.length} actual votes`);

      const { results: detailedResults, voteCounts, totalVotes, countryPoints } = buildDetailedResultsFromVotes(competition.countries, votes);

      await prisma.cumulativeResult.upsert({
        where: { competitionId: competition.id },
        update: {
          results: detailedResults,
          voteCounts,
          totalVotes,
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: detailedResults,
          voteCounts,
          totalVotes,
          lastUpdated: new Date()
        }
      });

      results.push({
        year: competition.year,
        actualVotes: totalVotes,
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
