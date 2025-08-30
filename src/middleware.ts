import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// This middleware will run on protected routes
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Only protect eurovision1955 routes
export const config = {
  matcher: ['/eurovision1955/:path*'],
};
