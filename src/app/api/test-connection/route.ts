import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection without Prisma
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL environment variable is missing' 
      });
    }

    // Extract connection details for verification
    const url = new URL(connectionString);
    
    return NextResponse.json({ 
      success: true,
      connectionInfo: {
        host: url.hostname,
        port: url.port,
        database: url.pathname.substring(1),
        username: url.username,
        hasPassword: !!url.password,
        fullUrl: connectionString.replace(url.password, '***') // Hide password
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
