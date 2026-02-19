import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Admin emails loaded from environment variable
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? [];

interface YearConfig {
  Status: boolean;
  ShowCountDown: string;
  Mode: string; // 'visible' | 'hide' | 'gm-only'
  GMs: string;
}

interface ConfigState {
  [key: string]: YearConfig;
}

// Current configurations - this should be loaded from a database or file
// For demonstration purposes, we're using the same structure as middleware.ts
const VotePages_variables: ConfigState = {
  '2022': { Status: true, ShowCountDown: '00:00 27.09.2025', Mode: 'hide', GMs: process.env.GM_EMAILS_DEFAULT ?? '' },
  '2023': { Status: false, ShowCountDown: '', Mode: 'visible', GMs: '' },
  '2024': { Status: false, ShowCountDown: '', Mode: 'visible', GMs: '' },
  '2025': { Status: false, ShowCountDown: '', Mode: 'visible', GMs: '' },
  '2026': { Status: false, ShowCountDown: '', Mode: 'hide', GMs: '' }
};

export async function GET() {
  // Check if user is admin
  const session = await getServerSession();
  const userEmail = session?.user?.email || '';
  
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }
  
  // Return all configurations
  return NextResponse.json(VotePages_variables);
}

export async function POST(request: NextRequest) {
  // Check if user is admin
  const session = await getServerSession();
  const userEmail = session?.user?.email || '';
  
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }
  
  try {
    // Get updated configurations from request body
    const updatedConfig: ConfigState = await request.json();
    
    // Validate the updated configuration
    const years = ['2022', '2023', '2024', '2025', '2026'];
    const validModes = ['visible', 'hide', 'gm-only'];
    
    for (const year of years) {
      if (!updatedConfig[year]) {
        return NextResponse.json(
          { error: `Missing configuration for year ${year}` },
          { status: 400 }
        );
      }
      
      const yearConfig = updatedConfig[year];
      
      // Validate mode
      if (!validModes.includes(yearConfig.Mode)) {
        return NextResponse.json(
          { error: `Invalid Mode for year ${year}. Valid values are: ${validModes.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Validate date format if ShowCountDown is provided
      if (yearConfig.ShowCountDown && yearConfig.Status) {
        // Simple validation for date format "HH:MM DD.MM.YYYY"
        const dateRegex = /^\d{2}:\d{2} \d{2}\.\d{2}\.\d{4}$/;
        if (!dateRegex.test(yearConfig.ShowCountDown)) {
          return NextResponse.json(
            { error: `Invalid date format for year ${year}. Expected format: HH:MM DD.MM.YYYY` },
            { status: 400 }
          );
        }
      }
    }
    
    // For a real application, you would save this to a database or file
    // For demonstration purposes, we're just returning success
    
    // Update the configuration in memory
    Object.assign(VotePages_variables, updatedConfig);
    
    // Success response
    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: VotePages_variables
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
