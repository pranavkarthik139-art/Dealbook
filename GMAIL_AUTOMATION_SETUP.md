# Gmail Auto-Logging Setup Guide

## Overview

Hashwork automatically syncs Gmail emails and logs them as activities on deals. This guide covers both manual sync (button) and automated sync (cron job).

---

## Part 1: Manual Sync Button (Testing)

### How It Works

1. User clicks **"Sync Gmail"** button on dashboard
2. App makes request to `POST /api/email/sync`
3. Fetches unread emails from Gmail
4. Matches emails to deals by contact email (exact match)
5. Creates activity log entries for each matched email
6. Updates deal `lastActivityAt` to reset stall detection
7. Shows notification: "Synced 15 emails, logged 8 activities"

### Prerequisites

- User must authorize Gmail read access during login
- Gmail token stored in `UserPreference.gmailToken`
- Must have at least one Contact added to a deal

### Testing Manually

1. Go to Dashboard
2. Look for **"Sync Gmail"** button (top right, next to Timezone selector)
3. Click button
4. Wait for sync to complete
5. Check dashboard Activity Feed for new email activities
6. Check deal timeline to see emails logged

---

## Part 2: Automated Email Sync (Background Jobs)

### How It Works

Every 15 minutes (configurable), a cron job:
1. Calls `GET /api/cron/sync-emails` with secret header
2. For each user with Gmail connected:
   - Fetches their recent emails
   - Matches to deals
   - Logs activities
   - Updates `lastActivityAt`
3. Returns summary report

### Setup Instructions

Choose ONE of these options:

---

## Option A: Vercel Cron (If Deployed on Vercel)

**Best for:** Vercel deployments, no external dependencies

### Steps

1. **Create cron config file:**
   ```
   vercel.json (already created)
   ```

2. **File content:**
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/sync-emails",
         "schedule": "*/15 * * * *"
       }
     ]
   }
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

4. **Verify in Vercel Dashboard:**
   - Settings → Cron Jobs
   - Should show "Sync Emails" running every 15 minutes

---

## Option B: EasyCron.com (Free, External)

**Best for:** Any deployment, minimal setup

### Steps

1. **Go to https://www.easycron.com**

2. **Sign up** (free account)

3. **Create new cron job:**
   - **URL:** `https://yourdomain.com/api/cron/sync-emails`
   - **Request method:** GET
   - **HTTP Basic Auth:** (skip)
   - **HTTP Headers:** Add custom header:
     ```
     x-cron-secret: <your-CRON_SECRET-value>
     ```
   - **Cron expression:** `*/15 * * * *` (every 15 minutes)
   - **Timeout:** 300 seconds

4. **Click "Create"**

5. **Test:** Click "Run Now" to verify it works

---

## Option C: GitHub Actions (Free, Uses GitHub Runners)

**Best for:** Already using GitHub, serverless preference

### Steps

1. **Create workflow file:**
   ```
   .github/workflows/sync-emails.yml
   ```

2. **Content:**
   ```yaml
   name: Sync Emails
   on:
     schedule:
       - cron: '*/15 * * * *'
   
   jobs:
     sync:
       runs-on: ubuntu-latest
       steps:
         - name: Trigger email sync
           run: |
             curl -X GET https://yourdomain.com/api/cron/sync-emails \
               -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"
   ```

3. **Add secret:**
   - GitHub Repo → Settings → Secrets → New repository secret
   - Name: `CRON_SECRET`
   - Value: `<your-CRON_SECRET>`

4. **Commit and push**

---

## Option D: Self-Hosted Cron (Linux/Mac Server)

**Best for:** Full control, own infrastructure

### Steps

1. **Add to crontab:**
   ```bash
   crontab -e
   ```

2. **Add line:**
   ```bash
   */15 * * * * curl -X GET https://yourdomain.com/api/cron/sync-emails -H "x-cron-secret: YOUR_CRON_SECRET" > /tmp/email-sync.log 2>&1
   ```

3. **Save and exit**

---

## Environment Setup

### Required .env Variables

```bash
# Gmail OAuth (from Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID=xxx
GOOGLE_OAUTH_CLIENT_SECRET=xxx

# Cron Security
CRON_SECRET=your-super-secret-key-min-32-chars
```

### Generate CRON_SECRET

```bash
# macOS/Linux
openssl rand -base64 32

# Or use any strong random string
```

---

## Testing & Verification

### Manual Test

```bash
# Test the endpoint locally
curl -X GET http://localhost:3000/api/cron/sync-emails \
  -H "x-cron-secret: your-secret"

# Expected response (200 OK):
{
  "success": true,
  "message": "Synced emails for 1 users",
  "results": [
    {
      "userId": 1,
      "emailsProcessed": 15,
      "emailsMatched": 8,
      "activitiesLogged": 8
    }
  ]
}
```

### Check Logs

Monitor activity in:
- Dashboard Activity Feed
- Deal timelines (should show 📧 email_received activities)
- Database: `ActivityLog` table (filter by `action = 'email_received'`)

### Verify Last Sync Time

```sql
SELECT userId, lastGmailSyncAt FROM user_preferences;
```

---

## Troubleshooting

### Emails Not Syncing

1. **Check Gmail token exists:**
   ```sql
   SELECT gmailToken FROM user_preferences WHERE userId = 1;
   ```
   If NULL: User hasn't authorized Gmail

2. **Check contacts exist:**
   ```sql
   SELECT * FROM contacts WHERE userId = 1;
   ```
   If empty: Add contacts to deals first

3. **Check email matching:**
   - Emails only match if sender/recipient email matches a Contact email (exact)
   - No fuzzy matching on subject lines

4. **Check logs:**
   ```bash
   # View server logs for errors
   vercel logs # if on Vercel
   ```

### Cron Job Not Firing

- **Vercel:** Check Vercel Dashboard → Deployments → Cron Jobs
- **EasyCron:** Click "Run Now" to test; check execution logs
- **GitHub Actions:** Check Actions tab → Sync Emails workflow

### Token Expired

Gmail tokens auto-refresh via NextAuth. If manual refresh needed:
- User re-logs in
- Authorizes Gmail again
- New token stored

---

## Monitoring

### Metrics to Track

1. **Email sync success rate:**
   - Calls to `/api/cron/sync-emails`
   - Emails processed vs. matched vs. logged

2. **Activity growth:**
   - New `email_received` entries per day
   - Deal `lastActivityAt` updates

3. **User engagement:**
   - Deals with email activities
   - Stall detection accuracy

### Setup Monitoring (Optional)

Use service like:
- **Sentry:** Capture errors from cron jobs
- **Datadog:** Track cron execution times
- **New Relic:** Monitor background job performance

---

## Scaling Considerations

### Current Limits

- Handles 50 emails per sync per user
- Runs every 15 minutes (configurable)
- Supports unlimited users

### If Scaling Needed

1. **Increase email batch size:** Modify `fetchGmailEmails(limit: 50)` in `lib/gmail.ts`
2. **Reduce sync frequency:** Change cron from `*/15` to `*/30` (every 30 min)
3. **Add database indexing:** Create indexes on `activityLog.gmailId` for faster deduplication
4. **Queue-based processing:** Use Bull, RabbitMQ, or similar for large-scale syncing

---

## Next Steps

1. ✅ Set up cron via one method above
2. ✅ Test manual sync button on dashboard
3. ✅ Wait for first automated sync
4. ✅ Verify emails appear in deal timelines
5. ✅ Monitor dashboard Activity Feed for new activities

**Questions?** Check `/api/email/sync` and `/api/cron/sync-emails` endpoint logs.
