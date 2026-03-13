import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EUROVISION_2023_COUNTRIES = [
  'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Belgium', 'Croatia',
  'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
  'Germany', 'Greece', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Latvia',
  'Lithuania', 'Malta', 'Moldova', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovenia', 'Southern Cyprus', 'Spain',
  'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'
];

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
    // First, let's clean up and start fresh
    await prisma.cumulativeResult.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.competition.deleteMany();

    const competitions = [];
    const cumulativeResults = [];

    // Create Eurovision 2023 competition
    const competition2023 = await prisma.competition.create({
      data: {
        year: 2023,
        name: 'Eurovision 2023',
        countries: EUROVISION_2023_COUNTRIES,
        isActive: true
      }
    });
    competitions.push(competition2023);
    console.log('Created competition 2023:', competition2023);

    // Your existing points data for 2023
    const yourData2023 = {
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
    const countryPoints2023: { [key: string]: number } = {};
    EUROVISION_2023_COUNTRIES.forEach(country => {
      countryPoints2023[country] = yourData2023[country as keyof typeof yourData2023] || 0;
    });

    // Create cumulative results for 2023
    const cumulativeResult2023 = await prisma.cumulativeResult.create({
      data: {
        competitionId: competition2023.id,
        results: countryPoints2023,
        totalVotes: 1
      }
    });
    cumulativeResults.push(cumulativeResult2023);
    console.log('Created cumulative result 2023:', cumulativeResult2023);

    // Create Eurovision 2026 Preview competition (year code: 202600)
    const competition2026Preview = await prisma.competition.create({
      data: {
        year: 202600,
        name: 'Eurovision 2026 Preview',
        countries: EUROVISION_2026_PREVIEW_COUNTRIES,
        isActive: true
      }
    });
    competitions.push(competition2026Preview);
    console.log('Created competition 202600 (2026 Preview):', competition2026Preview);

    // Initialize empty results for 2026 Preview
    const countryPoints2026Preview: { [key: string]: number } = {};
    EUROVISION_2026_PREVIEW_COUNTRIES.forEach(country => {
      countryPoints2026Preview[country] = 0;
    });

    // Create cumulative results for 2026 Preview
    const cumulativeResult2026Preview = await prisma.cumulativeResult.create({
      data: {
        competitionId: competition2026Preview.id,
        results: countryPoints2026Preview,
        voteCounts: {},
        totalVotes: 0
      }
    });
    cumulativeResults.push(cumulativeResult2026Preview);
    console.log('Created cumulative result 2026 Preview:', cumulativeResult2026Preview);

    return NextResponse.json({ 
      success: true,
      message: 'Database cleaned and initialized successfully with all competitions',
      competitions,
      cumulativeResults
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
