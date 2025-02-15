// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const debugHeader = 'x-middleware-debug';
  const response = NextResponse.redirect(new URL('/home', request.url));
  response.headers.set(debugHeader, 'redirecting-to-home');
  return response;
}

export const config = {
  matcher: '/:path*',
};
