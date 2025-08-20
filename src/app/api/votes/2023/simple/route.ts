import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ResultsData } from '@/types/votes';

export const dynamic = 'force-dynamic';

// Cache for last known valid results
const lastValidResults: ResultsData | null = null;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // TEMPORARY: Use hardcoded data to bypass Prisma connection issues
    const hardcodedCumulativeResult = {
      results: {
        "Italy": 0, "Malta": 6, "Spain": 1, "Cyprus": 0, "France": 12, "Greece": 0, 
        "Israel": 2, "Latvia": 0, "Norway": 24, "Poland": 10, "Serbia": 0, "Sweden": 34, 
        "Albania": 0, "Armenia": 5, "Austria": 14, "Belgium": 7, "Croatia": 0, "Czechia": 2, 
        "Denmark": 0, "Estonia": 5, "Finland": 9, "Georgia": 0, "Germany": 0, "Iceland": 0, 
        "Ireland": 0, "Moldova": 19, "Romania": 0, "Ukraine": 0, "Portugal": 0, "Slovenia": 10, 
        "Australia": 6, "Lithuania": 0, "Azerbaijan": 0, "San Marino": 0, "Netherlands": 0, 
        "Switzerland": 8, "United Kingdom": 0
      },
      totalVotes: 3
    };

    const hardcodedUserVote = session?.user?.email === 'ozgunciziltepe@gmail.com' ? {
      userId: "ozgunciziltepe@gmail.com",
      userName: "özgün çiziltepe", 
      userEmail: "ozgunciziltepe@gmail.com",
      votes: ["Sweden", "Norway", "Austria", "Moldova", "Australia", "Armenia", "Poland", "Belgium", "Finland", "France"]
    } : null;

    console.log('Session user email:', session?.user?.email);
    console.log('Using hardcoded data temporarily');

    const responsePayload = {
      countryPoints: hardcodedCumulativeResult.results,
      totalVotes: hardcodedCumulativeResult.totalVotes,
      userVote: hardcodedUserVote,
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
