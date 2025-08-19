import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Raw SQL repair: Starting...');
    
    // Use raw SQL to avoid prepared statement conflicts
    const competitions = await prisma.$queryRaw`
      SELECT * FROM competitions WHERE year = 2023
    `;
    
    if (!Array.isArray(competitions) || competitions.length === 0) {
      return NextResponse.json({ error: 'Competition 2023 not found' }, { status: 404 });
    }
    
    const competition = competitions[0] as {
      id: string;
      year: number;
      countries: string[];
    };
    console.log('Raw SQL repair: Found competition:', competition.id);
    
    // Get all votes for this competition using raw SQL
    const votes = await prisma.$queryRaw`
      SELECT * FROM votes WHERE "competitionId" = ${competition.id}
    `;
    
    console.log(`Raw SQL repair: Found ${Array.isArray(votes) ? votes.length : 0} votes`);
    
    if (!Array.isArray(votes)) {
      return NextResponse.json({ error: 'Invalid votes data' }, { status: 500 });
    }
    
    // Calculate cumulative points
    const countryPoints: Record<string, number> = {};
    const countries = competition.countries as string[];
    
    // Initialize all countries to 0
    countries.forEach(country => {
      countryPoints[country] = 0;
    });
    
    // Sum up all votes
    let totalProcessed = 0;
    votes.forEach((vote: {
      id: string;
      userName: string;
      points: string | Record<string, number>;
    }) => {
      const points = typeof vote.points === 'string' ? JSON.parse(vote.points) : vote.points;
      console.log(`Processing vote from ${vote.userName}:`, points);
      
      if (points && typeof points === 'object') {
        Object.entries(points).forEach(([country, pointsValue]) => {
          if (countryPoints[country] !== undefined && typeof pointsValue === 'number') {
            countryPoints[country] += pointsValue;
            totalProcessed++;
          }
        });
      }
    });
    
    const totalVotes = votes.length;
    console.log(`Raw SQL repair: Calculated ${totalVotes} votes, processed ${totalProcessed} point entries`);
    console.log('Calculated country points:', countryPoints);
    
    // Use raw SQL to update/insert cumulative result
    const now = new Date().toISOString();
    await prisma.$executeRaw`
      INSERT INTO cumulative_results ("competitionId", results, "totalVotes", "lastUpdated")
      VALUES (${competition.id}, ${JSON.stringify(countryPoints)}, ${totalVotes}, ${now})
      ON CONFLICT ("competitionId") 
      DO UPDATE SET 
        results = ${JSON.stringify(countryPoints)},
        "totalVotes" = ${totalVotes},
        "lastUpdated" = ${now}
    `;
    
    console.log('Raw SQL repair: Updated cumulative result successfully');
    
    return NextResponse.json({
      success: true,
      repaired: {
        competitionId: competition.id,
        votesFound: totalVotes,
        pointsProcessed: totalProcessed,
        countryPoints,
        totalVotes,
        updatedAt: now
      }
    });
    
  } catch (error) {
    console.error('Raw SQL repair error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
