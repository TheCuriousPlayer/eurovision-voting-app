import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { buildDetailedResultsFromVotes } from '@/lib/database-storage';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Force repair: Starting...');
    
    // Get 2023 competition
    const competition = await prisma.competition.findUnique({
      where: { year: 2023 }
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition 2023 not found' }, { status: 404 });
    }

    // Fetch votes separately with select to reduce data transfer
    const votes = await prisma.vote.findMany({
      where: { competitionId: competition.id },
      select: { userName: true, points: true, votes: true }
    });

    console.log(`Force repair: Found competition with ${votes.length} votes`);

    let totalProcessed = 0;
    votes.forEach(vote => {
      const points = vote.points as Record<string, number>;
      console.log(`Processing vote from ${vote.userName}:`, points);
      totalProcessed += Object.values(points).filter(pt => pt !== 0).length;
    });

    const { results, voteCounts, totalVotes, countryPoints } = buildDetailedResultsFromVotes(
      competition.countries,
      votes.map(vote => ({ points: vote.points as Record<string, unknown>, votes: vote.votes as string[] }))
    );

    console.log(`Force repair: Calculated ${totalVotes} votes, processed ${totalProcessed} point entries`);
    console.log('Calculated country points:', countryPoints);

    // Force update/create cumulative result
    const updated = await prisma.cumulativeResult.upsert({
      where: { competitionId: competition.id },
      update: {
        results,
        voteCounts,
        totalVotes,
        lastUpdated: new Date()
      },
      create: {
        competitionId: competition.id,
        results,
        voteCounts,
        totalVotes
      }
    });

    console.log('Force repair: Updated cumulative result:', updated);

    return NextResponse.json({
      success: true,
      repaired: {
        votesFound: totalVotes,
        pointsProcessed: totalProcessed,
        countryPoints,
        totalVotes,
        updatedAt: updated.lastUpdated
      }
    });

  } catch (error) {
    console.error('Force repair error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
