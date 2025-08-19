import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ResultsData } from '@/types/votes';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Cache for last known valid results
let lastValidResults: ResultsData | null = null;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if this is a request specifically asking for user data
    const url = new URL(request.url);
    const waitForAuth = url.searchParams.get('waitForAuth') === 'true';
    
    // If waiting for auth and no session, return early to allow retry
    if (waitForAuth && !session?.user?.email) {
      return NextResponse.json({
        countryPoints: {},
        totalVotes: 0,
        authPending: true
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
    
    // If no user data found, let's check what userIds exist in the votes table
    if (session?.user?.email && (!Array.isArray(userData) || userData.length === 0)) {
      try {
        const allUserIds = await prisma.$queryRaw`
          SELECT DISTINCT v."userId"
          FROM votes v
          JOIN competitions c ON c.id = v."competitionId"
          WHERE c.year = 2023
          LIMIT 10
        `;
        console.log('All userIds in votes table for 2023:', allUserIds);
      } catch (debugError) {
        console.log('Debug query failed:', debugError);
      }
    }

    // Process cumulative results
    const cumulativeRow = Array.isArray(cumulativeData) && cumulativeData.length > 0 ? 
      cumulativeData[0] as { results: Record<string, number>; totalVotes: number } : null;
    const countryPoints = cumulativeRow?.results || {};
    const totalVotes = cumulativeRow?.totalVotes || 0;

    const results: ResultsData = {
      countryPoints: typeof countryPoints === 'string' ? JSON.parse(countryPoints) : countryPoints,
      totalVotes,
      sessionEmail: session?.user?.email, // Add session info for debugging
    };

    // Process user vote if authenticated and exists
    if (session?.user && Array.isArray(userData) && userData.length > 0) {
      const userRow = userData[0] as { 
        votes: string[] | string; 
        userName: string; 
        userEmail: string; 
        updatedAt: Date;
        userId: string;
      };
      
      console.log('Found user vote data:', {
        userId: userRow.userId,
        userName: userRow.userName,
        userEmail: userRow.userEmail,
        votesType: typeof userRow.votes,
        votesValue: userRow.votes,
        votesLength: Array.isArray(userRow.votes) ? userRow.votes.length : 'not array'
      });
      
      // Parse votes if it's a string
      let parsedVotes: string[];
      try {
        parsedVotes = typeof userRow.votes === 'string' ? JSON.parse(userRow.votes) : userRow.votes;
      } catch (e) {
        console.error('Error parsing votes:', e);
        parsedVotes = [];
      }
      
      results.userVote = {
        userId: userRow.userId,
        userName: userRow.userName || session.user.name || session.user.email!,
        userEmail: userRow.userEmail,
        votes: parsedVotes,
        timestamp: userRow.updatedAt
      };
      console.log('Simple API: Found real user vote for', userRow.userEmail, 'with', parsedVotes.length, 'countries');
    } else if (session?.user) {
      console.log('Simple API: No user vote found for', session.user.email);
    }

    // Cache the valid results for fallback
    if (totalVotes > 0) {
      lastValidResults = { ...results };
      delete lastValidResults.userVote; // Don't cache user-specific data
    }

    console.log('Simple API: Returning real data - totalVotes:', totalVotes, 'userVote:', !!results.userVote);

    const response = NextResponse.json(results);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
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
