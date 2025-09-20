import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';
import { UNDER_CONSTRUCTION, VOTE_CONFIG } from '@/config/eurovisionvariables';

// Oylama sayfaları için yapılandırmayı merkezi config dosyasından al
const VotePages_variables = VOTE_CONFIG;

// Check if the request is from our own application
function isRequestFromOurApp(request: NextRequest): boolean {
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // Geçerli kendi alan adınızı burada belirtin
  const allowedHosts = new Set([host]);
  
  // Check if referer or origin is from our site
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowedHosts.has(refererUrl.host)) {
        return true;
      }
    } catch {
      // URL parse hatası; geçersiz bir URL
    }
  }
  
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (allowedHosts.has(originUrl.host)) {
        return true;
      }
    } catch {
      // URL parse hatası; geçersiz bir URL
    }
  }
  
  return false;
}

  // API koruma middleware
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const now = new Date();
  
  // Debug için bilgileri yazdır
  console.log(`[Middleware] Path: ${path}, Date: ${now.toISOString()}`);
  console.log(`[Middleware] Processing request for path: ${path}`);
  
  // Log the matcher check for root Eurovision paths
  if (path === '/eurovision2022' || path === '/eurovision2023' || path === '/eurovision2024') {
    console.log(`[Middleware] EXACT MATCH for Eurovision year path: ${path}`);
  }
  
  // vote-config API için yıl parametresini ekle (middleware'den geçirerek)
  if (path === '/api/config/vote-config') {
    const url = request.nextUrl.clone();
    const searchParams = url.searchParams;
    const year = searchParams.get('year');
    
    // Yıl bilgisi kontrolü
    if (year && VotePages_variables[year as keyof typeof VotePages_variables]) {
      // İşlem devam edebilir, koruma kontrolü sonraki adımlarda
      return;
    }
  }  // Under Construction kontrolü
  // Bakım modundaki Eurovision yıllarını kontrol et
  const yearMatch = path.match(/\/eurovision(20\d{2})/);
  if (yearMatch) {
    const year = yearMatch[1];
    
    // Eğer bu yıl bakım modundaysa, bakım sayfasına yönlendir
    if (UNDER_CONSTRUCTION[year as keyof typeof UNDER_CONSTRUCTION]) {
      return NextResponse.rewrite(
        new URL(`/eurovision${year}/under-construction`, request.url)
      );
    }
    
    // Ana sayfa ve oylama sayfası kontrolü
    // Ana sayfa (/eurovision2022) veya oylama sayfaları (/eurovision2022/vote) için geçerli
    const isMainPage = path === `/eurovision${year}`;
    const isVotingPage = path.includes('/vote') || path.includes('/voting');
    
    if (isMainPage || isVotingPage) {
      console.log(`[Middleware] Checking path: ${path}, isMainPage: ${isMainPage}, isVotingPage: ${isVotingPage}`);
      
      const voteConfig = VotePages_variables[year as keyof typeof VotePages_variables];
      
      // Eğer oylama aktif ve bir countdown tarihi tanımlanmışsa, kontrol et
      if (voteConfig && voteConfig.Status === true && voteConfig.ShowCountDown) {
        // Hedef tarih henüz gelmemiş mi kontrol et
        const now = new Date();
        
        // "HH:MM DD.MM.YYYY" formatını parse et
        try {
          console.log(`[Middleware] Checking date for ${year}. Config date: ${voteConfig.ShowCountDown}`);
          
          const [timeStr, dateStr] = voteConfig.ShowCountDown.split(' ');
          if (!timeStr || !dateStr) {
            throw new Error(`Invalid date format: ${voteConfig.ShowCountDown}. Expected format: "HH:MM DD.MM.YYYY"`);
          }
          
          const [hours, minutes] = timeStr.split(':').map(Number);
          const [day, month, yearNum] = dateStr.split('.').map(Number);
          
          if (isNaN(hours) || isNaN(minutes) || isNaN(day) || isNaN(month) || isNaN(yearNum)) {
            throw new Error(`Invalid date components in: ${voteConfig.ShowCountDown}`);
          }
          
          // Hedef tarih - dikkat month 0 tabanlı
          const targetDate = new Date(yearNum, month - 1, day, hours, minutes);
          
          // Debug için tarihleri logla
          console.log(`[Middleware] Current date: ${now.toISOString()} (${now.getTime()})`);
          console.log(`[Middleware] Target date: ${targetDate.toISOString()} (${targetDate.getTime()})`);
          
          // Milisaniye cinsinden karşılaştır
          const nowMs = now.getTime();
          const targetMs = targetDate.getTime();
          const isBeforeTarget = nowMs < targetMs;
          
          console.log(`[Middleware] Date comparison: ${nowMs} < ${targetMs} = ${isBeforeTarget}`);
          
          // Eğer hedef tarih henüz gelmediyse, countdown sayfasına yönlendir
          if (isBeforeTarget) {
            console.log(`[Middleware] REDIRECTING to countdown page for ${year}`);
            return NextResponse.rewrite(
              new URL(`/eurovision${year}/countdown`, request.url)
            );
          } else {
            console.log(`[Middleware] NOT redirecting to countdown - target date has passed`);
          }
        } catch (error) {
          console.error(`[Middleware] Tarih parse hatası (${year}):`, error);
        }
      }
    }
  }
  
  // Protect API endpoints
  if ((path.includes('/api/votes/') && 
      (path.includes('/simple') || path.includes('/public'))) ||
      path.includes('/api/config/vote-config')) {
    
    // İsteğin kendi uygulamanızdan gelip gelmediğini kontrol edin
    if (!isRequestFromOurApp(request)) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized access' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
  
  // Admin ve Eurovision1955 sayfaları için auth koruması
  if (path.startsWith('/eurovision1955') || path.startsWith('/admin')) {
    // withAuth fonksiyonu ile işleme devam et
    return withAuth(
      () => NextResponse.next(), 
      {
        callbacks: {
          authorized: ({ token }) => !!token
        }
      }
    )(request);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/eurovision1955/:path*',
    '/api/votes/:year/simple/:path*',
    '/api/votes/:year/public/:path*',
    '/api/config/vote-config',
    '/api/admin/config',
    '/admin',
    '/admin/:path*',
    '/debug',
    '/debug/:path*',
    '/eurovision2022',       // Add exact root path for Eurovision 2022
    '/eurovision2023',       // Add exact root path for Eurovision 2023
    '/eurovision2024',       // Add exact root path for Eurovision 2024
    '/eurovision2022/:path*',
    '/eurovision2023/:path*', 
    '/eurovision2024/:path*',
    '/eurovision2022/vote/:path*',
    '/eurovision2022/voting/:path*',
    '/eurovision2023/vote/:path*',
    '/eurovision2023/voting/:path*',
    '/eurovision2024/vote/:path*',
    '/eurovision2024/voting/:path*'
  ],
};
