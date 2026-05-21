import NextAuth, { NextAuthOptions, type Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

// Demo credentials
const DEMO_USER = {
  email: 'demo@dealbook.com',
  password: 'demo123',
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check demo account
        if (
          credentials.email === DEMO_USER.email &&
          credentials.password === DEMO_USER.password
        ) {
          // Get or create demo user
          let user = await prisma.user.findUnique({
            where: { email: DEMO_USER.email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: DEMO_USER.email,
                name: 'Demo User',
                role: 'admin',
              },
            });
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // For basic MVP, also check for any user in database
        // In production, you'd want proper password hashing (bcrypt)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user) {
          // For MVP: simple password check (in production use bcrypt)
          // Store passwords hashed in real implementation
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async session({ session, user }: any): Promise<Session> {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || 'sales_engineer';
      }
      return session;
    },
  },

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
