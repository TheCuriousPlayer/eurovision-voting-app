import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test both public and private endpoints
    const publicResponse = await fetch('https://eurotr.vercel.app/api/votes/2023/public');
    const publicData = await publicResponse.json();

    return NextResponse.json({ 
      success: true,
      publicEndpoint: {
        status: publicResponse.status,
        data: publicData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
