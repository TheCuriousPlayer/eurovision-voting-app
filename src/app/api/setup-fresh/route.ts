import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EUROVISION_2023_COUNTRIES = [
  'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Belgium', 'Croatia',
  'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
  'Germany', 'Greece', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Latvia',
  'Lithuania', 'Malta', 'Moldova', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovenia', 'South Cyprus', 'Spain',
  'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'
];

export async function POST() {
  try {
    // First, let's clean up and start fresh
    await prisma.cumulativeResult.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.competition.deleteMany();

    // Create Eurovision 2023 competition
    const competition = await prisma.competition.create({
      data: {
        year: 2023,
        name: 'Eurovision 2023',
        countries: EUROVISION_2023_COUNTRIES,
        isActive: true
      }
    });

    console.log('Created competition:', competition);

    // Your existing points data
    const yourData = {
      "Latvia": 4,
      "Norway": 8,
      "Poland": 2,
      "Sweden": 12,
      "Denmark": 7,
      "Estonia": 5,
      "Finland": 10,
      "Germany": 1,
      "Iceland": 6,
      "Lithuania": 3
    };

    // Initialize all countries to 0, then add your data
    const countryPoints: { [key: string]: number } = {};
    EUROVISION_2023_COUNTRIES.forEach(country => {
      countryPoints[country] = yourData[country as keyof typeof yourData] || 0;
    });

    // Create cumulative results
    const cumulativeResult = await prisma.cumulativeResult.create({
      data: {
        competitionId: competition.id,
        results: countryPoints,
        totalVotes: 1
      }
    });

    console.log('Created cumulative result:', cumulativeResult);

    return NextResponse.json({ 
      success: true,
      message: 'Database cleaned and initialized successfully',
      competition,
      cumulativeResult,
      pointsData: countryPoints
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
