/**
 * NextAuth Middleware - Protects routes and redirects unauthenticated users
 *
 * Flow:
 * 1. User accesses protected route (e.g., /dashboard, /deals)
 * 2. Middleware checks if user has valid NextAuth session token
 * 3. If no session: redirect to /auth/signin
 * 4. If session exists: allow access to protected route
 *
 * Public routes (no auth required):
 * - /auth/* (login pages)
 * - / (landing page)
 * - /api/auth/* (NextAuth endpoints)
 */

import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = withAuth(
  function middleware(request: NextRequest & { nextauth: any }) {
    // This function is only called if auth is successful
    // withAuth will redirect to signin if no session exists

    const pathname = request.nextUrl.pathname;

    // Add security headers for authenticated routes
    const response = NextResponse.next();

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Enable XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
    );

    return response;
  },
  {
    callbacks: {
      authorized({ token }) {
        // This is called by `withAuth` to determine if the token is valid
        // It should return a boolean or undefined
        return !!token; // Return true if token exists, false otherwise
      },
    },
  }
);

// Protected routes - these require authentication
// Public routes are implicitly everything not listed here
// Note: /api/links/public/:path* is NOT protected - it's publicly accessible via token
export const config = {
  matcher: [
    // Protect all dashboard and app routes
    '/dashboard/:path*',
    '/deals/:path*',
    '/links/:path*',
    '/automations/:path*',
    '/settings/:path*',
    '/team/:path*',
    '/forecasting/:path*',
    '/templates/:path*',
    '/forecast:path*',
    // Protect all API routes except auth and public links
    '/api/activity/:path*',
    '/api/automations/:path*',
    '/api/calls/:path*',
    '/api/calendar/:path*',
    '/api/contacts/:path*',
    '/api/deals/:path*',
    '/api/email/:path*',
    '/api/emails/:path*',
    '/api/forecasting/:path*',
    // For links API: protect /api/links/* but NOT /api/links/public/*
    // This is handled by the route matcher with negative lookahead
    '/api/links/:path((?!public).*)',
    '/api/preferences/:path*',
    '/api/reports/:path*',
    '/api/sharing/:path*',
    '/api/templates/:path*',
    '/api/todos/:path*',
  ],
};
