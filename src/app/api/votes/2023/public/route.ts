import { NextResponse } from 'next/server';
import { ResultsData } from '@/types/votes';
import { dbStorage } from '@/lib/database-storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Initialize competitions
    await dbStorage.initializeCompetitions();
    
    // Get cumulative results from database
    const cumulativeResults = await dbStorage.getCumulativeResults(2023);
    console.log('Public API: Read cumulative results with', cumulativeResults.totalVotes, 'total votes');

    const results: ResultsData = {
      countryPoints: cumulativeResults.countryPoints,
      totalVotes: cumulativeResults.totalVotes,
      // No userVote for public endpoint (omitting the property)
    };

    console.log('Public API: Returning cumulative results with total votes:', results.totalVotes);

    const response = NextResponse.json(results);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error in GET /api/votes/2023/public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
