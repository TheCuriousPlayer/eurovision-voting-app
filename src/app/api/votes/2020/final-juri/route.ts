import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const juryEmails = () => process.env.JURI_2020_FINAL_EMAILS?.split(',').map(e => e.trim()) ?? [];

export const dynamic = 'force-dynamic';

// GET - Retrieve jury member's votes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Require authentication
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is authorized jury member
    if (!juryEmails().includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized - Not a jury member' }, { status: 403 });
    }

    // Find the jury competition (we'll use a specific year code for jury votes)
    const competition = await prisma.competition.findFirst({
      where: { year: 202004 } // Using 202004 for jury votes
    });

    if (!competition) {
      // Competition doesn't exist yet, return empty votes
      return NextResponse.json({ votes: {} });
    }

    // Get user's existing jury vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userEmail: session.user.email,
        competitionId: competition.id
      }
    });

    if (!existingVote) {
      return NextResponse.json({ votes: {} });
    }

    // Parse the votes from database
    const votes = typeof existingVote.votes === 'string' 
      ? JSON.parse(existingVote.votes)
      : existingVote.votes;

    return NextResponse.json({ votes: votes || {} });

  } catch (error) {
    console.error('Error retrieving jury votes:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve votes',
      votes: {} 
    }, { status: 500 });
  }
}

// POST - Save jury member's votes
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Require authentication
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is authorized jury member
    if (!juryEmails().includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized - Not a jury member' }, { status: 403 });
    }

    const body = await request.json();
    const { votes } = body;

    if (!votes || typeof votes !== 'object') {
      return NextResponse.json({ error: 'Invalid votes data' }, { status: 400 });
    }

    // Find or create the jury competition
    let competition = await prisma.competition.findFirst({
      where: { year: 202004 }
    });

    if (!competition) {
      // Create the jury competition
      competition = await prisma.competition.create({
        data: {
          year: 202004,
          name: 'Eurovision 2020 Final - Jury',
          countries: []
        }
      });
    }

    // Check if user already has a vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userEmail: session.user.email,
        competitionId: competition.id
      }
    });

    if (existingVote) {
      // Update existing vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          votes: votes,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new vote (userId can be the email or a generated ID)
      await prisma.vote.create({
        data: {
          userId: session.user.email, // Using email as userId
          userName: session.user.name || session.user.email,
          userEmail: session.user.email,
          competitionId: competition.id,
          votes: votes,
          points: {} // Empty points object
        }
      });
    }

    console.log(`Jury vote saved for ${session.user.email}:`, votes);

    // Calculate cumulative results from all jury votes
    const allJuryVotes = await prisma.vote.findMany({
      where: { competitionId: competition.id }
    });

    // Aggregate all votes into cumulative results
    const cumulativeResults: { [country: string]: number } = {};
    const voteCounts: { [country: string]: number } = {};

    allJuryVotes.forEach(vote => {
      const voteData = typeof vote.votes === 'string' ? JSON.parse(vote.votes) : vote.votes;
      
      Object.entries(voteData).forEach(([country, points]) => {
        if (typeof points === 'number') {
          cumulativeResults[country] = (cumulativeResults[country] || 0) + points;
          voteCounts[country] = (voteCounts[country] || 0) + 1;
        }
      });
    });

    // Save to cumulative_result table
    const cumulativeId = `${competition.id}juri`;
    
    // Check if cumulative result exists
    const existingCumulative = await prisma.cumulativeResult.findUnique({
      where: { id: cumulativeId }
    });

    if (existingCumulative) {
      // Update existing cumulative result
      await prisma.cumulativeResult.update({
        where: { id: cumulativeId },
        data: {
          results: cumulativeResults,
          voteCounts: voteCounts,
          lastUpdated: new Date(),
          totalVotes: allJuryVotes.length
        }
      });
    } else {
      // Create new cumulative result
      await prisma.cumulativeResult.create({
        data: {
          id: cumulativeId,
          competitionId: competition.id,
          results: cumulativeResults,
          totalVotes: allJuryVotes.length,
          lastUpdated: new Date(),
          voteCounts: voteCounts
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Votes saved successfully'
    });

  } catch (error) {
    console.error('Error saving jury votes:', error);
    return NextResponse.json({ 
      error: 'Failed to save votes'
    }, { status: 500 });
  }
}
