export interface Vote {
  userId: string;
  userName: string;
  userEmail: string;
  votes: string[];
  timestamp: Date;
}

export interface ResultsData {
  totalVotes: number;
  countryPoints: { [country: string]: number };
  countryVoteCounts?: { [country: string]: number }; // How many users voted for each country
  userVote?: Vote;
  sessionEmail?: string | null; // For debugging session state - can be null
  authPending?: boolean; // When auth is still loading
}
