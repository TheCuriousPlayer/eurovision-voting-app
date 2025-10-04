// Simple in-memory storage for Vercel
// This will work until the serverless function restarts

interface Vote {
  userId: string;
  userName: string;
  userEmail: string;
  votes: string[];
  timestamp: Date;
}

interface CumulativeResults {
  [country: string]: number;
}

// In-memory storage
const votes: { [userId: string]: Vote } = {};
let cumulativeResults: CumulativeResults = {};
let lastUpdated: string = new Date().toISOString();

export function addOrUpdateVote(vote: Vote) {
  console.log('Memory Storage: Adding vote for', vote.userId);
  votes[vote.userId] = vote;
  
  // Recalculate cumulative results
  calculateCumulative();
  
  console.log('Memory Storage: Vote added. Total votes:', Object.keys(votes).length);
}

export function getUserVote(userId: string): Vote | null {
  return votes[userId] || null;
}

export function getCumulativeResults() {
  return {
    countryPoints: cumulativeResults,
    totalVotes: Object.keys(votes).length,
    lastUpdated: lastUpdated
  };
}

function calculateCumulative() {
  console.log('Memory Storage: Calculating cumulative results...');
  
  // Reset cumulative results
  cumulativeResults = {};
  
  // Process each vote
  Object.values(votes).forEach(vote => {
    vote.votes.forEach((country, index) => {
      if (country && country.trim() !== '') {
        const points = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1][index];
        if (!cumulativeResults[country]) {
          cumulativeResults[country] = 0;
        }
        cumulativeResults[country] += points;
      }
    });
  });
  
  lastUpdated = new Date().toISOString();
  console.log('Memory Storage: Calculated results for', Object.keys(votes).length, 'votes');
}

// Initialize with some default countries at 0 points
export function initializeDefaultCountries() {
  const countries = [
    'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Belgium', 'Croatia',
    'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
    'Germany', 'Greece', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Latvia',
    'Lithuania', 'Malta', 'Moldova', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovenia', 'Southern Cyprus', 'Spain',
    'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'
  ];
  
  countries.forEach(country => {
    if (!cumulativeResults[country]) {
      cumulativeResults[country] = 0;
    }
  });
}
