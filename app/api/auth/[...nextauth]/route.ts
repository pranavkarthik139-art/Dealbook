import NextAuth, { NextAuthOptions, type Session, JWT } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Demo/test users - hardcoded for MVP
const DEMO_USERS = [
  { id: 'demo', email: 'demo@dealbook.com', password: 'demo123', name: 'Demo User', role: 'admin' },
  { id: 'admin', email: 'admin@dealbook.com', password: 'admin123', name: 'Admin User', role: 'admin' },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@dealbook.com' },
        password: { label: 'Password', type: 'password', placeholder: 'demo123' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Check against demo users (no database dependency)
          const user = DEMO_USERS.find(
            (u) => u.email === credentials.email && u.password === credentials.password
          );

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'sales_engineer';
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'sales_engineer';
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt', // Use JWT instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
