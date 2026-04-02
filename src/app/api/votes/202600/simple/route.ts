import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Allow unauthenticated access for public/simple endpoint
    const session = await getServerSession(authOptions);
    
    // Get the 202600 competition (Eurovision 2026 Preview)
    const competition = await prisma.competition.findFirst({
      where: { year: 202600 },
      select: { id: true }
    });

    if (!competition) {
      console.error('202600 competition not found in database');
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
    // Check vote configuration to determine if results should be hidden
    const voteConfig = VOTE_CONFIG['202600'];
    const sessionEmail = session?.user?.email || null;
    const isGM = sessionEmail ? voteConfig?.GMs?.split(',').map(email => email.trim()).includes(sessionEmail) : false;
    const shouldHideResults = voteConfig?.Mode === 'hide' && !isGM;
    // If results should be hidden, return empty data
    if (shouldHideResults) {
      const hiddenResponsePayload = {
        countryPoints: {},
        countryVoteCounts: {},
        totalVotes: 0,
        userVote: userVoteData || null,
        authPending: false,
        resultsHidden: true
      };
      return NextResponse.json(hiddenResponsePayload, {
        status: 200,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }

    const responsePayload = {
      countryPoints: cumulativeResult?.results || {},
      countryVoteCounts: cumulativeResult?.voteCounts || {},
      totalVotes: cumulativeResult?.totalVotes || 0,
      userVote: userVoteData || null,
      authPending: false,
    };
    return NextResponse.json(responsePayload, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });

  } catch (error) {
    console.error('Error in simple API for 202600:', error);
    
    return NextResponse.json({
      countryPoints: {},
      totalVotes: 0,
      userVote: null,
      authPending: false,
      error: 'Database connection failed'
    }, { status: 500 });
  }
}
