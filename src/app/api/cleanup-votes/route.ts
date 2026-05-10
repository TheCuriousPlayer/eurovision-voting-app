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

    // For each competition, just recalculate the cumulative results properly
    for (const competition of competitions) {
      // Get all votes for this competition
      const votes = await prisma.vote.findMany({
        where: { competitionId: competition.id },
        select: { id: true, userEmail: true, createdAt: true, points: true }
      });

      console.log(`Competition ${competition.year} has ${votes.length} votes`);

      // Check for actual duplicates (same userEmail in same competition)
      const userVoteMap = new Map<string, { id: string; userEmail: string; createdAt: Date }>();
      const duplicates: string[] = [];
      
      votes.forEach(vote => {
        if (userVoteMap.has(vote.userEmail)) {
          // This is a duplicate - keep the newer one
          const existingVote = userVoteMap.get(vote.userEmail);
          if (existingVote && vote.createdAt > existingVote.createdAt) {
            duplicates.push(existingVote.id);
            userVoteMap.set(vote.userEmail, vote);
          } else if (existingVote) {
            duplicates.push(vote.id);
          }
        } else {
          userVoteMap.set(vote.userEmail, vote);
        }
      });

      // Delete only actual duplicates
      if (duplicates.length > 0) {
        await prisma.vote.deleteMany({
          where: {
            id: { in: duplicates }
          }
        });
        console.log(`Deleted ${duplicates.length} duplicate votes`);
      }

      // Get remaining votes after cleanup
      const cleanVotes = await prisma.vote.findMany({
        where: { competitionId: competition.id },
        select: { points: true, votes: true }
      });

      const { results, voteCounts, totalVotes } = buildDetailedResultsFromVotes(competition.countries, cleanVotes);

      await prisma.cumulativeResult.upsert({
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
          totalVotes,
          lastUpdated: new Date()
        }
      });

      console.log(`Competition ${competition.year} now has ${cleanVotes.length} votes and updated results`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Database recalculated - duplicates removed safely',
      totalCompetitions: competitions.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
