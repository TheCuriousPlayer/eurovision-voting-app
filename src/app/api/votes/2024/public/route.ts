import { NextResponse } from 'next/server';
import { ResultsData } from '@/types/votes';
import { dbStorage } from '@/lib/database-storage';

export async function GET() {
  try {
    // Initialize competitions
    await dbStorage.initializeCompetitions();
    
    // Get cumulative results from database for Eurovision 2024
    const cumulativeResults = await dbStorage.getCumulativeResults(2024);
    console.log('Public API 2024: Read cumulative results with', cumulativeResults.totalVotes, 'total votes');

    const results: ResultsData = {
      countryPoints: cumulativeResults.countryPoints,
      totalVotes: cumulativeResults.totalVotes,
      // No userVote for public endpoint (omitting the property)
    };

    console.log('Public API 2024: Returning cumulative results with total votes:', results.totalVotes);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in GET /api/votes/2024/public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
