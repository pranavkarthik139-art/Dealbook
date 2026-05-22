import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

/**
 * Get current user from session
 * For MVP: returns default demo user if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    // MVP: Return default demo user instead of null
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
    // Find or create user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // User session exists but not in DB (first-time login fallback)
      // Create user with default role
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image,
          emailVerified: session.user.emailVerified,
          role: 'sales_engineer', // Default role
        },
      });
      return newUser;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    // MVP: Return default demo user on error instead of null
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
