import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/api/auth'];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If no token and not a public route, redirect to signin
  if (!token && !isPublicRoute) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected API routes
    '/api/deals/:path*',
    '/api/contacts/:path*',
    '/api/todos/:path*',
    '/api/calls/:path*',
    '/api/activity/:path*',
    '/api/preferences/:path*',
    '/api/automations/:path*',
    '/api/templates/:path*',
    '/api/sharing/:path*',
    '/api/forecasting/:path*',
    '/api/reports/:path*',
    '/api/calendar/:path*',
    '/api/email/:path*',
    '/api/emails/:path*',
    '/api/cron/:path*',
    // Protected frontend routes
    '/deals/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    '/team/:path*',
    '/forecasting/:path*',
  ],
};
