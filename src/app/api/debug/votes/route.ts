import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const competition = await prisma.competition.findUnique({ where: { year: 2023 }, include: { votes: true } });
    if (!competition) {
      return NextResponse.json({ error: 'Competition 2023 not found' }, { status: 404 });
    }
    const voteCount = competition.votes.length;
    const cached = await prisma.cumulativeResult.findUnique({ where: { competitionId: competition.id } });
    const cachedResultsKeys: string[] = cached && typeof cached.results === 'object' && cached.results !== null
      ? Object.keys(cached.results as Record<string, unknown>)
      : [];
    return NextResponse.json({
      voteCount,
      cachedExists: !!cached,
      cachedTotalVotes: cached?.totalVotes ?? null,
      cachedResultsKeys,
      lastUpdated: cached?.lastUpdated ?? null,
    }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
