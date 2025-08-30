import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, isAdmin } from '@/lib/auth';
import { Vote, ResultsData } from '@/types/votes';
import { dbStorage } from '@/lib/database-storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to access this resource' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const { votes } = await request.json();

    if (!Array.isArray(votes) || votes.length !== 10) {
      return NextResponse.json({ error: 'Invalid votes' }, { status: 400 });
    }

    // Initialize competitions
    await dbStorage.initializeCompetitions();

    const vote: Vote = {
      userId: session.user.email!,
      userName: session.user.name!,
      userEmail: session.user.email!,
      votes: votes,
      timestamp: new Date(),
    };

    // Store vote in database for Eurovision 2024
    await dbStorage.addOrUpdateVote(vote, 2024);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to access this resource' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Initialize competitions
    await dbStorage.initializeCompetitions();
    
    // Get cumulative results from database for Eurovision 2024
    const cumulativeResults = await dbStorage.getCumulativeResults(2024);
    
    // Get user's individual vote
    const userVote = await dbStorage.getUserVote(session.user.email!, 2024);

    const resultsData: ResultsData = {
      totalVotes: cumulativeResults.totalVotes,
      countryPoints: cumulativeResults.countryPoints,
      ...(userVote && { userVote }) // Only include userVote if it's not null
    };

    const response = NextResponse.json(resultsData);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error getting results:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }
}
