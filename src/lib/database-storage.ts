import { prisma } from './prisma';

interface Vote {
  userId: string;
  userName: string;
  userEmail: string;
  votes: string[];
  timestamp: Date;
}

class DatabaseStorage {
  async initializeCompetitions() {
    try {
      // Competitions are already created manually in Supabase:
      // - 202000: Eurovision 2020 Final
      // - 202001: Eurovision 2020A (Semi-Final A)  
      // - 202002: Eurovision 2020B (Semi-Final B)
      console.log('Competitions already exist in database');
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
        }
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

      // Upsert vote
      await prisma.vote.upsert({
        where: {
          userId_competitionId: {
            userId: vote.userId,
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
          userId: vote.userId,
          userName: vote.userName,
          userEmail: vote.userEmail,
          votes: vote.votes,
          points: points,
          competitionId: competition.id
        }
      });

      // Update cumulative results after vote change
      await this.updateCumulativeResults(yearCode);

      console.log(`Vote saved for user ${vote.userId} in competition ${yearCode}`);
    } catch (error) {
      console.error('Error adding/updating vote:', error);
      throw error;
    }
  }

  async getUserVote(userId: string, yearCode: number) {
    try {
      const competition = await prisma.competition.findFirst({
        where: { 
          year: yearCode
        }
      });

      if (!competition) return null;

      const vote = await prisma.vote.findUnique({
        where: {
          userId_competitionId: {
            userId,
            competitionId: competition.id
          }
        }
      });

      if (!vote) return null;

      return {
        userId: vote.userId,
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
        }
      });

      if (!competition) {
        console.log(`Competition for year code ${yearCode} not found`);
        return { countryPoints: {}, totalVotes: 0 };
      }

      // Try to get cached results first
      const cached = await prisma.cumulativeResult.findUnique({
        where: { competitionId: competition.id }
      });

      if (cached) {
        console.log(`Found cached results for ${yearCode}: ${cached.totalVotes} votes`);
        console.log('Cached results object keys:', Object.keys(cached.results as Record<string, unknown>));
        console.log('Cached results sample:', JSON.stringify(cached.results).substring(0, 200));
        
        // Double-check if cached shows 0 but votes exist
        if (cached.totalVotes === 0) {
          // Count only votes that contain at least one non-empty entry
          const rawCount = await prisma.$queryRaw<Array<{ cnt: number }>>`
            SELECT COUNT(*)::int AS cnt
            FROM votes v
            WHERE v."competitionId" = ${competition.id}
              AND (
                SELECT COUNT(*)
                FROM jsonb_array_elements_text(v.votes::jsonb) AS x
                WHERE x <> ''
              ) > 0
          `;
          const actualVoteCount = Array.isArray(rawCount) && rawCount.length > 0 && typeof rawCount[0].cnt === 'number' ? rawCount[0].cnt : 0;
          console.warn(`Cached shows 0 votes but actual non-empty vote count is ${actualVoteCount}`);
          if (actualVoteCount > 0) {
            console.log('Forcing recalculation due to mismatch...');
            return await this.updateCumulativeResults(yearCode);
          }
        }
        
        return {
          countryPoints: cached.results as { [country: string]: number },
          totalVotes: cached.totalVotes
        };
      }

      // No cached results, calculate fresh
      console.log(`No cached results found for ${yearCode}, calculating fresh...`);
      return await this.updateCumulativeResults(yearCode);
    } catch (error) {
      console.error('Error getting cumulative results:', error);
      return { countryPoints: {}, totalVotes: 0 };
    }
  }

  private async updateCumulativeResults(yearCode: number) {
    try {
      const competition = await prisma.competition.findFirst({
        where: { 
          year: yearCode
        },
        include: { votes: true }
      });

      if (!competition) {
        return { countryPoints: {}, totalVotes: 0 };
      }

      // Calculate cumulative points
      const countryPoints: { [country: string]: number } = {};
      
      // Initialize all countries to 0
      competition.countries.forEach(country => {
        countryPoints[country] = 0;
      });

      // Sum up all votes and count only non-empty submissions for totalVotes
      let totalVotes = 0;
      competition.votes.forEach(vote => {
        // Add points (if any) to country totals
        const points = (vote.points as { [country: string]: number }) || {};
        Object.entries(points).forEach(([country, pointsValue]) => {
          if (countryPoints[country] !== undefined) {
            countryPoints[country] += pointsValue;
          }
        });

        // Count this vote if it has at least one non-empty entry
        const votes = vote.votes as string[];
        const hasNonEmptyVote = votes.some(v => v && v.trim() !== '');
        if (hasNonEmptyVote) {
          totalVotes++;
        }
      });

      console.log(`Calculated results for ${yearCode}: ${totalVotes} total votes`);
      console.log('Point totals:', countryPoints);

      // Cache the results
      await prisma.cumulativeResult.upsert({
        where: { competitionId: competition.id },
        update: {
          results: countryPoints,
          totalVotes: totalVotes,
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: countryPoints,
          totalVotes: totalVotes,
          lastUpdated: new Date()
        }
      });

      return { countryPoints, totalVotes };
    } catch (error) {
      console.error('Error updating cumulative results:', error);
      return { countryPoints: {}, totalVotes: 0 };
    }
  }
}

export const dbStorage = new DatabaseStorage();