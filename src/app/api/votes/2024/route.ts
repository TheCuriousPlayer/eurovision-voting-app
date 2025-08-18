import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Vote, ResultsData } from '@/types/votes';
import { dbStorage } from '@/lib/database-storage';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { votes } = await request.json();

    if (!Array.isArray(votes) || votes.length !== 10) {
      return NextResponse.json({ error: 'Invalid votes' }, { status: 400 });
    }

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
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json(resultsData);
  } catch (error) {
    console.error('Error getting results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
