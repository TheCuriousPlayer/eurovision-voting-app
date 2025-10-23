import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Test if we can find the 202001 competition specifically
    console.log('Looking for competition 202001...');
    const competition = await prisma.competition.findFirst({
      where: { year: 202001 }
    });
    
    console.log('Competition 202001 found:', !!competition);
    if (competition) {
      console.log('Competition details:', {
        id: competition.id,
        year: competition.year,
        name: competition.name
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      found: !!competition,
      competition: competition ? {
        id: competition.id,
        year: competition.year,
        name: competition.name
      } : null
    });
    
  } catch (error) {
    console.error('Error finding 202001:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
