import { Vote } from '@/types/votes';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const VOTES_DIR = join(process.cwd(), 'src', 'app', 'eurovision2023', 'votes');
const CUMULATIVE_FILE = join(process.cwd(), 'src', 'app', 'eurovision2023', 'votes', 'cumulativevotes.json');

// Ensure votes directory exists
if (!existsSync(VOTES_DIR)) {
  mkdirSync(VOTES_DIR, { recursive: true });
}

// Simple file-based storage for individual user votes
class VoteStorage {
  
  // Save individual user vote to their own file
  addOrUpdateVote(vote: Vote): void {
    try {
      const userFile = join(VOTES_DIR, `${vote.userId.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
      console.log('Saving user vote to:', userFile);
      console.log('User vote first country:', vote.votes[0]);
      
      writeFileSync(userFile, JSON.stringify(vote, null, 2));
      console.log('User vote saved successfully');
    } catch (error) {
      console.error('Error saving user vote to file:', error);
    }
  }

  // Get individual user vote from their file
  getUserVote(userId: string): Vote | null {
    try {
      const userFile = join(VOTES_DIR, `${userId.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
      
      if (existsSync(userFile)) {
        const data = readFileSync(userFile, 'utf-8');
        return JSON.parse(data) as Vote;
      }
      return null;
    } catch (error) {
      console.error('Error reading user vote from file:', error);
      return null;
    }
  }

  // Get cumulative results from the Python-generated file
  getCumulativeResults(): { countryPoints: { [country: string]: number }, totalVotes: number } {
    try {
      if (existsSync(CUMULATIVE_FILE)) {
        const data = readFileSync(CUMULATIVE_FILE, 'utf-8');
        const results = JSON.parse(data);
        console.log('Loaded cumulative results with', results.totalVotes, 'total votes');
        return results;
      } else {
        console.log('Cumulative results file does not exist');
        return { countryPoints: {}, totalVotes: 0 };
      }
    } catch (error) {
      console.error('Error reading cumulative results from file:', error);
      return { countryPoints: {}, totalVotes: 0 };
    }
  }

  // Legacy methods for compatibility (deprecated)
  getAllVotes(): Vote[] {
    console.log('Warning: getAllVotes is deprecated. Use getCumulativeResults instead.');
    return [];
  }

  getTotalVotes(): number {
    const results = this.getCumulativeResults();
    return results.totalVotes;
  }

  // Deprecated methods - no longer needed with file-based storage
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  seedVotes(votes: Vote[]): void {
    console.log('Warning: seedVotes is deprecated.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reinitialize(votes: Vote[]): void {
    console.log('Warning: reinitialize is deprecated.');
  }

  isInitialized(): boolean {
    return true;
  }
}

// Global instance
const voteStorage = new VoteStorage();

export default voteStorage;
