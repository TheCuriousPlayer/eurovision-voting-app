import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get all competitions
    const competitions = await prisma.competition.findMany();

    // For each competition, just recalculate the cumulative results properly
    for (const competition of competitions) {
      // Get all votes for this competition
      const votes = await prisma.vote.findMany({
        where: { competitionId: competition.id }
      });

      console.log(`Competition ${competition.year} has ${votes.length} votes`);

      // Check for actual duplicates (same userId in same competition)
      const userVoteMap = new Map();
      const duplicates = [];
      
      votes.forEach(vote => {
        if (userVoteMap.has(vote.userId)) {
          // This is a duplicate - keep the newer one
          const existingVote = userVoteMap.get(vote.userId);
          if (vote.createdAt > existingVote.createdAt) {
            duplicates.push(existingVote.id);
            userVoteMap.set(vote.userId, vote);
          } else {
            duplicates.push(vote.id);
          }
        } else {
          userVoteMap.set(vote.userId, vote);
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
        where: { competitionId: competition.id }
      });

      // Recalculate cumulative results with clean data
      const countryPoints: { [country: string]: number } = {};
      
      // Initialize all countries to 0
      competition.countries.forEach(country => {
        countryPoints[country as string] = 0;
      });

      // Sum up all clean votes
      cleanVotes.forEach(vote => {
        const points = vote.points as { [country: string]: number };
        Object.entries(points).forEach(([country, pointsValue]) => {
          if (countryPoints[country] !== undefined) {
            countryPoints[country] += pointsValue;
          }
        });
      });

      // Update cumulative results
      await prisma.cumulativeResult.upsert({
        where: { competitionId: competition.id },
        update: {
          results: countryPoints,
          totalVotes: cleanVotes.length,
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: countryPoints,
          totalVotes: cleanVotes.length
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
