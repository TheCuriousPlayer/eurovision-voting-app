import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isGM } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ isGM: false });
  }

  const isGMUser = isGM(session.user.email);
  return NextResponse.json({ isGM: isGMUser });
}
