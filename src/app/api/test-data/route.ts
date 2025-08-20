import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to disconnect and reconnect to reset the connection
    await prisma.$disconnect();
    await prisma.$connect();

    // Try a simple query first
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    
    // If that works, try to get actual data
    const competitions = await prisma.$queryRaw`SELECT * FROM competitions`;
    const cumulativeResults = await prisma.$queryRaw`SELECT * FROM cumulative_results`;
    const votesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM votes`;
    
    return NextResponse.json({
      testQuery,
      competitions,
      cumulativeResults,
      votesCount,
      message: 'Successfully connected and queried database'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Try to provide more specific error information
    let errorMessage = 'Unknown database error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: 'Database connection or query failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    // Ensure we disconnect to clean up
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting:', disconnectError);
    }
  }
}
