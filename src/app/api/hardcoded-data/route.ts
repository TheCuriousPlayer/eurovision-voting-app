import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return hardcoded data that matches what should be in the database
    // This will help us verify if the issue is with the database queries or the data itself
    
    const hardcodedData = {
      competitions: [
        {
          id: "ff62e615-0d43-4923-8b2d-45d8eded5386",
          year: 2023,
          name: "Eurovision 2023",
          isActive: true
        }
      ],
      cumulativeResults: [
        {
          id: "f7054a88-261a-4e7c-8f95-5e864aa831f3",
          competitionId: "ff62e615-0d43-4923-8b2d-45d8eded5386",
          results: {
            "Italy": 0, "Malta": 6, "Spain": 1, "Cyprus": 0, "France": 12, "Greece": 0, 
            "Israel": 2, "Latvia": 0, "Norway": 24, "Poland": 10, "Serbia": 0, "Sweden": 34, 
            "Albania": 0, "Armenia": 5, "Austria": 14, "Belgium": 7, "Croatia": 0, "Czechia": 2, 
            "Denmark": 0, "Estonia": 5, "Finland": 9, "Georgia": 0, "Germany": 0, "Iceland": 0, 
            "Ireland": 0, "Moldova": 19, "Romania": 0, "Ukraine": 0, "Portugal": 0, "Slovenia": 10, 
            "Australia": 6, "Lithuania": 0, "Azerbaijan": 0, "San Marino": 0, "Netherlands": 0, 
            "Switzerland": 8, "United Kingdom": 0
          },
          totalVotes: 3,
          lastUpdated: "2025-08-19T23:22:30.166Z"
        }
      ],
      votes: [
        {
          id: "cmehrsf1r000bla045nl2p4b5",
          userId: "ozgunciziltepe@gmail.com",
          userName: "özgün çiziltepe",
          userEmail: "ozgunciziltepe@gmail.com",
          competitionId: "ff62e615-0d43-4923-8b2d-45d8eded5386",
          votes: ["Sweden", "Norway", "Austria", "Moldova", "Australia", "Armenia", "Poland", "Belgium", "Finland", "France"],
          points: {"France": 1, "Norway": 10, "Poland": 4, "Sweden": 12, "Armenia": 5, "Austria": 8, "Belgium": 3, "Finland": 2, "Moldova": 7, "Australia": 6},
          createdAt: "2025-08-18T23:52:43.308Z",
          updatedAt: "2025-08-19T23:22:29.82Z"
        }
      ],
      message: "Hardcoded data that should match database contents"
    };
    
    return NextResponse.json(hardcodedData);
  } catch (error) {
    console.error('Hardcoded data error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
