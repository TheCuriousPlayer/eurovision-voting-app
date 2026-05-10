import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatTotalsAsDetailedResults(countryPoints: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(countryPoints).map(([country, total]) => [
      country,
      `${total},0,0,0,0,0,0,0,0,0,0`
    ])
  );
}

export function buildDetailedResultsFromVotes(
  countries: string[],
  votes: Array<{ points?: Record<string, unknown> | Prisma.JsonValue | null; votes?: string[] | Prisma.JsonValue | null }>
): {
  results: Record<string, string>;
  voteCounts: Record<string, number>;
  totalVotes: number;
  countryPoints: Record<string, number>;
} {
  const pointBreakdown: {
    [country: string]: {
      total: number;
      points12: number;
      points10: number;
      points8: number;
      points7: number;
      points6: number;
      points5: number;
      points4: number;
      points3: number;
      points2: number;
      points1: number;
    };
  } = {};
  const countryVoteCounts: { [country: string]: number } = {};

  countries.forEach(country => {
    pointBreakdown[country] = {
      total: 0,
      points12: 0,
      points10: 0,
      points8: 0,
      points7: 0,
      points6: 0,
      points5: 0,
      points4: 0,
      points3: 0,
      points2: 0,
      points1: 0
    };
    countryVoteCounts[country] = 0;
  });

  let totalVotes = 0;

  votes.forEach(vote => {
    const points =
      vote.points && typeof vote.points === 'object' && !Array.isArray(vote.points)
        ? (vote.points as Record<string, unknown>)
        : {};
    let hasNonEmptyVote = false;

    Object.entries(points).forEach(([country, rawValue]) => {
      const pointsValue = safeNumber(rawValue);
      if (!Number.isFinite(pointsValue)) return;

      if (pointBreakdown[country]) {
        pointBreakdown[country].total += pointsValue;

        switch (pointsValue) {
          case 12:
            pointBreakdown[country].points12 += pointsValue;
            break;
          case 10:
            pointBreakdown[country].points10 += pointsValue;
            break;
          case 8:
            pointBreakdown[country].points8 += pointsValue;
            break;
          case 7:
            pointBreakdown[country].points7 += pointsValue;
            break;
          case 6:
            pointBreakdown[country].points6 += pointsValue;
            break;
          case 5:
            pointBreakdown[country].points5 += pointsValue;
            break;
          case 4:
            pointBreakdown[country].points4 += pointsValue;
            break;
          case 3:
            pointBreakdown[country].points3 += pointsValue;
            break;
          case 2:
            pointBreakdown[country].points2 += pointsValue;
            break;
          case 1:
            pointBreakdown[country].points1 += pointsValue;
            break;
          default:
            break;
        }
      }

      if (pointsValue !== 0) {
        hasNonEmptyVote = true;
      }
    });

    const voteEntries =
      Array.isArray(vote.votes) && vote.votes.every(item => typeof item === 'string')
        ? (vote.votes as string[])
        : [];
    const hasNonEmptyEntry = voteEntries.some(country => country.trim() !== '');
    if (hasNonEmptyVote || hasNonEmptyEntry) {
      totalVotes++;
      voteEntries.forEach(country => {
        if (country.trim() !== '' && countryVoteCounts[country] !== undefined) {
          countryVoteCounts[country] = countryVoteCounts[country] + 1;
        }
      });
    }
  });

  const results: Record<string, string> = {};
  const countryPoints: Record<string, number> = {};

  Object.entries(pointBreakdown).forEach(([country, breakdown]) => {
    countryPoints[country] = breakdown.total;
    results[country] = [
      breakdown.total,
      breakdown.points12,
      breakdown.points10,
      breakdown.points8,
      breakdown.points7,
      breakdown.points6,
      breakdown.points5,
      breakdown.points4,
      breakdown.points3,
      breakdown.points2,
      breakdown.points1
    ].join(',');
  });

  return {
    results,
    voteCounts: countryVoteCounts,
    totalVotes,
    countryPoints
  };
}

