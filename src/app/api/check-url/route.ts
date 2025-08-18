import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentUrl = process.env.DATABASE_URL;
    
    if (!currentUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL not found' 
      });
    }

    // Check if it's the old format that might not work
    const isOldFormat = currentUrl.includes('db.ibchkyfgejrqirvcwldj.supabase.co:5432');
    const isNewFormat = currentUrl.includes('pooler.supabase.com:6543');

    return NextResponse.json({ 
      success: true,
      analysis: {
        hasUrl: !!currentUrl,
        isOldFormat,
        isNewFormat,
        host: currentUrl.includes('supabase.co') ? 'Supabase' : 'Other',
        port: currentUrl.includes(':5432') ? '5432 (old)' : currentUrl.includes(':6543') ? '6543 (new)' : 'unknown',
        suggestion: isOldFormat ? 'Update to new Supabase connection format' : 'Connection string looks correct'
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
