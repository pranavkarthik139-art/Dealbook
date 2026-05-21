import NextAuth, { NextAuthOptions, type Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  // PrismaAdapter handles user creation + storage automatically
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async session({ session, user }: any): Promise<Session> {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || 'sales_engineer'; // Default role
      }
      return session;
    },
  },

  session: {
    strategy: 'database', // Use database sessions with PrismaAdapter
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
