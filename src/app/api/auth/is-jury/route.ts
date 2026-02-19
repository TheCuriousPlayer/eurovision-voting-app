import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ isJury: false });
  }
  const juryEmails = process.env.JURI_2020_FINAL_EMAILS?.split(',').map(e => e.trim()) ?? [];
  return NextResponse.json({ isJury: juryEmails.includes(session.user.email) });
}
