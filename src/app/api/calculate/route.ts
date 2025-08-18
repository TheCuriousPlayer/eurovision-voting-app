import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Vote {
  [country: string]: number;
}

interface UserVote {
  userId: string;
  vote: Vote;
  timestamp: string;
}

export async function POST() {
  try {
    const votesDir = path.join(process.cwd(), 'src', 'app', 'eurovision2023', 'votes');
    const cumulativeFile = path.join(votesDir, 'cumulative_results.json');

    // Ensure votes directory exists
    if (!fs.existsSync(votesDir)) {
      fs.mkdirSync(votesDir, { recursive: true });
    }

    // Get all vote files
    const files = fs.readdirSync(votesDir).filter(file => 
      file.startsWith('vote_') && file.endsWith('.json')
    );

    console.log(`Processing ${files.length} vote files...`);

    const cumulativeResults: { [country: string]: number } = {};

    // Process each vote file
    for (const file of files) {
      try {
        const filePath = path.join(votesDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const userVote: UserVote = JSON.parse(fileContent);

        // Add votes to cumulative results
        for (const [country, points] of Object.entries(userVote.vote)) {
          if (!cumulativeResults[country]) {
            cumulativeResults[country] = 0;
          }
          cumulativeResults[country] += points;
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    // Save cumulative results
    const resultsData = {
      results: cumulativeResults,
      lastUpdated: new Date().toISOString(),
      totalVotes: files.length
    };

    fs.writeFileSync(cumulativeFile, JSON.stringify(resultsData, null, 2));
    
    console.log(`Cumulative results updated. Total votes: ${files.length}`);

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${files.length} votes`,
      totalVotes: files.length,
      lastUpdated: resultsData.lastUpdated
    });

  } catch (error) {
    console.error('Error calculating cumulative results:', error);
    return NextResponse.json(
      { error: 'Failed to calculate results' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(); // Allow GET requests too
}
