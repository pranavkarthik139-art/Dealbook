/**
 * Server-side authentication utilities
 * Use these functions in API routes and server components to access current user
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

/**
 * Get current authenticated user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    // Fetch fresh user data from database to ensure role/data is current
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      console.warn(`[Auth] User session found but no database record: ${session.user.email}`);
      return null;
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };
  } catch (error) {
    console.error('[Auth] Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Require authentication - throw error if user not found
 * Use in API routes to ensure user is authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  return user;
}

/**
 * Require specific role - throw error if user doesn't have required role
 * Usage: await requireRole('presales_lead'); // Will throw if user is not presales_lead or admin
 */
export async function requireRole(
  requiredRole: 'admin' | 'presales_lead' | 'sales_engineer'
): Promise<AuthUser> {
  const user = await requireAuth();

  const roleHierarchy: Record<string, number> = {
    admin: 3,
    presales_lead: 2,
    sales_engineer: 1,
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  if (userLevel < requiredLevel) {
    throw new Error(`Forbidden: Requires ${requiredRole} role or higher`);
  }

  return user;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasRole(roles: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? roles.includes(user.role) : false;
}

/**
 * Ensure user data exists in database
 * Called after OAuth sign-in to create user profile if needed
 */
export async function ensureUserExists(email: string, name?: string): Promise<void> {
  await prisma.user.upsert({
    where: { email },
    update: { name: name || undefined },
    create: {
      email,
      name: name || email.split('@')[0],
      role: 'sales_engineer', // Default role for new users
      emailVerified: new Date(),
    },
  });
}

/**
 * Get user's preferences (timezone, integrations, etc.)
 */
export async function getUserPreferences() {
  const user = await requireAuth();

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: parseInt(user.id) },
  });

  if (!preferences) {
    // Create default preferences
    return await prisma.userPreference.create({
      data: {
        userId: parseInt(user.id),
        timezonePrimary: 'UTC',
      },
    });
  }

  return preferences;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  updates: { name?: string; image?: string; role?: string }
): Promise<AuthUser> {
  const user = await requireAuth();

  const updated = await prisma.user.update({
    where: { id: parseInt(user.id) },
    data: {
      name: updates.name || undefined,
      image: updates.image || undefined,
      role: updates.role || undefined,
    },
  });

  return {
    id: updated.id.toString(),
    email: updated.email,
    name: updated.name,
    role: updated.role,
    image: updated.image,
  };
}
