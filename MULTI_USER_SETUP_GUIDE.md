# Multi-User Authentication Setup Guide
**Status**: Implementation Ready  
**Architecture**: NextAuth + Prisma + PostgreSQL  
**Last Updated**: May 23, 2026

---

## 🚀 What's Already Implemented

✅ **Authentication System**
- NextAuth with Google OAuth2 provider
- Credentials provider for development/testing
- Prisma adapter for database-backed sessions
- JWT strategy with 30-day expiration
- User onboarding callback on first login

✅ **Server-Side Auth Utilities** (`lib/auth.ts`)
- `getCurrentUser()` - Get authenticated user
- `requireAuth()` - Enforce authentication
- `requireRole()` - Enforce role-based access
- `hasRole()` - Check user permissions
- `getUserPreferences()` - Fetch user settings
- `updateUserProfile()` - Update user data

✅ **Route Protection**
- Middleware with NextAuth protection
- Automatic redirect to `/auth/signin` for unauthorized users
- Security headers on protected routes

✅ **Real User Display**
- UserProfile component now uses session data
- Shows actual user name, email, and role
- Replaces hardcoded "Pranav" profile

---

## 📋 Setup Checklist

### Step 1: Google OAuth Configuration (Required for Production)

**1.1 Get Google OAuth Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google        (Development)
   https://yourdomain.com/api/auth/callback/google       (Production)
   https://yourapp.vercel.app/api/auth/callback/google   (Vercel)
   ```
7. Copy **Client ID** and **Client Secret**

**1.2 Add to Environment Variables**

Create `.env.local` (local development):
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-32-char-random-string>

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dealbook
DIRECT_URL=postgresql://user:password@localhost:5432/dealbook
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 2: Database Setup

**2.1 Ensure Prisma Migrations are Current**
```bash
npx prisma migrate dev
```

**2.2 Verify User Model** (already in schema)
```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  name      String?
  role      String  @default("sales_engineer")
  // ... other fields
}
```

**2.3 Add Row Level Security (Optional - For Team-Wide Scoping)**

If you want team-wide visibility, add organization support:

```bash
# 1. Create migration
npx prisma migrate dev --name add_organization_support

# 2. Add to schema.prisma:
model Organization {
  id        Int       @id @default(autoincrement())
  name      String
  slug      String    @unique
  ownerId   Int
  
  owner     User      @relation("organizationOwner", fields: [ownerId], references: [id])
  users     User[]    @relation("organizationMembers")
  deals     Deal[]
  
  @@index([ownerId])
}

# 3. Update User model to add organizationId
model User {
  // ... existing fields ...
  organizationId  Int?
  organization    Organization? @relation("organizationMembers", fields: [organizationId], references: [id])
  
  @@index([organizationId])
}

