import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ResultsData } from '@/types/votes';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Cache for last known valid results
const lastValidResults: ResultsData | null = null;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if this is a request specifically asking for user data
    const url = new URL(request.url);
    const waitForAuth = url.searchParams.get('waitForAuth') === 'true';
    
    // If waiting for auth and no session, return early to allow retry
    if (waitForAuth && !session?.user?.email) {
      // Get cumulative data to show at least that while waiting for auth
      const [cumulativeData] = await Promise.all([
        prisma.$queryRaw`
          SELECT cr.results, cr."totalVotes"
          FROM cumulative_results cr
          JOIN competitions c ON c.id = cr."competitionId"
          WHERE c.year = 2023
          LIMIT 1
        `
      ]);
      
      const cumulativeRow = Array.isArray(cumulativeData) && cumulativeData.length > 0 ? 
        cumulativeData[0] as { results: Record<string, number>; totalVotes: number } : null;
      const countryPoints = cumulativeRow?.results || {};
      const totalVotes = cumulativeRow?.totalVotes || 0;
      
      return NextResponse.json({
        countryPoints: typeof countryPoints === 'string' ? JSON.parse(countryPoints) : countryPoints,
        totalVotes,
        authPending: true,
        sessionEmail: null
      }, { 
        status: 202, // Accepted but processing
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }
    
    // Use Prisma Client for type-safe queries
    const competition = await prisma.competition.findUnique({
      where: { year: 2023 },
    });

    if (!competition) {
      console.error('Competition for year 2023 not found.');
      return NextResponse.json({ countryPoints: {}, totalVotes: 0 }, { status: 404 });
    }

    const [cumulativeResult, userVoteData] = await Promise.all([
      prisma.cumulativeResult.findUnique({
        where: { competitionId: competition.id },
      }),
      session?.user?.email
        ? prisma.vote.findFirst({
            where: {
              AND: [
                { userId: session.user.email },
                { competitionId: competition.id },
              ],
            },
          })
        : Promise.resolve(null),
    ]);

    console.log('Session user email:', session?.user?.email);
    console.log('User data query result:', userVoteData);
    console.log('Cumulative data query result:', cumulativeResult);

    // Fallback logic for cumulative results
    const cumulativeRow = cumulativeResult as { results: Record<string, number>; totalVotes: number } | null;
    
    let countryPoints: Record<string, number> = {};
    let totalVotes = 0;

    if (cumulativeRow) {
      // Since results is jsonb in Supabase, it should already be parsed as an object
      countryPoints = cumulativeRow.results || {};
      totalVotes = cumulativeRow.totalVotes || 0;
      console.log('Found cumulative results:', { countryPoints, totalVotes });
    } else {
      console.warn('No cumulative results found for competition:', competition.id);
    }

    // Process user data if available
    const rawUserVote = userVoteData as { votes: string[]; userName?: string; userEmail?: string } | null;
    let userVote = null;

    if (rawUserVote) {
      console.log('Raw user vote found:', rawUserVote);
      // Since votes is jsonb in Supabase, it should already be parsed as an array
      userVote = {
        ...rawUserVote,
        votes: rawUserVote.votes, // Already an array from jsonb
      };
      console.log('Processed user vote:', userVote);
    } else {
      console.warn('No user vote found for the authenticated user.');
    }

    const responsePayload = {
      countryPoints,
      totalVotes,
      userVote,
      authPending: false,
      sessionEmail: session?.user?.email || null,
    };

    console.log('Final API response payload:', responsePayload);

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error in simple API:', error);
    
    // Return last known valid results if available, otherwise empty
    if (lastValidResults) {
      console.log('Simple API: Returning cached valid results as fallback');
      return NextResponse.json(lastValidResults);
    }
    
    return NextResponse.json({
      countryPoints: {},
      totalVotes: 0,
    }, { status: 500 });
  }
}
