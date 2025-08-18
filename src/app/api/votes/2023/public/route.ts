import { NextResponse } from 'next/server';
import { ResultsData } from '@/types/votes';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const CUMULATIVE_FILE = join(process.cwd(), 'src', 'app', 'eurovision2023', 'votes', 'cumulativevotes.json');
    
    // Read cumulative results from Python-generated file
    let cumulativeResults = { countryPoints: {}, totalVotes: 0 };
    try {
      if (existsSync(CUMULATIVE_FILE)) {
        const data = readFileSync(CUMULATIVE_FILE, 'utf-8');
        cumulativeResults = JSON.parse(data);
        console.log('Public API: Read cumulative results with', cumulativeResults.totalVotes, 'total votes');
      } else {
        console.log('Public API: Cumulative results file does not exist at:', CUMULATIVE_FILE);
      }
    } catch (error) {
      console.error('Public API: Error reading cumulative results from file:', error);
    }

    const results: ResultsData = {
      countryPoints: cumulativeResults.countryPoints,
      totalVotes: cumulativeResults.totalVotes,
      userVote: null // No user vote for public endpoint
    };

    console.log('Public API: Returning cumulative results with total votes:', results.totalVotes);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in GET /api/votes/2023/public:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
