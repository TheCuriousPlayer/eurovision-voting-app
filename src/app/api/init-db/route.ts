import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EUROVISION_2023_COUNTRIES = [
  'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Belgium', 'Croatia',
  'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
  'Germany', 'Greece', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Latvia',
  'Lithuania', 'Malta', 'Moldova', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovenia', 'Spain',
  'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'
];

export async function POST() {
  try {
    // Create Eurovision 2023 competition
    const competition2023 = await prisma.competition.upsert({
      where: { year: 2023 },
      update: {},
      create: {
        year: 2023,
        name: 'Eurovision 2023',
        countries: EUROVISION_2023_COUNTRIES,
        isActive: true
      }
    });

    // Create cumulative results with your data
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

    await prisma.cumulativeResult.upsert({
      where: { competitionId: competition2023.id },
      update: {
        results: countryPoints,
        totalVotes: 1, // Assuming this represents 1 vote that generated these points
        lastUpdated: new Date()
      },
      create: {
        competitionId: competition2023.id,
        results: countryPoints,
        totalVotes: 1
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Database initialized with your data',
      competition: competition2023,
      results: countryPoints
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
