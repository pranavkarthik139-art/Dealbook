# Google OAuth Setup for Dealbook

Complete this guide to get Google OAuth working for Dealbook.

## Part 1: Create Google Cloud Project

1. **Open browser** → go to https://console.cloud.google.com
2. **Sign in** with your Google account
3. **Create project:**
   - At the top, click the project dropdown (currently shows "Select a Project")
   - Click **"NEW PROJECT"** button (blue button at top right)
   - Project name: `Dealbook`
   - Click **CREATE**
   - Wait for the project to be created (30 seconds)

## Part 2: Enable Google+ API

1. In Google Cloud Console, at the top search bar, search: `google+ api`
2. Click **"Google+ API"** from results
3. Click **ENABLE** button (blue button on the page)
4. Wait 10-20 seconds for it to enable

## Part 3: Create OAuth Consent Screen

1. Left sidebar → Click **APIs & Services**
2. Click **OAuth consent screen**
3. **User Type:** Select **External** → Click **CREATE**
4. **Fill out the form:**
   - App name: `Dealbook`
   - User support email: (your email)
   - Developer contact info:
     - Email: (your email)
   - Click **SAVE AND CONTINUE**
5. **Scopes page:** Click **SAVE AND CONTINUE** (skip scopes, we don't need them)
6. **Test users page:** Click **SAVE AND CONTINUE** (skip this too)
7. **Summary page:** You're done with consent screen! Click **BACK TO DASHBOARD**

## Part 4: Create OAuth Credentials

1. Left sidebar → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** button (blue button at top)
3. Select **OAuth client ID**
4. **Application type:** Select **Web application**
5. **Name:** `Dealbook Local & Production`
6. **Authorized JavaScript origins** - Add these two URLs:
   - `http://localhost:3000`
   - `https://dealbook.vercel.app` (we'll deploy here later)
   - Click **ADD URI** after each one
7. **Authorized redirect URIs** - Add these two:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://dealbook.vercel.app/api/auth/callback/google`
   - Click **ADD URI** after each one
8. Click **CREATE**

## Part 5: Copy Your Credentials

A popup will show your **Client ID** and **Client Secret**:
- **Client ID:** Copy this
- **Client Secret:** Copy this (keep it secret!)
- Click **OK** when done

## Part 6: Update Your Local Environment

Open `C:\Users\prana\OneDrive\Desktop\Hashwork\.env.local` and replace:

```
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

With the actual values from step Part 5. Example:

```
GOOGLE_OAUTH_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-1234567890abcdefghijk
```

## Part 7: Test Locally

1. **Restart dev server:**
   - Press Ctrl+C in PowerShell (stop npm run dev)
   - Run: `npm run dev`
   
2. **Open incognito window** → `http://localhost:3000`

3. **Click "Sign In"** button

4. **You should see NextAuth signin page with:**
   - "Sign in with Google" button (red button)
   - "Demo Credentials" option

5. **Click "Sign in with Google"**

6. **You'll be redirected to Google login** - Sign in with any Google account

7. **After sign in, you should be redirected to `/dashboard`**

✅ If you see the dashboard, Google OAuth works!

## Part 8: For Vercel Deployment (Later)

When you deploy to Vercel, add these environment variables in Vercel project settings:

```
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET
NEXTAUTH_URL=https://dealbook.vercel.app
NEXTAUTH_SECRET=Aa7dbViL1846gbXGNToZh0cgZU8LRxLD08qjEBpju7s=
DATABASE_URL=postgresql://postgres.ccwoyvgecicfhdxboabd:R6HJga0DZNoDs8t4@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.ccwoyvgecicfhdxboabd:R6HJga0DZNoDs8t4@aws-1-ap-northeast-1.supabase.co:5432/postgres
```

---

## What Happens After Sign In

When a user signs in with Google **for the first time**:

1. ✅ User record is **automatically created** in database (via PrismaAdapter)
2. ✅ User is assigned default role: `sales_engineer`
3. ✅ User is redirected to `/dashboard`
4. ✅ User data is stored in JWT session (expires in 30 days)

On **second and later logins**:
- User data is fetched from database
- No new user record is created
- User role and permissions are applied

---

## Troubleshooting

**Q: "Google OAuth button doesn't appear"**
- A: Make sure you restarted `npm run dev` after updating `.env.local`
- Browser will cache old environment - try clearing browser cache or use incognito

**Q: "Redirect URI mismatch error"**
- A: Make sure the redirect URIs in Google Cloud Console exactly match:
  - `http://localhost:3000/api/auth/callback/google` (with `http://` not `https://`)
  - `https://dealbook.vercel.app/api/auth/callback/google` (with `https://`)

**Q: "Sign in works but user not created in database"**
- A: Check that `DATABASE_URL` is set in `.env.local` and Supabase is accessible
- Run: `npx prisma studio` to check if users are in database

**Q: "Getting error about 'consent_required'"**
- A: Your Google Cloud Console setup is incomplete. Make sure you completed Part 3 (OAuth Consent Screen)

---

## Done! ✅

Once you complete Part 7 and see the dashboard after Google sign-in, you're all set!

Next steps:
1. Test with multiple Google accounts to verify user provisioning
2. Deploy to Vercel
3. Test authentication on production
