﻿import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Lightweight endpoint: returns only totalVotes per competition (no results/voteCounts JSON)
export async function GET() {
  try {
    const results = await prisma.cumulativeResult.findMany({
      select: {
        competitionId: true,
        totalVotes: true
      }
    });

    const competitions = await prisma.competition.findMany({
      select: {
        id: true,
        year: true
      }
    });

    const yearMap = Object.fromEntries(competitions.map(c => [c.id, c.year]));
    const counts: { [yearCode: string]: number } = {};

    results.forEach(r => {
      const year = yearMap[r.competitionId];
      if (year !== undefined) {
        counts[String(year)] = r.totalVotes;
      }
    });

    return NextResponse.json(counts, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error('Error fetching vote counts:', error);
    return NextResponse.json({}, { status: 500 });
  }
}
