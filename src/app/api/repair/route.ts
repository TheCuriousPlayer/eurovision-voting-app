import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Force repair: Starting...');
    
    // Get 2023 competition
    const competition = await prisma.competition.findUnique({
      where: { year: 2023 },
      include: { votes: true }
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition 2023 not found' }, { status: 404 });
    }

    console.log(`Force repair: Found competition with ${competition.votes.length} votes`);

    // Calculate fresh cumulative points
    const countryPoints: Record<string, number> = {};
    
    // Initialize all countries to 0
    competition.countries.forEach(country => {
      countryPoints[country] = 0;
    });

    // Sum up all votes
    let totalProcessed = 0;
    competition.votes.forEach(vote => {
      const points = vote.points as Record<string, number>;
      console.log(`Processing vote from ${vote.userName}:`, points);
      
      Object.entries(points).forEach(([country, pointsValue]) => {
        if (countryPoints[country] !== undefined) {
          countryPoints[country] += pointsValue;
          totalProcessed++;
        }
      });
    });

    const totalVotes = competition.votes.length;
    console.log(`Force repair: Calculated ${totalVotes} votes, processed ${totalProcessed} point entries`);
    console.log('Calculated country points:', countryPoints);

    // Force update/create cumulative result
    const updated = await prisma.cumulativeResult.upsert({
      where: { competitionId: competition.id },
      update: {
        results: countryPoints,
        totalVotes,
        lastUpdated: new Date()
      },
      create: {
        competitionId: competition.id,
        results: countryPoints,
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
