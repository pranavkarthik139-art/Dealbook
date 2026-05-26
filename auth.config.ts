/**
 * Auth configuration re-export for NextAuth
 * This file provides a common import path for auth options used across the app
 */

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const authConfig = authOptions;
