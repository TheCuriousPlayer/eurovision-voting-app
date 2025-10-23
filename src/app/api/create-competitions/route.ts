import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Creating Eurovision 2020 competitions...');
    
    // Check if competitions already exist
    const existing202000 = await prisma.competition.findFirst({ where: { year: 202000 } });
    const existing202001 = await prisma.competition.findFirst({ where: { year: 202001 } });
    const existing202002 = await prisma.competition.findFirst({ where: { year: 202002 } });
    
    const results = [];
    
    // Create 202000 (main) if it doesn't exist
    if (!existing202000) {
      const comp202000 = await prisma.competition.create({
        data: {
          year: 202000,
          name: "Eurovision 2020",
          isActive: true,
          countries: ["Albania", "Armenia", "Australia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Iceland", "Ireland", "Israel", "Italy", "Latvia", "Lithuania", "Malta", "Moldova", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom"]
        }
      });
      results.push(`Created 202000: ${comp202000.id}`);
    } else {
      results.push('202000 already exists');
    }
    
    // Create 202001 (semi-final A) if it doesn't exist
    if (!existing202001) {
      const comp202001 = await prisma.competition.create({
        data: {
          year: 202001,
          name: "Eurovision 2020 Semi-Final A",
          isActive: true,
          countries: ["Albania", "Armenia", "Australia", "Austria", "Belarus", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Estonia", "Georgia", "Ireland", "Israel", "Lithuania", "Moldova", "North Macedonia", "Norway", "Romania", "Russia", "Slovenia"]
        }
      });
      results.push(`Created 202001: ${comp202001.id}`);
    } else {
      results.push('202001 already exists');
    }
    
    // Create 202002 (semi-final B) if it doesn't exist  
    if (!existing202002) {
      const comp202002 = await prisma.competition.create({
        data: {
          year: 202002,
          name: "Eurovision 2020 Semi-Final B",
          isActive: true,
          countries: ["Azerbaijan", "Denmark", "Finland", "Greece", "Iceland", "Latvia", "Malta", "Netherlands", "Poland", "Portugal", "San Marino", "Serbia", "Spain", "Sweden", "Switzerland", "Ukraine"]
        }
      });
      results.push(`Created 202002: ${comp202002.id}`);
    } else {
      results.push('202002 already exists');
    }
    
    return NextResponse.json({ 
      success: true, 
      results: results
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating competitions:', errorMessage);
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 });
  }
}