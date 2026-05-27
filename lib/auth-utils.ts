import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

/**
 * Get current user from session
 * Returns the authenticated user or null
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    // Fetch user from database by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    return user;
  } catch (error) {
    console.error('[Auth] Error in getCurrentUser:', error);
    return null;
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
