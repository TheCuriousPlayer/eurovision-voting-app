import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { isAdmin } from './lib/auth';

// This middleware will run on protected routes
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    
    // Only apply protection to the eurovision2024 route
    if (pathname.startsWith('/eurovision2024')) {
      // Check if user is an admin
      if (!token?.email || !isAdmin(token.email)) {
        // If not an admin, redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Only protect eurovision2024 routes
export const config = {
  matcher: ['/eurovision2024/:path*'],
};
