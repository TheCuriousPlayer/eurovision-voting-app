import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ isAdmin: false });
  }
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? [];
  return NextResponse.json({ isAdmin: adminEmails.includes(session.user.email) });
}
