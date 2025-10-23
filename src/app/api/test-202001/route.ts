import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Getting all 2020 competition IDs...');
    
    // Get all 2020 competitions
    const competitions = await prisma.competition.findMany({
      where: { 
        year: { 
          in: [202000, 202001, 202002] 
        }
      },
      select: {
        id: true,
        year: true,
        name: true
      }
    });

    console.log('Found competitions:', competitions);

    return NextResponse.json({
      success: true,
      competitions: competitions,
      message: 'These are the actual competition IDs in the database'
    });

  } catch (error) {
    console.error('Error getting competition IDs:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}