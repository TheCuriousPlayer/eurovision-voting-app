import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { VOTE_CONFIG } from '@/config/eurovisionvariables';

// Merkezi yapılandırma dosyasından yapılandırmayı al
const VotePages_variables = VOTE_CONFIG;

export async function GET(request: NextRequest) {
  // URL örneği: /api/config/vote-config?year=2022
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year');
  
  // Yıl parametre kontrol
  if (!year || !VotePages_variables[year as keyof typeof VotePages_variables]) {
    return NextResponse.json(
      { error: 'Invalid year parameter' },
      { status: 400 }
    );
  }
  
  const config = VotePages_variables[year as keyof typeof VotePages_variables];
  
  // Kullanıcı oturumunu kontrol et (GM mi?)
  const session = await getServerSession();
  const userEmail = session?.user?.email || '';
  const isGM = config.GMs ? config.GMs.split(',').map(email => email.trim()).includes(userEmail) : false;
  
  // Sadece client tarafı için gereken bilgileri gönder
  return NextResponse.json({
    status: config.Status,
    showCountDown: config.ShowCountDown,
    mode: config.Mode,
    isGM
  });
}
