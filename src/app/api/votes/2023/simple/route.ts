import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ResultsData } from '@/types/votes';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Cache for last known valid results
let lastValidResults: ResultsData | null = null;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
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
      // Get user vote if authenticated
      session?.user?.email ? prisma.$queryRaw`
        SELECT v.votes, v."userName", v."userEmail", v."updatedAt"
        FROM votes v
        JOIN competitions c ON c.id = v."competitionId"
        WHERE c.year = 2023 AND v."userId" = ${session.user.email}
        LIMIT 1
      ` : Promise.resolve([])
    ]);

    // Process cumulative results
    const cumulativeRow = Array.isArray(cumulativeData) && cumulativeData.length > 0 ? 
      cumulativeData[0] as { results: Record<string, number>; totalVotes: number } : null;
    const countryPoints = cumulativeRow?.results || {};
    const totalVotes = cumulativeRow?.totalVotes || 0;

    const results: ResultsData = {
      countryPoints: typeof countryPoints === 'string' ? JSON.parse(countryPoints) : countryPoints,
      totalVotes,
    };

    // Process user vote if authenticated and exists
    if (session?.user && Array.isArray(userData) && userData.length > 0) {
      const userRow = userData[0] as { 
        votes: string[] | string; 
        userName: string; 
        userEmail: string; 
        updatedAt: Date 
      };
      results.userVote = {
        userId: session.user.email!,
        userName: userRow.userName || session.user.name || session.user.email!,
        userEmail: session.user.email!,
        votes: typeof userRow.votes === 'string' ? JSON.parse(userRow.votes) : userRow.votes,
        timestamp: userRow.updatedAt
      };
      console.log('Simple API: Found real user vote for', session.user.email);
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
