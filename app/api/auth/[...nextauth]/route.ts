import NextAuth, { NextAuthOptions, type Session, JWT } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Demo/test users - hardcoded for MVP
const DEMO_USERS = [
  { id: 'demo', email: 'demo@dealbook.com', password: 'demo123', name: 'Demo User', role: 'admin' },
  { id: 'admin', email: 'admin@dealbook.com', password: 'admin123', name: 'Admin User', role: 'admin' },
];

// Get auth secret - required for signing JWT tokens
const getAuthSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-32-characters-long';
  return secret;
};

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
            console.warn('Missing email or password');
            return null;
          }

          // Check against demo users (no database dependency)
          const user = DEMO_USERS.find(
            (u) => u.email === credentials.email && u.password === credentials.password
          );

          if (user) {
            console.log(`Auth successful for user: ${user.email}`);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            } as any;
          }

          console.warn(`Auth failed: no user found for ${credentials.email}`);
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
    async jwt({ token, user }) {
      // When user logs in, add user data to token
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          email: user.email,
          name: user.name,
        };
      }
      return token;
    },

    async session({ session, token }) {
      // Populate session from token
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: (token.role as string) || 'sales_engineer',
          email: token.email as string,
          name: token.name as string,
        },
      };
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: getAuthSecret(),
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
export const dynamic = 'force-dynamic';
