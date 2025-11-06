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
  
  // Development mode - allow localhost and development hosts
  const isDevelopment = process.env.NODE_ENV === 'development' || host?.includes('localhost') || host?.includes('127.0.0.1');
  if (isDevelopment) {
    return true;
  }
  
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
  if (path === '/eurovision2020' || path === '/eurovision2022' || path === '/eurovision2023' || path === '/eurovision2024' || path === '/eurovision2025' || path === '/eurovision2026') {
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
    
    // Reveal sayfalarını kontrol et - reveal sayfaları bakım modundan etkilenmez
    const isRevealPage = path.includes('-reveal');
    if (isRevealPage) {
      // Reveal sayfaları için bakım modu kontrolü yapma
      console.log(`[Middleware] Skipping UNDER_CONSTRUCTION check for reveal page: ${path}`);
    } else {
      // Semi-final sayfalarını kontrol et
      const isSemiFinalA = path.includes('/semi-final-a');
      const isSemiFinalB = path.includes('/semi-final-b');
      const isFinal = path.includes('/final');
      const isFinalPlayer = path.includes('/final-player');
      
      // Exclude final-player from under-construction check
      if (isFinalPlayer) {
        console.log(`[Middleware] Skipping UNDER_CONSTRUCTION check for final-player: ${path}`);
        return NextResponse.next();
      }
      
      // Eurovision 2020 özel durumu - year code mapping
      if (year === '2020') {
        if (isSemiFinalA) {
          // Semi-Final A için 202001 year code'unu kontrol et
          if (UNDER_CONSTRUCTION['202001']) {
            return NextResponse.rewrite(
              new URL(`/eurovision2020/semi-final-a/under-construction`, request.url)
            );
          }
        } else if (isSemiFinalB) {
          // Semi-Final B için 202002 year code'unu kontrol et
          if (UNDER_CONSTRUCTION['202002']) {
            return NextResponse.rewrite(
              new URL(`/eurovision2020/semi-final-b/under-construction`, request.url)
            );
          }
        } else if (isFinal) {
          // Final için 202003 year code'unu kontrol et
          if (UNDER_CONSTRUCTION['202003']) {
            return NextResponse.rewrite(
              new URL(`/eurovision2020/final/under-construction`, request.url)
            );
          }
        } else {
          // Ana Eurovision 2020 sayfası için 202000 year code'unu kontrol et
          if (UNDER_CONSTRUCTION['202000']) {
            return NextResponse.rewrite(
              new URL(`/eurovision2020/under-construction`, request.url)
            );
          }
        }
      } else {
        // Diğer yıllar için normal bakım modu kontrolü
        const isSemiFinalPage = isSemiFinalA || isSemiFinalB;
        
        // Eğer bu yıl bakım modundaysa VE semi-final sayfası değilse, bakım sayfasına yönlendir
        if (UNDER_CONSTRUCTION[year as keyof typeof UNDER_CONSTRUCTION] && !isSemiFinalPage) {
          return NextResponse.rewrite(
            new URL(`/eurovision${year}/under-construction`, request.url)
          );
        }
      }
    }
    
    // Ana sayfa ve oylama sayfası kontrolü
    // Ana sayfa (/eurovision202x) veya oylama sayfaları (/eurovision202x/vote) için geçerli
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
    // next-auth withAuth expects (request, options)
    // Use a type-cast here to avoid TypeScript mismatch with NextRequestWithAuth
    // The runtime call remains the same; this just satisfies the compiler.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (withAuth as any)(request as any, {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorized: ({ token }: any) => !!token
      }
    });
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
    '/eurovision2020',       // Add exact root path for Eurovision 2020
    '/eurovision2022',       // Add exact root path for Eurovision 2022
    '/eurovision2023',       // Add exact root path for Eurovision 2023
    '/eurovision2024',       // Add exact root path for Eurovision 2024
    '/eurovision2025',       // Add exact root path for Eurovision 2025
    '/eurovision2026',       // Add exact root path for Eurovision 2026
    '/eurovision2020/:path*', 
    '/eurovision2023/:path*', 
    '/eurovision2024/:path*',
    '/eurovision2025/:path*',
    '/eurovision2026/:path*',
    '/eurovision2020/vote/:path*',
    '/eurovision2020/voting/:path*',
    '/eurovision2022/vote/:path*',
    '/eurovision2022/voting/:path*',
    '/eurovision2023/vote/:path*',
    '/eurovision2023/voting/:path*',
    '/eurovision2024/vote/:path*',
    '/eurovision2024/voting/:path*',
    '/eurovision2025/vote/:path*',
    '/eurovision2025/voting/:path*',
    '/eurovision2026/vote/:path*',
    '/eurovision2026/voting/:path*'
  ],
};
