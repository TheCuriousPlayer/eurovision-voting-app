import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check what competitions exist
    const competitions = await prisma.competition.findMany();
    
    // Check what cumulative results exist
    const cumulativeResults = await prisma.cumulativeResult.findMany();
    
    // Check what votes exist
    const votes = await prisma.vote.findMany();
    
    return NextResponse.json({
      competitions: competitions,
      cumulativeResults: cumulativeResults,
      votes: votes.map(vote => ({
        ...vote,
        votesPreview: typeof vote.votes === 'string' ? vote.votes.substring(0, 100) : vote.votes,
        pointsPreview: typeof vote.points === 'string' ? vote.points.substring(0, 100) : vote.points,
      })),
    });
  } catch (error) {
    console.error('Test data error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
