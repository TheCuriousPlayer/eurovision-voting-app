import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Get the 2020 Final competition by year
    const competition = await prisma.competition.findFirst({
      where: { year: 202000 }
    });

    if (!competition) {
      console.error('202000 competition not found in database');
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

    console.log('Database query results for 202000:');
    console.log('- Competition found:', !!competition);
    console.log('- Cumulative result found:', !!cumulativeResult);
    console.log('- User vote found:', !!userVoteData);
    console.log('- Session email:', session?.user?.email);

    const responsePayload = {
      countryPoints: cumulativeResult?.results || {},
      totalVotes: cumulativeResult?.totalVotes || 0,
      userVote: userVoteData || null,
      authPending: false,
      sessionEmail: session?.user?.email || null,
    };

    console.log('Final API response for 202000:', {
      ...responsePayload,
      countryPointsCount: Object.keys(responsePayload.countryPoints).length
    });

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });

  } catch (error) {
    console.error('Error in simple API for 202000:', error);
    
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