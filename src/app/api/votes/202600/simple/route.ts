import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, isGM } from '@/lib/auth';
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
    const isGMResult = isGM(sessionEmail);
    const shouldHideResults = voteConfig?.Mode === 'hide' && !isGMResult;
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

    // Normalize stored `results` which may be either detailed string breakdowns
    // ("total,12,10,...") or simple numeric totals. Convert to numeric totals.
    const rawResults = cumulativeResult?.results || {};
    const detailedResults: { [country: string]: string } = {};
    const countryPoints: { [country: string]: number } = {};

    Object.entries(rawResults).forEach(([country, val]) => {
      if (typeof val === 'string') {
        detailedResults[country] = val;
        const parsed = parseInt(val.split(',')[0], 10);
        countryPoints[country] = isNaN(parsed) ? 0 : parsed;
      } else if (typeof val === 'number') {
        detailedResults[country] = `${val},0,0,0,0,0,0,0,0,0,0`;
        countryPoints[country] = val;
      } else {
        detailedResults[country] = '0,0,0,0,0,0,0,0,0,0,0';
        countryPoints[country] = 0;
      }
    });

    const responsePayload = {
      countryPoints,
      countryVoteCounts: cumulativeResult?.voteCounts || {},
      detailedResults,
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
