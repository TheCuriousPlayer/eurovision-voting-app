import { NextResponse } from 'next/server';
import { ResultsData } from '@/types/votes';
import * as memoryStorage from '@/lib/memory-storage';

export async function GET() {
  try {
    // Initialize default countries
    memoryStorage.initializeDefaultCountries();
    
    // Get cumulative results from memory storage
    const cumulativeResults = memoryStorage.getCumulativeResults();
    console.log('Public API: Read cumulative results with', cumulativeResults.totalVotes, 'total votes');

    const results: ResultsData = {
      countryPoints: cumulativeResults.countryPoints,
      totalVotes: cumulativeResults.totalVotes,
      // No userVote for public endpoint (omitting the property)
    };

    console.log('Public API: Returning cumulative results with total votes:', results.totalVotes);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in GET /api/votes/2023/public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
