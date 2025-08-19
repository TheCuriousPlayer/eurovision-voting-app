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
  userVote?: Vote;
  sessionEmail?: string; // For debugging session state
  authPending?: boolean; // When auth is still loading
}