# 4. Update Deal model
model Deal {
  // ... existing fields ...
  organizationId  Int
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  @@index([organizationId])
}
```

### Step 3: Test Authentication Locally

**3.1 Start Development Server**
```bash
npm run dev
```

**3.2 Test Demo Login**
- Visit http://localhost:3000
- Should redirect to `/auth/signin`
- Login with demo credentials:
  - Email: `demo@dealbook.com`
  - Password: `demo123`
- Should see "Synced" indicator with user name in topbar

**3.3 Test Google OAuth**
- Click "Sign in with Google"
- Sign in with your Google account
- Should be redirected to `/dashboard`
- User profile should show your Google account name

**3.4 Verify Protected Routes**
- Open new private browser window (no session)
- Try to access `/deals` - should redirect to `/auth/signin`
- Try to access `/api/deals` - should return 401 if unauthenticated

### Step 4: Update API Routes to Use Authenticated User

**All existing API routes need to be updated to use the authenticated user instead of hardcoded `USER_ID = 1`.**

**Before (Old Pattern):**
```typescript
export async function GET() {
  const USER_ID = 1; // ❌ Hardcoded - everyone sees same data
  const deals = await prisma.deal.findMany({
    where: { userId: USER_ID }
  });
}
```

**After (New Pattern):**
```typescript
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const user = await requireAuth(); // ✅ Get authenticated user
  const deals = await prisma.deal.findMany({
    where: { userId: parseInt(user.id) }
  });
}
```

**Routes to Update** (22+ total):
- `/api/deals`
- `/api/deals/[id]`
- `/api/contacts`
- `/api/todos`
- `/api/activity`
- `/api/preferences`
- `/api/calendar/*`
- `/api/calls/*`
- `/api/email/*`
- `/api/automations`
- `/api/templates`
- All other user-specific endpoints

**Quick Migration Script:**
```bash
# Find all routes that need updating
grep -r "const USER_ID = 1" app/api/

# Update all at once (verify changes first!)
grep -l "const USER_ID = 1" app/api/**/*.ts | xargs sed -i 's/const USER_ID = 1;//'
```

### Step 5: Environment Variables for Vercel

**5.1 Set in Vercel Dashboard**
1. Go to https://vercel.com → Select project → Settings
2. Go to **Environment Variables**
3. Add:
   ```
   NEXTAUTH_URL=https://yourapp.vercel.app
   NEXTAUTH_SECRET=<same-as-local>
   GOOGLE_CLIENT_ID=<your-client-id>
   GOOGLE_CLIENT_SECRET=<your-client-secret>
   DATABASE_URL=<postgresql-connection>
   DIRECT_URL=<postgresql-direct-connection>
   ```
4. Click "Save and Deploy"

**5.2 Update Vercel Deployment**
```bash
vercel env pull  # Get env vars locally
vercel deploy    # Deploy with updated env vars
```

### Step 6: Role-Based Access Control

**6.1 Enforce Admin-Only Routes**

```typescript
import { requireRole } from '@/lib/auth';

export async function POST(request: Request) {
  // This will throw error if user is not admin or presales_lead
  const user = await requireRole('presales_lead');
  
  // Rest of implementation...
}
```

**6.2 Role Hierarchy**
```
Admin (3)
  ↓
Presales Lead (2)
  ↓
Sales Engineer (1)
```

Admins can do everything. Presales leads can manage their team. SEs can only see their own deals.

---

## 🧪 Testing Checklist

### Local Development Tests

- [ ] Demo login works (demo@dealbook.com / demo123)
- [ ] Google OAuth works (redirects back after auth)
- [ ] Unauthenticated access redirects to `/auth/signin`
- [ ] Session persists across page reloads
- [ ] User profile shows in topbar (real user data)
- [ ] Sign out clears session
- [ ] Protected API routes return 401 without auth token
- [ ] Authenticated API routes return data for current user only
- [ ] Create deal as User A → doesn't appear for User B

### Multi-User Tests

- [ ] Create 2 users (demo account + Google OAuth)
- [ ] User A creates 5 deals
- [ ] User B logs in → sees empty dashboard (User A's deals hidden)
- [ ] User A logs back in → sees their 5 deals
- [ ] Create contact under User A's deal → User B can't see it
- [ ] API enforces user isolation (API calls from User B return only their data)

### Production Tests (Vercel)

- [ ] Visit https://yourapp.vercel.app → redirects to signin
- [ ] Google OAuth works on Vercel
- [ ] Session persists across deploys
- [ ] Database connection works
- [ ] Environment variables are set correctly
- [ ] Security headers present (X-Frame-Options, CSP, etc.)

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use `.env.local` for development only
- ✅ Set all secrets in Vercel environment variables
- ✅ Regenerate NEXTAUTH_SECRET if compromised

### Database
- ✅ Use DIRECT_URL for migrations (faster)
- ✅ Use DATABASE_URL for app connections
- ✅ Enable SSL for production PostgreSQL
- ✅ Use strong passwords for DB user

### Sessions
- ✅ JWT tokens expire in 30 days
- ✅ Refresh tokens auto-renew expired sessions
- ✅ Secure cookies (httpOnly, secure, sameSite)
- ✅ CSRF protection on forms

### API Routes
- ✅ Always use `requireAuth()` for protected endpoints
- ✅ Filter results by `user.id` (never trust client)
- ✅ Validate all input with Zod or similar
- ✅ Return 401/403 for unauthorized access

---

## 📱 User Onboarding Flow

When a user signs in for the first time:

1. **Sign In Callback** (`signIn` callback in route.ts)
   - Check if user exists in database
   - If new user: create with default role ("sales_engineer")
   - Assign to organization (if using org model)

2. **Redirect to Onboarding** (optional)
   ```typescript
   // In signIn callback:
   if (isNewUser) {
     return '/onboarding/setup-profile';
   }
   return true; // Continue normal flow
   ```

3. **Profile Setup Page** (optional)
   - Let user choose role/team
   - Configure preferences
   - Connect integrations

Current implementation uses **auto-enrollment** (no manual setup needed).

---

## 🚀 Deployment Checklist

### Before Deploy to Production

- [ ] Google OAuth credentials are production URLs
- [ ] NEXTAUTH_SECRET is strong (32+ chars)
- [ ] DATABASE_URL points to production database
- [ ] All API routes updated to use `getCurrentUser()`
- [ ] Middleware is enabled (all routes protected)
- [ ] Tests pass locally
- [ ] Environment variables set in Vercel
- [ ] Git branch is up to date

### After Deploy to Production

- [ ] Visit production URL → redirects to signin
- [ ] Google OAuth works end-to-end
- [ ] Create account → appears in database
- [ ] Create deal → hidden from other users
- [ ] API endpoints enforce user isolation
- [ ] Monitor logs for errors

---

## 🐛 Troubleshooting

### "NEXTAUTH_SECRET is not configured"
**Solution**: Generate and set `NEXTAUTH_SECRET` in `.env.local` and Vercel env vars
```bash
openssl rand -base64 32
```

### "Google OAuth redirect_uri mismatch"
**Solution**: Add the exact redirect URL to Google Cloud Console
- Development: `http://localhost:3000/api/auth/callback/google`
- Vercel: `https://yourapp.vercel.app/api/auth/callback/google`

