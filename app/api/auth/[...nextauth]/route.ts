import NextAuth, { NextAuthOptions, type Session, JWT } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

/**
 * Multi-User Authentication with NextAuth + Prisma Adapter
 *
 * Supports:
 * - Google OAuth (primary production method)
 * - Credentials provider (for development/testing)
 * - Database-backed sessions and user accounts
 * - User onboarding on first login
 * - Role-based access control (role field in User model)
 */

// Demo/test credentials (for local development)
const DEMO_USERS = [
  { email: 'demo@dealbook.com', password: 'demo123', name: 'Demo User', role: 'presales_lead' },
  { email: 'se@dealbook.com', password: 'se123', name: 'Sales Engineer', role: 'sales_engineer' },
];

const getAuthSecret = () => {
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn(
      '⚠️  NEXTAUTH_SECRET not set. Using fallback (insecure). Set NEXTAUTH_SECRET in .env.local'
    );
  }
  return process.env.NEXTAUTH_SECRET || 'fallback-secret-32-characters-long-minimum';
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // Google OAuth - Production auth method
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      // Request scopes for calendar and Gmail access
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),

    // Credentials for development/testing
    CredentialsProvider({
      id: 'credentials',
      name: 'Demo Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@dealbook.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('[Auth] Missing email or password');
          return null;
        }

        // Check demo credentials
        const demoUser = DEMO_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (!demoUser) {
          console.warn(`[Auth] Demo login failed for ${credentials.email}`);
          return null;
        }

        // Find or create user in database
        const user = await prisma.user.upsert({
          where: { email: demoUser.email },
          update: {},
          create: {
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            emailVerified: new Date(),
          },
        });

        console.log(`[Auth] Demo login success for ${user.email}`);
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    /**
     * Called whenever JWT is created or updated
     * Used to add custom claims (role, userId, etc.) to token
     */
    async jwt({ token, user, account }) {
      // On initial sign in, user object is populated
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // Store Google OAuth tokens for API access
      if (account?.provider === 'google' && account?.access_token) {
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token;
      }

      // Fetch user from database to get latest role/metadata
      if (token.email && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { accounts: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.image = dbUser.image;

          // Get Google access token from database if not in JWT
          if (!token.googleAccessToken && dbUser.accounts.length > 0) {
            const googleAccount = dbUser.accounts.find((a) => a.provider === 'google');
            if (googleAccount?.access_token) {
              token.googleAccessToken = googleAccount.access_token;
            }
          }
        }
      }

      return token;
    },

    /**
     * Called whenever session is accessed
     * Used to populate session object with user data from token
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // Include Google access token for API calls
        (session.user as any).googleAccessToken = token.googleAccessToken;
      }
      return session;
    },

    /**
     * Called on successful sign in
     * Used for user onboarding (e.g., assign to organization, set preferences)
     */
    async signIn({ user, account, profile }) {
      try {
        // User was just created by the adapter or already exists
        if (user && user.email) {
          // Ensure user has required fields set
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (dbUser && !dbUser.role) {
            // Set default role on first login
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: 'sales_engineer' }, // Default role for new users
            });

            console.log(`[Auth] New user onboarded: ${user.email} (ID: ${dbUser.id})`);
          }

          // TODO: Add organization assignment logic here if needed
          // const organization = await assignUserToOrganization(user.email);
        }

        return true;
      } catch (error) {
        console.error('[Auth] Sign in callback error:', error);
        return false;
      }
    },

    /**
     * Called when user is redirected after sign in
     * Used to enforce onboarding flow or redirect to appropriate page
     */
    async redirect({ url, baseUrl }) {
      // Redirect to /dashboard after login if path is /auth/signin
      if (url.includes('/auth/signin')) {
        return `${baseUrl}/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  jwt: {
    secret: getAuthSecret(),
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: getAuthSecret(),

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
export const dynamic = 'force-dynamic';
