import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get all votes to see what we have
    const allVotes = await prisma.vote.findMany({
      include: {
        competition: true
      }
    });

    console.log('All votes before cleanup:', allVotes);

    // Get all competitions
    const competitions = await prisma.competition.findMany();

    // For each competition, ensure we only have unique votes per user
    for (const competition of competitions) {
      // Get all votes for this competition
      const votes = await prisma.vote.findMany({
        where: { competitionId: competition.id },
        orderBy: { createdAt: 'desc' } // Keep the latest vote for each user
      });

      console.log(`Competition ${competition.year} has ${votes.length} votes`);

      // Group votes by userId and keep only the latest one
      const userVotes = new Map();
      votes.forEach(vote => {
        if (!userVotes.has(vote.userId) || vote.createdAt > userVotes.get(vote.userId).createdAt) {
          userVotes.set(vote.userId, vote);
        }
      });

      // Delete all votes for this competition
      await prisma.vote.deleteMany({
        where: { competitionId: competition.id }
      });

      // Re-insert only the unique latest votes
      const uniqueVotes = Array.from(userVotes.values());
      for (const vote of uniqueVotes) {
        await prisma.vote.create({
          data: {
            userId: vote.userId,
            userName: vote.userName,
            userEmail: vote.userEmail,
            competitionId: vote.competitionId,
            votes: vote.votes,
            points: vote.points
          }
        });
      }

      console.log(`Competition ${competition.year} now has ${uniqueVotes.length} unique votes`);

      // Recalculate cumulative results
      const countryPoints: { [country: string]: number } = {};
      
      // Initialize all countries to 0
      competition.countries.forEach(country => {
        countryPoints[country as string] = 0;
      });

      // Sum up all unique votes
      uniqueVotes.forEach(vote => {
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
          totalVotes: uniqueVotes.length,
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: countryPoints,
          totalVotes: uniqueVotes.length
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Database cleaned and deduplicated',
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