### "User session not found"
**Solution**: Check:
1. Session strategy is 'jwt' (not database)
2. NEXTAUTH_SECRET is set
3. Browser cookies enabled
4. Not using incognito/private mode (clears cookies)

### "API returns 401 even when logged in"
**Solution**: 
1. Check `requireAuth()` is called
2. Verify token is being sent with request
3. Check `getServerSession()` returns session in API route
4. Verify middleware isn't blocking the route

### "Role-based access not working"
**Solution**:
1. Check user role in database: `SELECT email, role FROM users;`
2. Verify role is passed in JWT token
3. Use `requireRole('admin')` not string comparison
4. Remember role hierarchy: admin (3) > presales_lead (2) > sales_engineer (1)

---

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Adapter for NextAuth](https://github.com/nextauthjs/next-auth/tree/main/packages/adapter-prisma)
- [Google OAuth Setup](https://console.cloud.google.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Implementation Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Google OAuth | ✅ Implemented | Configured in route.ts |
| Prisma Adapter | ✅ Implemented | Database-backed sessions |
| Server Auth Utils | ✅ Implemented | `lib/auth.ts` ready |
| Middleware | ✅ Enabled | Route protection active |
| User Display | ✅ Updated | Real session data shown |
| API Routes | ⏳ Pending | Need to update 22+ routes |
| RLS Policies | ❌ Optional | For team/org scoping |
| User Onboarding | ✅ Basic | Auto-enrollment implemented |

---

## 🎯 Next Steps

1. **Setup Google OAuth Credentials** (5 min)
   - Create OAuth app in Google Cloud Console
   - Add redirect URIs
   - Copy credentials to `.env.local`

2. **Update Environment Variables** (2 min)
   - Create `.env.local` with all required vars
   - Verify database connection
   - Generate NEXTAUTH_SECRET

3. **Test Local Authentication** (10 min)
   - Start dev server
   - Test demo login
   - Test Google OAuth
   - Test protected routes

4. **Update API Routes** (30-60 min)
   - Replace `const USER_ID = 1` with `const user = await requireAuth()`
   - Update 22+ routes across `/api/*`
   - Test each route with multiple users

5. **Deploy to Vercel** (10 min)
   - Set environment variables in Vercel dashboard
   - Deploy main branch
   - Test production endpoints

6. **Post-Deployment** (Ongoing)
   - Monitor error logs
   - Verify user isolation
   - Collect team feedback
   - Plan next features (organizations, role management, etc.)

---

**Questions or issues?** Check the troubleshooting section or review `lib/auth.ts` for implementation details.

*Last updated: May 23, 2026*
