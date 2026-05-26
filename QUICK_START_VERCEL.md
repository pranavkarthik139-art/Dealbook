# 🚀 Dealbook → Vercel in 5 Minutes

## Pre-Flight Check
```bash
# 1. Verify local setup
npm install
npm run seed
npm run dev

# 2. Visit http://localhost:3000
# 3. Click "✨ Try Demo" (should login as demo@dealbook.com)
# 4. Verify first name shows in greeting
# 5. Check any deal shows AI insights in timeline
```

If all above work ✅, proceed to Vercel.

---

## Vercel Deployment (2 Options)

### Option A: GitHub Push (Recommended - 2 minutes)
```bash
# 1. Commit changes
git add .
git commit -m "EOD: Personalization, demo account, Claude insights"
git push origin main

# 2. Go to Vercel Dashboard
# 3. Click "New Project"
# 4. Select GitHub repository (hashwork)
# 5. Click "Import"
# 6. Vercel auto-detects Next.js ✓
# 7. Go to Settings → Environment Variables
# 8. Add variables (see below)
# 9. Click "Deploy"
```

### Option B: Vercel CLI (1 minute)
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts
# Vercel will ask to add environment variables during deploy
```

---

## Required Environment Variables

Copy these into Vercel dashboard (Settings → Environment Variables):

```
DATABASE_URL="<your-supabase-connection-pooling-url>"

DIRECT_URL="<your-supabase-direct-url>"

NEXTAUTH_URL="https://YOUR_VERCEL_DOMAIN.vercel.app"

NEXTAUTH_SECRET="<generate-new-32-char-secret>"

GOOGLE_OAUTH_CLIENT_ID="<your-google-oauth-client-id>"

GOOGLE_OAUTH_CLIENT_SECRET="<your-google-oauth-client-secret>"

GOOGLE_PROJECT_ID="<your-google-project-id>"

GOOGLE_SERVICE_ACCOUNT_EMAIL="<your-service-account-email>"

GOOGLE_PRIVATE_KEY="<your-google-private-key>"

APOLLO_API_KEY="<your-apollo-api-key>"

CRON_SECRET="<generate-new-32-char-secret>"

ANTHROPIC_API_KEY="sk-ant-<your-anthropic-api-key>"
```

**To generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Post-Deploy Checklist

✅ **Vercel Build Complete** (~5 min)
- Check build logs (no errors)
- Get production URL: `https://yourapp.vercel.app`

✅ **Update NEXTAUTH_URL** (if auto-detected incorrectly)
- Vercel Settings → Environment Variables
- Update `NEXTAUTH_URL` to match Vercel domain

✅ **Test Live Site**
- Visit: `https://yourapp.vercel.app`
- Click "✨ Try Demo"
- Should see demo account login instantly
- Dashboard should show your first name in greeting

✅ **Check Logs** (if issues)
- Vercel Dashboard → Deployments → Click build
- Look for errors in logs
- Most common: DATABASE_URL incorrect or NEXTAUTH_SECRET missing

---

## Share with Testers (Copy-Paste)

```
🎉 Join our beta! 

Try the demo instantly (no signup needed):
→ https://yourapp.vercel.app
→ Click "✨ Try Demo"
→ Email: demo@dealbook.com
→ Password: demo123

You'll see:
- 8 realistic deals ($988K pipeline)
- 17 stakeholders with roles
- AI-powered call insights
- All auto-synced activity

Give us feedback!
```

---

## Troubleshooting

**Deploy failed?**
- Check DATABASE_URL is correct (port 6543 for pooling, not 5432)
- Check NEXTAUTH_SECRET is 32+ characters
- Check all quotes and line breaks in secrets

**Login stuck?**
- Clear browser cookies (Settings → Cookies → Delete)
- Try in incognito/private window
- Check NextAuth logs: `Vercel Deployment → Logs → Function Logs`

**No insights showing?**
- ANTHROPIC_API_KEY optional (works without it)
- If key missing, insights show empty state
- Add key later to generate insights

**Demo account not working?**
- Check credentials: demo@dealbook.com / demo123
- Try signing out (top-right menu) and back in
- Clear cookies and retry

---

## Summary

| Step | Time | Status |
|------|------|--------|
| Local verification | 2 min | ✅ |
| Git push | <1 min | ✅ |
| Vercel auto-import | <1 min | ✅ |
| Add env vars | 2 min | ✅ |
| Deploy | 5 min | ✅ |
| **TOTAL** | **~10 min** | **✅ LIVE** |

**Result:** Live at `https://yourapp.vercel.app` with:
- ✨ Personalized greeting
- 🎯 Demo account with 8 deals
- 🤖 Claude AI call insights
- 👥 17 real stakeholders
- 📊 Fully functional dashboard
- 🚀 Production-ready code

---

**You're done! 🎊**

Next: Share link with early testers and gather feedback.

*Questions? Check DEPLOYMENT_CHECKLIST.md for more details.*
