import { prisma } from './prisma';

interface Vote {
  userId: string;
  userName: string;
  userEmail: string;
  votes: string[];
  timestamp: Date;
}

// Eurovision 2023 Countries
const EUROVISION_2023_COUNTRIES = [
  'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Belgium', 'Croatia',
  'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
  'Germany', 'Greece', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Latvia',
  'Lithuania', 'Malta', 'Moldova', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovenia', 'Spain',
  'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'
];

// Eurovision 2024 Countries (example - update with actual)
const EUROVISION_2024_COUNTRIES = [
  'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Belgium', 'Croatia',
  'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
  'Germany', 'Greece', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Latvia',
  'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'San Marino', 'Serbia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Ukraine', 'United Kingdom'
];

export class DatabaseStorage {
  
  // Initialize competitions (run once)
  async initializeCompetitions() {
    try {
      // Check if competitions already exist first to avoid unnecessary upserts
      const existing2023 = await prisma.competition.findUnique({
        where: { year: 2023 }
      });

      if (!existing2023) {
        await prisma.competition.create({
          data: {
            year: 2023,
            name: 'Eurovision 2023',
            countries: EUROVISION_2023_COUNTRIES,
            isActive: true
          }
        });
      }

      // Create Eurovision 2024 if not exists
      const existing2024 = await prisma.competition.findUnique({
        where: { year: 2024 }
      });

      if (!existing2024) {
        await prisma.competition.create({
          data: {
            year: 2024,
            name: 'Eurovision 2024',
            countries: EUROVISION_2024_COUNTRIES,
            isActive: true
          }
        });
      }

      console.log('Competitions initialized successfully');
    } catch (error) {
      console.error('Error initializing competitions:', error);
      // Continue without throwing - competitions may already exist
    }
  }

  // Add or update a vote
  async addOrUpdateVote(vote: Vote, year: number) {
    try {
      // Get competition
      const competition = await prisma.competition.findUnique({
        where: { year }
      });

      if (!competition) {
        throw new Error(`Competition for year ${year} not found`);
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
          votes: vote.votes,
          points: points,
          updatedAt: new Date()
        },
        create: {
          userId: vote.userId,
          userName: vote.userName,
          userEmail: vote.userEmail,
          competitionId: competition.id,
          votes: vote.votes,
          points: points
        }
      });

      // Update cumulative results
      await this.updateCumulativeResults(year);

      console.log(`Vote saved for user ${vote.userId} in ${year}`);
    } catch (error) {
      console.error('Error saving vote:', error);
      throw error;
    }
  }

  // Get user's vote for a specific year
  async getUserVote(userId: string, year: number) {
    try {
      const competition = await prisma.competition.findUnique({
        where: { year }
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
        timestamp: vote.updatedAt
      };
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  }

  // Get cumulative results for a year
  async getCumulativeResults(year: number) {
    try {
      const competition = await prisma.competition.findUnique({
        where: { year }
      });

      if (!competition) {
        console.log(`Competition for year ${year} not found`);
        return { countryPoints: {}, totalVotes: 0 };
      }

      // Try to get cached results first
      const cached = await prisma.cumulativeResult.findUnique({
        where: { competitionId: competition.id }
      });

      if (cached) {
        console.log(`Found cached results for ${year}: ${cached.totalVotes} votes`);
        console.log('Cached results object keys:', Object.keys(cached.results as Record<string, unknown>));
        console.log('Cached results sample:', JSON.stringify(cached.results).substring(0, 200));
        
        // Double-check if cached shows 0 but votes exist
        if (cached.totalVotes === 0) {
          const actualVoteCount = await prisma.vote.count({ 
            where: { competitionId: competition.id } 
          });
          console.warn(`Cached shows 0 votes but actual vote count is ${actualVoteCount}`);
          if (actualVoteCount > 0) {
            console.log('Forcing recalculation due to mismatch...');
            return await this.updateCumulativeResults(year);
          }
        }
        
        return {
          countryPoints: cached.results as { [country: string]: number },
          totalVotes: cached.totalVotes
        };
      }

      // Calculate if not cached
      console.log(`No cached results found for ${year}, calculating...`);
      return await this.updateCumulativeResults(year);
    } catch (error) {
      console.error('Error getting cumulative results:', error);
      // Return empty results instead of throwing
      return { countryPoints: {}, totalVotes: 0 };
    }
  }

  // Update cumulative results (called after each vote)
  private async updateCumulativeResults(year: number) {
    try {
      const competition = await prisma.competition.findUnique({
        where: { year },
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

      // Sum up all votes
      competition.votes.forEach(vote => {
        const points = vote.points as { [country: string]: number };
        Object.entries(points).forEach(([country, pointsValue]) => {
          if (countryPoints[country] !== undefined) {
            countryPoints[country] += pointsValue;
          }
        });
      });

      const totalVotes = competition.votes.length;

      // Cache the results
      await prisma.cumulativeResult.upsert({
        where: { competitionId: competition.id },
        update: {
          results: countryPoints,
          totalVotes,
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: countryPoints,
          totalVotes
        }
      });

      return { countryPoints, totalVotes };
    } catch (error) {
      console.error('Error updating cumulative results:', error);
      return { countryPoints: {}, totalVotes: 0 };
    }
  }

  // Get all competitions
  async getCompetitions() {
    try {
      return await prisma.competition.findMany({
        orderBy: { year: 'desc' }
      });
    } catch (error) {
      console.error('Error getting competitions:', error);
      return [];
    }
  }
}

export const dbStorage = new DatabaseStorage();