interface Vote {
  userName: string;
  userEmail: string;
  votes: string[];
  timestamp: Date;
}

class DatabaseStorage {
  async initializeCompetitions() {
    try {
      // Competitions are already created manually in Supabase:
        // - 202000: Eurovision 2020 Final (old/main)
      // - 202001: Eurovision 2020A (Semi-Final A)  
      // - 202002: Eurovision 2020B (Semi-Final B)
        // - 202003: Eurovision 2020 Final (new final with 20 countries)
      return;
    } catch (error) {
      console.error('Error checking competitions:', error);
      throw error;
    }
  }

  // Store or update a vote
  async addOrUpdateVote(vote: Vote, yearCode: number) {
    try {
      // Get competition
      const competition = await prisma.competition.findFirst({
        where: { 
          year: yearCode
        },
        select: { id: true, countries: true }
      });

      if (!competition) {
        throw new Error(`Competition for year code ${yearCode} not found`);
      }

      // Calculate points from vote positions
      const points: { [country: string]: number } = {};
      vote.votes.forEach((country, index) => {
        if (country && country.trim() !== '') {
          const pointsToAdd = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1][index];
          if (pointsToAdd) {
            points[country] = pointsToAdd;
          }
        }
      });

      // Get old vote BEFORE upserting (for incremental cumulative update)
      const oldVote = await prisma.vote.findUnique({
        where: {
          userEmail_competitionId: {
            userEmail: vote.userEmail,
            competitionId: competition.id
          }
        },
        select: { points: true, votes: true }
      });

      // Upsert vote
      await prisma.vote.upsert({
        where: {
          userEmail_competitionId: {
            userEmail: vote.userEmail,
            competitionId: competition.id
          }
        },
        update: {
          userName: vote.userName,
          userEmail: vote.userEmail,
          votes: vote.votes,
          points: points
        },
        create: {
          userName: vote.userName,
          userEmail: vote.userEmail,
          votes: vote.votes,
          points: points,
          competitionId: competition.id
        }
      });

      // Incremental cumulative update (avoids re-fetching all votes)
      const isNewVote = !oldVote;
      const oldPoints = (oldVote?.points as { [country: string]: number }) || {};
      try {
        await this.incrementalUpdateCumulativeResults(competition.id, oldPoints, points, isNewVote, competition.countries as string[]);
      } catch (incrementalError) {
        // Incremental update failed — fall back to full recompute
        console.error(`Incremental update failed for year ${yearCode}, falling back to full recompute:`, incrementalError);
        await this.updateCumulativeResults(yearCode);
      }

    } catch (error) {
      console.error('Error adding/updating vote:', error);
      throw error;
    }
  }

  async getUserVote(userEmail: string, yearCode: number) {
    try {
      const competition = await prisma.competition.findFirst({
        where: { 
          year: yearCode
        },
        select: { id: true }
      });

      if (!competition) return null;

      const vote = await prisma.vote.findUnique({
        where: {
          userEmail_competitionId: {
            userEmail,
            competitionId: competition.id
          }
        }
      });

      if (!vote) return null;

      return {
        userName: vote.userName || vote.userEmail, // Fallback to email if userName is null
        userEmail: vote.userEmail,
        votes: vote.votes as string[],
        timestamp: vote.createdAt
      };
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  }

  // Get cumulative results for a year (using code-based lookup)
  async getCumulativeResults(yearCode: number) {
    try {
      const competition = await prisma.competition.findFirst({
        where: { 
          year: yearCode
        },
        select: { id: true }
      });

      if (!competition) {
        return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
      }

      // Try to get cached results first
      const cached = await prisma.cumulativeResult.findUnique({
        where: { competitionId: competition.id }
      });

      if (cached) {
        
        const cachedResults = cached.results as Record<string, unknown>;

        if (cached.totalVotes === 0) {
          const actualVoteCount = await prisma.vote.count({
            where: { competitionId: competition.id }
          });
          if (actualVoteCount > 0) {
            return await this.updateCumulativeResults(yearCode);
          }
        }

        if (this.isCachedResultsSuspicious(cachedResults)) {
          const actualVoteCount = await prisma.vote.count({
            where: { competitionId: competition.id }
          });
          if (actualVoteCount > 0) {
            return await this.updateCumulativeResults(yearCode);
          }
        }

        const countryPoints: { [country: string]: number } = {};

        Object.entries(cachedResults).forEach(([country, value]) => {
          if (typeof value === 'string') {
            const total = parseInt(value.split(',')[0]);
            countryPoints[country] = isNaN(total) ? 0 : total;
          } else if (typeof value === 'number') {
            countryPoints[country] = value;
          }
        });

        return {
          countryPoints: countryPoints,
          totalVotes: cached.totalVotes,
          countryVoteCounts: (cached.voteCounts as { [country: string]: number }) || {}
        };
      }

      // No cached results, calculate fresh
      return await this.updateCumulativeResults(yearCode);
    } catch (error) {
      console.error('Error getting cumulative results:', error);
      return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
    }
  }

  // Incremental update: apply delta from old vote to new vote without re-fetching all votes
  private async incrementalUpdateCumulativeResults(
    competitionId: string,
    oldPoints: { [country: string]: number },
    newPoints: { [country: string]: number },
    isNewVote: boolean,
    countries: string[]
  ) {
    try {
      const cached = await prisma.cumulativeResult.findUnique({
        where: { competitionId }
      });

      if (!cached) {
        // No cached results yet — need full recalculation to bootstrap
        // Find yearCode from competition
        const competition = await prisma.competition.findFirst({
          where: { id: competitionId },
          select: { year: true }
        });
        if (competition) {
          await this.updateCumulativeResults(competition.year);
        }
        return;
      }

      // Parse existing cached results
      const cachedResults = cached.results as Record<string, unknown>;
      const POINT_VALUES = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];

      // Build current detailed breakdown from cached string format
      const breakdown: { [country: string]: number[] } = {};
      countries.forEach(country => {
        breakdown[country] = this.parseDetailedBreakdownValue(cachedResults[country]);
      });

      // Parse existing vote counts
      const voteCounts = (cached.voteCounts as { [country: string]: number }) || {};

      // Ensure voteCounts has entries for all known countries (avoid undefined skips)
      countries.forEach(country => {
        if (voteCounts[country] === undefined) voteCounts[country] = 0;
      });

      // Subtract old points
      Object.entries(oldPoints).forEach(([country, pts]) => {
        if (breakdown[country]) {
          breakdown[country][0] -= pts; // total
          const idx = POINT_VALUES.indexOf(pts);
          if (idx >= 0) breakdown[country][idx + 1] -= pts;
        }
        // Decrement vote count for old country
        if (voteCounts[country] !== undefined) {
          voteCounts[country] = Math.max(0, (voteCounts[country] || 0) - 1);
        }
      });

      // Add new points
      Object.entries(newPoints).forEach(([country, pts]) => {
        if (breakdown[country]) {
          breakdown[country][0] += pts; // total
          const idx = POINT_VALUES.indexOf(pts);
          if (idx >= 0) breakdown[country][idx + 1] += pts;
        }
        // Increment vote count for new country
        if (voteCounts[country] !== undefined) {
          voteCounts[country] = (voteCounts[country] || 0) + 1;
        }
      });

      // Convert back to string format
      const updatedResults: { [country: string]: string } = {};
      Object.entries(breakdown).forEach(([country, vals]) => {
        updatedResults[country] = vals.join(',');
      });

      // Recompute totalVotes increment based on whether the old/new vote actually contained points
      const oldHasPoints = oldPoints && Object.keys(oldPoints).length > 0;
      const newHasPoints = newPoints && Object.keys(newPoints).length > 0;
      let newTotalVotes = cached.totalVotes || 0;
      if (!oldHasPoints && newHasPoints) {
        newTotalVotes = newTotalVotes + 1;
      } else if (oldHasPoints && !newHasPoints) {
        newTotalVotes = Math.max(0, newTotalVotes - 1);
      }

      await prisma.cumulativeResult.update({
        where: { competitionId },
        data: {
          results: updatedResults,
          voteCounts: voteCounts,
          totalVotes: newTotalVotes,
          lastUpdated: new Date()
        }
      });


    } catch (error) {
      console.error('Error in incremental cumulative update:', error);
      throw error; // Re-throw so addOrUpdateVote can catch and log properly
    }
  }

  private async updateCumulativeResults(yearCode: number) {
    try {
      const competition = await prisma.competition.findFirst({
        where: { 
          year: yearCode
        },
        select: { id: true, countries: true }
      });

      if (!competition) {
        return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
      }

      // Fetch votes separately with only needed fields
      const votes = await prisma.vote.findMany({
        where: { competitionId: competition.id },
        select: { points: true, votes: true }
      });

      const {
        results: countryPointsDetailed,
        voteCounts: countryVoteCounts,
        totalVotes,
        countryPoints
      } = buildDetailedResultsFromVotes(competition.countries, votes);

      await prisma.cumulativeResult.upsert({
        where: { competitionId: competition.id },
        update: {
          results: countryPointsDetailed,
          voteCounts: countryVoteCounts,
          totalVotes: totalVotes,
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: countryPointsDetailed,
          voteCounts: countryVoteCounts,
          totalVotes: totalVotes,
          lastUpdated: new Date()
        }
      });

      return { countryPoints, totalVotes, countryVoteCounts };
    } catch (error) {
      console.error('Error updating cumulative results:', error);
      return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
    }
  }
  private parseDetailedBreakdownValue(value: unknown): number[] {
    if (typeof value === 'number') {
      return [value, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (typeof value === 'string') {
      const parsed = value.split(',').map(part => {
        const num = Number(part.trim());
        return Number.isFinite(num) ? num : 0;
      });
      const normalized = parsed.concat(Array(11 - parsed.length).fill(0)).slice(0, 11);
      return normalized;
    }

    if (Array.isArray(value)) {
      const parsed = value.map(item => {
        if (typeof item === 'number') return item;
        if (typeof item === 'string') {
          const num = Number(item.trim());
          return Number.isFinite(num) ? num : 0;
        }
        return 0;
      });
      const normalized = parsed.concat(Array(11 - parsed.length).fill(0)).slice(0, 11);
      return normalized;
    }

    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  private isCachedResultsSuspicious(cachedResults: Record<string, unknown>): boolean {
    return Object.values(cachedResults).some(value => {
      if (typeof value === 'number') return true;
      if (typeof value === 'string') {
        const parts = value.split(',').map(part => {
          const num = Number(part.trim());
          return Number.isFinite(num) ? num : 0;
        });
        if (parts.length < 11) return true;
        const total = parts[0] || 0;
        const breakdownSum = parts.slice(1).reduce((sum, part) => sum + part, 0);
        return total > 0 && breakdownSum === 0;
      }
      if (Array.isArray(value)) {
        if (value.length < 11) return true;
        const parts = value.map(item => {
          if (typeof item === 'number') return item;
          if (typeof item === 'string') {
            const num = Number(item.trim());
            return Number.isFinite(num) ? num : 0;
          }
          return 0;
        });
        const total = parts[0] || 0;
        const breakdownSum = parts.slice(1).reduce((sum, part) => sum + part, 0);
        return total > 0 && breakdownSum === 0;
      }
      return true;
    });
  }

  public async refreshCumulativeResults(yearCode: number) {
    return this.updateCumulativeResults(yearCode);
  }}

export const dbStorage = new DatabaseStorage();