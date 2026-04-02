import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';

const EUROVISION_2026_PREVIEW_COUNTRIES = [
  'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 
  'Belgium', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark', 
  'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 
  'Greece', 'Israel', 'Italy', 'Latvia', 'Lithuania', 
  'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Norway', 
  'Poland', 'Portugal', 'Romania', 'San Marino', 'Serbia', 
  'Southern Cyprus', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check if competition already exists
    const existingCompetition = await prisma.competition.findFirst({
      where: { year: 202600 }
    });

    if (existingCompetition) {
      return NextResponse.json({ 
        success: true,
        message: 'Eurovision 2026 Preview competition already exists',
        competition: existingCompetition,
        alreadyExists: true
      });
    }

    // Create Eurovision 2026 Preview competition (year code: 202600)
    const competition = await prisma.competition.create({
      data: {
        year: 202600,
        name: 'Eurovision 2026 Preview',
        countries: EUROVISION_2026_PREVIEW_COUNTRIES,
        isActive: true
      }
    });

    console.log('Created competition 202600 (2026 Preview):', competition);

    // Initialize empty results for 2026 Preview
    const countryPoints: { [key: string]: number } = {};
    EUROVISION_2026_PREVIEW_COUNTRIES.forEach(country => {
      countryPoints[country] = 0;
    });

    // Create cumulative results for 2026 Preview
    const cumulativeResult = await prisma.cumulativeResult.create({
      data: {
        competitionId: competition.id,
        results: countryPoints,
        voteCounts: {},
        totalVotes: 0
      }
    });

    console.log('Created cumulative result 2026 Preview:', cumulativeResult);

    return NextResponse.json({ 
      success: true,
      message: 'Eurovision 2026 Preview competition created successfully',
      competition,
      cumulativeResult
    });
  } catch (error) {
    console.error('Error creating 2026 Preview competition:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if competition exists
    const competition = await prisma.competition.findFirst({
      where: { year: 202600 }
    });

    if (!competition) {
      return NextResponse.json({ 
        exists: false,
        message: 'Eurovision 2026 Preview competition not found. Use POST to create it.'
      });
    }

    // Get cumulative results
    const cumulativeResult = await prisma.cumulativeResult.findFirst({
      where: { competitionId: competition.id }
    });

    return NextResponse.json({ 
      exists: true,
      competition,
      cumulativeResult,
      message: 'Eurovision 2026 Preview competition exists'
    });
  } catch (error) {
    console.error('Error checking 2026 Preview competition:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
