import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Get the competition by year code (202001 = 2020 Semi-Final A)
    const competition = await prisma.competition.findFirst({
      where: { year: 202001 },
      select: { id: true }
    });

    if (!competition) {
      console.error('2020 semi-final-a competition not found in database');
      return NextResponse.json({ 
        countryPoints: {}, 
        totalVotes: 0,
        userVote: null,
        authPending: false,
        error: 'Competition not found'
      }, { status: 404 });
    }

    // Get cumulative results and user vote from database only
    const [cumulativeResult, userVoteData] = await Promise.all([
      prisma.cumulativeResult.findFirst({
        where: { competitionId: competition.id },
        select: { results: true, voteCounts: true, totalVotes: true }
      }),
      session?.user?.email ? prisma.vote.findFirst({
        where: {
          userEmail: session.user.email,
          competitionId: competition.id
        },
        select: { votes: true }
      }) : null
    ]);
    const responsePayload = {
      countryPoints: cumulativeResult?.results || {},
      totalVotes: cumulativeResult?.totalVotes || 0,
      userVote: userVoteData || null,
      authPending: false,
    };
    return NextResponse.json(responsePayload, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });

  } catch (error) {
    console.error('Error in semi-final-a simple API:', error);
    
    return NextResponse.json({
      countryPoints: {},
      totalVotes: 0,
      userVote: null,
      authPending: false,
      error: 'Database connection failed'
    }, { status: 500 });
  }
}
