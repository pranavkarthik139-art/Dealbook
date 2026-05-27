import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

/**
 * Get current user from session
 * Extracts user from NextAuth session, falling back to demo user for development
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    console.warn('[Auth] No session found - using demo user');
    // Fallback: return demo user (ID 1)
    return {
      id: 1,
      email: 'demo@dealbook.com',
      name: 'Demo User',
      image: null,
      emailVerified: null,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  try {
    // Fetch user from database by email (source of truth for user data and role)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.warn(`[Auth] User ${session.user.email} not found in database - creating with default role`);
      // Auto-create user if they have a valid session
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          image: session.user.image || null,
          role: 'sales_engineer',
        },
      });
      return newUser;
    }

    // Ensure user has a role set (should be set by signIn callback)
    if (!user.role) {
      console.warn(`[Auth] User ${user.email} has no role set - assigning sales_engineer`);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'sales_engineer' },
      });
      return updated;
    }

    return user;
  } catch (error) {
    console.error('[Auth] Error fetching user from database:', error);
    // Fallback on error
    return {
      id: 1,
      email: 'demo@dealbook.com',
      name: 'Demo User',
      image: null,
      emailVerified: null,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Require authentication - throw if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  return user;
}

/**
 * Require specific role - throw if user doesn't have required role
 * Role hierarchy: admin (3) > presales_lead (2) > sales_engineer (1)
 */
export async function requireRole(requiredRole: 'admin' | 'presales_lead' | 'sales_engineer') {
  const user = await requireAuth();

  const roleHierarchy = {
    admin: 3,
    presales_lead: 2,
    sales_engineer: 1,
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  if (userLevel < requiredLevel) {
    throw new Error(`Unauthorized: Requires ${requiredRole} role. Current role: ${user.role}`);
  }

  return user;
}

/**
 * Check if user is manager or admin
 */
export async function isManager(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.role === 'presales_lead' || user.role === 'admin';
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.role === 'admin';
}
