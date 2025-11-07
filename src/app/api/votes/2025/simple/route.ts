import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Require authentication to access results
    if (!session?.user?.email) {
      return NextResponse.json({ 
        countryPoints: {}, 
        totalVotes: 0,
        userVote: null,
        authPending: false,
        sessionEmail: null,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get the 2025 competition
    const competition = await prisma.competition.findFirst({
      where: { year: 2025 }
    });

    if (!competition) {
      console.error('2025 competition not found in database');
      return NextResponse.json({ 
        countryPoints: {}, 
        totalVotes: 0,
        userVote: null,
        authPending: false,
        sessionEmail: session?.user?.email || null,
        error: 'Competition not found'
      }, { status: 404 });
    }

    // Get cumulative results and user vote from database only
    const [cumulativeResult, userVoteData] = await Promise.all([
      prisma.cumulativeResult.findFirst({
        where: { competitionId: competition.id }
      }),
      session?.user?.email ? prisma.vote.findFirst({
        where: {
          userEmail: session.user.email,
          competitionId: competition.id
        }
      }) : null
    ]);

    console.log('Database query results:');
    console.log('- Competition found:', !!competition);
    console.log('- Cumulative result found:', !!cumulativeResult);
    console.log('- User vote found:', !!userVoteData);
    console.log('- Session email:', session?.user?.email);

    // Check vote configuration to determine if results should be hidden
    const voteConfig = VOTE_CONFIG['2025'];
    const isGM = voteConfig?.GMs?.split(',').map(email => email.trim()).includes(session.user.email) || false;
    const shouldHideResults = voteConfig?.Mode === 'hide' && !isGM;

    console.log('Vote config check:');
    console.log('- Mode:', voteConfig?.Mode);
    console.log('- Is GM:', isGM);
    console.log('- Should hide results:', shouldHideResults);

    // If results should be hidden, return empty data
    if (shouldHideResults) {
      const hiddenResponsePayload = {
        countryPoints: {},
        countryVoteCounts: {},
        totalVotes: 0,
        userVote: userVoteData || null,
        authPending: false,
        sessionEmail: session?.user?.email || null,
        resultsHidden: true
      };

      console.log('Results hidden due to mode: hide');

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
      sessionEmail: session?.user?.email || null,
    };

    console.log('Final API response:', {
      ...responsePayload,
      countryPointsCount: Object.keys(responsePayload.countryPoints).length
    });

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });

  } catch (error) {
    console.error('Error in simple API:', error);
    
    return NextResponse.json({
      countryPoints: {},
      totalVotes: 0,
      userVote: null,
      authPending: false,
      sessionEmail: null,
      error: 'Database connection failed'
    }, { status: 500 });
  }
}
