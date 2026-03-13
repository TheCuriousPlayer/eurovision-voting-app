import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const { selectedYear } = await req.json();

    if (!selectedYear) {
      return NextResponse.json(
        { error: 'Year selection is required' },
        { status: 400 }
      );
    }

    // Save or update the user's survey response using Prisma upsert
    const surveyResponse = await prisma.survey_next_year.upsert({
      where: {
        user_email: session.user.email
      },
      update: {
        selected_year: selectedYear,
        updated_at: new Date()
      },
      create: {
        user_email: session.user.email,
        selected_year: selectedYear,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Survey response saved successfully'
    });

  } catch (error) {
    console.error('Error saving survey response:', error);
    return NextResponse.json(
      { error: 'Failed to save survey response' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    // Get user's current survey response
    const response = await prisma.survey_next_year.findUnique({
      where: {
        user_email: session.user.email
      },
      select: {
        selected_year: true
      }
    });

    if (response) {
      return NextResponse.json({
        selectedYear: response.selected_year
      });
    }

    return NextResponse.json({
      selectedYear: null
    });

  } catch (error) {
    console.error('Error fetching survey response:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey response' },
      { status: 500 }
    );
  }
}
