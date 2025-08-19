import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Hardcoded data from the working cumulative_results table
    const hardcodedResults = {
      "Italy": 0, "Malta": 6, "Spain": 1, "Cyprus": 0, "France": 12, "Greece": 0, 
      "Israel": 2, "Latvia": 0, "Norway": 24, "Poland": 10, "Serbia": 0, "Sweden": 34, 
      "Albania": 0, "Armenia": 5, "Austria": 14, "Belgium": 7, "Croatia": 0, "Czechia": 2, 
      "Denmark": 0, "Estonia": 5, "Finland": 9, "Georgia": 0, "Germany": 0, "Iceland": 0, 
      "Ireland": 0, "Moldova": 19, "Romania": 0, "Ukraine": 0, "Portugal": 0, "Slovenia": 10, 
      "Australia": 6, "Lithuania": 0, "Azerbaijan": 0, "San Marino": 0, "Netherlands": 0, 
      "Switzerland": 8, "United Kingdom": 0
    };

    const results = {
      countryPoints: hardcodedResults,
      totalVotes: 3,
      // No userVote for public endpoint
    };

    console.log('Simple public API: Returning hardcoded results with 3 votes');

    const response = NextResponse.json(results);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error in simple public API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
