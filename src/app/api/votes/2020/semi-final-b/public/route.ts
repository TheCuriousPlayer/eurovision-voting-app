import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ResultsData } from '@/types/votes';
import { dbStorage } from '@/lib/database-storage';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check GM authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const gmList = VOTE_CONFIG?.['202002']?.GMs
      ? VOTE_CONFIG['202002'].GMs.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
      : [];
    
    if (!gmList.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden - GM access required' }, { status: 403 });
    }

    // Initialize competitions
    await dbStorage.initializeCompetitions();
    
    // Get cumulative results from database for Semi-Final B (202002)
    const cumulativeResults = await dbStorage.getCumulativeResults(202002);
    console.log('Public API (Semi-Final B): Read cumulative results with', cumulativeResults.totalVotes, 'total votes');

    const results: ResultsData = {
      countryPoints: cumulativeResults.countryPoints,
      totalVotes: cumulativeResults.totalVotes,
      // No userVote for public endpoint (omitting the property)
    };

    console.log('Public API (Semi-Final B): Returning cumulative results with total votes:', results.totalVotes);

    const response = NextResponse.json(results);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error in GET /api/votes/2020/semi-final-b/public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
