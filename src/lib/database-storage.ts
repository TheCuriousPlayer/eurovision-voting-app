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
        // - 202000: Eurovision 2020 Final (old/main)
      // - 202001: Eurovision 2020A (Semi-Final A)  
      // - 202002: Eurovision 2020B (Semi-Final B)
        // - 202003: Eurovision 2020 Final (new final with 20 countries)
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
        return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
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
        
        // Parse cached results - extract total points from detailed string format
        const cachedResults = cached.results as Record<string, unknown>;
        const countryPoints: { [country: string]: number } = {};
        
        Object.entries(cachedResults).forEach(([country, value]) => {
          if (typeof value === 'string') {
            // Format is "total,12pts,10pts,8pts,7pts,6pts,5pts,4pts,3pts,2pts,1pts"
            // Extract the first value (total)
            const total = parseInt(value.split(',')[0]);
            countryPoints[country] = isNaN(total) ? 0 : total;
          } else if (typeof value === 'number') {
            // Backward compatibility: if it's already a number, use it directly
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
      console.log(`No cached results found for ${yearCode}, calculating fresh...`);
      return await this.updateCumulativeResults(yearCode);
    } catch (error) {
      console.error('Error getting cumulative results:', error);
      return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
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
        return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
      }

      // Calculate cumulative points and vote counts with detailed breakdown
      const countryPointsDetailed: { [country: string]: string } = {};
      const countryVoteCounts: { [country: string]: number } = {};
      
      // Initialize point breakdown for each country
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
        } 
      } = {};
      
      // Initialize all countries to 0
      competition.countries.forEach(country => {
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

      // Sum up all votes and count only non-empty submissions for totalVotes
      let totalVotes = 0;
      competition.votes.forEach(vote => {
        // Add points (if any) to country totals
        const points = (vote.points as { [country: string]: number }) || {};
        Object.entries(points).forEach(([country, pointsValue]) => {
          if (pointBreakdown[country]) {
            // Add to total
            pointBreakdown[country].total += pointsValue;
            
            // Track specific point values
            switch(pointsValue) {
              case 12: pointBreakdown[country].points12 += pointsValue; break;
              case 10: pointBreakdown[country].points10 += pointsValue; break;
              case 8: pointBreakdown[country].points8 += pointsValue; break;
              case 7: pointBreakdown[country].points7 += pointsValue; break;
              case 6: pointBreakdown[country].points6 += pointsValue; break;
              case 5: pointBreakdown[country].points5 += pointsValue; break;
              case 4: pointBreakdown[country].points4 += pointsValue; break;
              case 3: pointBreakdown[country].points3 += pointsValue; break;
              case 2: pointBreakdown[country].points2 += pointsValue; break;
              case 1: pointBreakdown[country].points1 += pointsValue; break;
            }
          }
        });

        // Count this vote if it has at least one non-empty entry
        const votes = vote.votes as string[];
        const hasNonEmptyVote = votes.some(v => v && v.trim() !== '');
        if (hasNonEmptyVote) {
          totalVotes++;
          
          // Count how many users voted for each country
          votes.forEach(country => {
            if (country && country.trim() !== '' && countryVoteCounts[country] !== undefined) {
              countryVoteCounts[country]++;
            }
          });
        }
      });

      // Format results as "total,12pts,10pts,8pts,7pts,6pts,5pts,4pts,3pts,2pts,1pts"
      Object.entries(pointBreakdown).forEach(([country, breakdown]) => {
        countryPointsDetailed[country] = `${breakdown.total},${breakdown.points12},${breakdown.points10},${breakdown.points8},${breakdown.points7},${breakdown.points6},${breakdown.points5},${breakdown.points4},${breakdown.points3},${breakdown.points2},${breakdown.points1}`;
      });

      console.log(`Calculated results for ${yearCode}: ${totalVotes} total votes`);
      console.log('Point totals (detailed):', countryPointsDetailed);
      console.log('Vote counts:', countryVoteCounts);

      // Cache the results
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

      // For backward compatibility, also return simple countryPoints object
      const countryPoints: { [country: string]: number } = {};
      Object.entries(pointBreakdown).forEach(([country, breakdown]) => {
        countryPoints[country] = breakdown.total;
      });

      return { countryPoints, totalVotes, countryVoteCounts };
    } catch (error) {
      console.error('Error updating cumulative results:', error);
      return { countryPoints: {}, totalVotes: 0, countryVoteCounts: {} };
    }
  }
}

export const dbStorage = new DatabaseStorage();