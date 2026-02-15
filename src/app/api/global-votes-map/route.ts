import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Legacy/divided countries mapping - distribute votes to successor states
const legacyCountries: { [legacy: string]: string[] } = {
  'Serbia and Montenegro': ['Serbia', 'Montenegro'],
  'Serbia Montenegro': ['Serbia', 'Montenegro'],
  'Yugoslavia': ['Serbia', 'Montenegro', 'Croatia', 'Slovenia', 'North Macedonia', 'Bosnia and Herzegovina']
};

export async function GET(request: NextRequest) {
  try {
    // Fetch votes from main competitions only (exclude 202001, 202002, 202003)
    const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    
    const competitions = await prisma.competition.findMany({
      where: {
        year: {
          in: years
        }
      },
      select: {
        id: true,
        year: true
      }
    });

    if (competitions.length === 0) {
      return NextResponse.json({ 
        countryCounts: {},
        countryPoints: {},
        totalVotes: 0,
        totalUsers: 0
      });
    }

    // Fetch ALL votes across ALL users for main competitions
    const votes = await prisma.vote.findMany({
      where: {
        competitionId: {
          in: competitions.map(c => c.id)
        }
        // NO userEmail filter - get everyone's data
      },
      select: {
        votes: true,
        userEmail: true,
        competitionId: true
      }
    });

    // Aggregate votes by country (count and points)
    const countryCounts: { [country: string]: number } = {};
    const countryPoints: { [country: string]: number } = {};
    const uniqueUsers = new Set<string>();
    let totalVotes = 0;

    // Points array: [12, 10, 8, 7, 6, 5, 4, 3, 2, 1]
    const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];

    votes.forEach(vote => {
      // Track unique users
      if (vote.userEmail) {
        uniqueUsers.add(vote.userEmail);
      }

      if (vote.votes && Array.isArray(vote.votes)) {
        (vote.votes as string[]).forEach((country, index) => {
          if (typeof country === 'string' && country.trim() !== '') {
            // Check if this is a legacy country that needs to be split
            const successors = legacyCountries[country];
            
            if (successors && successors.length > 0) {
              // Distribute votes and points to all successor countries
              successors.forEach(successor => {
                countryCounts[successor] = (countryCounts[successor] || 0) + 1;
                if (index < POINTS.length) {
                  countryPoints[successor] = (countryPoints[successor] || 0) + POINTS[index];
                }
              });
            } else {
              // Normal country - add as usual
              countryCounts[country] = (countryCounts[country] || 0) + 1;
              if (index < POINTS.length) {
                countryPoints[country] = (countryPoints[country] || 0) + POINTS[index];
              }
            }
            totalVotes++;
          }
        });
      }
    });

    return NextResponse.json({
      countryCounts,
      countryPoints,
      totalVotes,
      totalUsers: uniqueUsers.size,
      competitions: competitions.map(c => c.year)
    });

  } catch (error) {
    console.error('Error fetching global votes map:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global vote data' },
      { status: 500 }
    );
  }
}
