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
    
    // Use a single raw SQL query to get all needed data at once
    const [cumulativeData, userData] = await Promise.all([
      // Get cumulative results using raw SQL
      prisma.$queryRaw`
        SELECT cr.results, cr."totalVotes"
        FROM cumulative_results cr
        JOIN competitions c ON c.id = cr."competitionId"
        WHERE c.year = 2023
        LIMIT 1
      `,
      // Get user vote if authenticated - try both userId and userEmail matching
      session?.user?.email ? prisma.$queryRaw`
        SELECT v.votes, v."userName", v."userEmail", v."updatedAt", v."userId"
        FROM votes v
        JOIN competitions c ON c.id = v."competitionId"
        WHERE c.year = 2023 AND (v."userId" = ${session.user.email} OR v."userEmail" = ${session.user.email})
        LIMIT 1
      ` : Promise.resolve([])
    ]);

    console.log('Session user email:', session?.user?.email);
    console.log('User data query result:', userData);
    console.log('Cumulative data query result:', cumulativeData);
    console.log('User data query result:', userData);

    // Fallback logic for cumulative results
    const cumulativeRow = Array.isArray(cumulativeData) && cumulativeData.length > 0 ? 
      cumulativeData[0] as { results: string | Record<string, number>; totalVotes: number } : null;
    
    let countryPoints = {};
    let totalVotes = 0;

    if (cumulativeRow) {
      try {
        countryPoints = typeof cumulativeRow.results === 'string' 
          ? JSON.parse(cumulativeRow.results) 
          : cumulativeRow.results || {};
        totalVotes = cumulativeRow.totalVotes || 0;
      } catch (e) {
        console.error('Failed to parse cumulative results:', e);
      }
    }

    if (!cumulativeRow || totalVotes === 0) {
      console.warn('No cumulative results found or totalVotes is 0. Returning empty results.');
    }

    // Process user data if available
    const rawUserVote = Array.isArray(userData) && userData.length > 0 ? userData[0] as { votes: string | string[] } : null;
    let userVote = null;

    if (rawUserVote) {
      console.log('Raw user vote found:', rawUserVote);
      try {
        userVote = {
          ...rawUserVote,
          // The 'votes' property from the DB is a JSON string, so we need to parse it.
          votes: typeof rawUserVote.votes === 'string' ? JSON.parse(rawUserVote.votes) : rawUserVote.votes,
        };
        console.log('Processed user vote:', userVote);
      } catch (e) {
        console.error('Failed to parse user vote data:', e);
        // If parsing fails, we'll proceed without user-specific vote data.
      }
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
