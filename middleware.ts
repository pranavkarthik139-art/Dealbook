import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/callback', '/'];
  const isPublic = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // If no token and not a public route, redirect to sign in
  if (!token && !isPublic && request.nextUrl.pathname.startsWith('/')) {
    // Redirect to signin page for app routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/deals') ||
        request.nextUrl.pathname.startsWith('/settings') ||
        request.nextUrl.pathname.startsWith('/team')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/deals/:path*',
    '/settings/:path*',
    '/team/:path*',
    '/api/:path*',
  ],
};
