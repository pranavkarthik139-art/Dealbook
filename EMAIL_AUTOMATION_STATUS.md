# Gmail Email Automation - Complete Status

## ✅ Infrastructure Built

### API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/email/sync` | POST | Manual email sync (user-triggered) | Session required |
| `/api/cron/sync-emails` | GET | Automated email sync (background) | CRON_SECRET header |
| `/api/cron/check-stalled` | GET | Check for stalled deals | CRON_SECRET header |

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| EmailSyncButton | `components/dashboard/EmailSyncButton.tsx` | Manual sync trigger button |
| DealTimeline | `components/deals/DealTimeline.tsx` | Shows email activities with 📧 icon |

### Libraries

| File | Purpose |
|------|---------|
| `lib/gmail.ts` | Gmail API wrapper + email matching algorithm |
| `lib/scheduledTasks.ts` | Task definitions and configurations |

### Database Fields

| Table | Field | Purpose |
|-------|-------|---------|
| UserPreference | `gmailToken` | Stores Gmail access token |
| UserPreference | `gmailRefreshToken` | Stores Gmail refresh token |
| UserPreference | `lastGmailSyncAt` | Tracks last sync timestamp |
| ActivityLog | `metadata.gmailId` | Deduplicates emails (never re-log same email) |

---

## 🔧 Configuration Files

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-emails",
      "schedule": "*/15 * * * *"  // Every 15 minutes
    },
    {
      "path": "/api/cron/check-stalled",
      "schedule": "0 8 * * *"  // Daily at 8am
    }
  ]
}
```

### lib/auth.ts (Updated)
- Added Gmail read scope: `https://www.googleapis.com/auth/gmail.readonly`
- Tokens now include `accessToken` and `refreshToken` for Gmail

### .env.example (New)
All required environment variables documented

---

## 🎯 How It Works

### Manual Sync (Option A)

**User Flow:**
1. User clicks "Sync Gmail" button on dashboard
2. Request: `POST /api/email/sync` with user session
3. Endpoint fetches 50 unread emails from Gmail
4. Matches emails to deals by Contact email (exact match)
5. For each matched email:
   - Creates activity log entry
   - Updates deal `lastActivityAt`
   - Updates contact `lastContactedAt`
6. Deduplicates using `gmailId` in metadata
7. Returns: "Synced 15 emails, logged 8 activities"

**UI Location:** Dashboard → Top-right, next to Timezone selector

---

### Automated Sync (Option B)

**Background Flow (Every 15 Minutes):**
1. External cron service calls `GET /api/cron/sync-emails`
2. Verifies `x-cron-secret` header for security
3. Gets all users with `gmailToken` set
4. For each user, runs sync logic from Option A
5. Returns summary report:
   ```json
   {
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

**Setup Options:**
- **Vercel Cron** (built-in, if on Vercel) ← Easiest
- **EasyCron.com** (free, external)
- **GitHub Actions** (free, uses runners)
- **Self-hosted cron** (Linux/Mac server)

See `GMAIL_AUTOMATION_SETUP.md` for detailed setup guides.

---

## 📊 Data Flow Diagram

```
Gmail API
    ↓
fetchGmailEmails() [lib/gmail.ts]
    ↓
Parse headers + extract email data
    ↓
matchEmailToDeal() - Contact email matching
    ↓
For each matched email:
  ├─ Check deduplication (gmailId)
  ├─ Create ActivityLog entry
  ├─ Update Deal.lastActivityAt
  └─ Update Contact.lastContactedAt
    ↓
ActivityLog shows in:
  ├─ Deal Timeline (📧 icon)
  ├─ Dashboard Activity Feed
  └─ Deal Intelligence risk scoring
```

---

## 🔒 Security

### API Protection

- **Manual sync:** Requires user session (NextAuth)
- **Cron sync:** Requires `x-cron-secret` header (environment variable)
- Never exposes tokens in URLs/logs
- Tokens auto-refresh via NextAuth

### Email Matching

- Uses exact email matching (no fuzzy/subject matching)
- Emails are modern day identifier attribute
- Contact email is authoritative source
- One email → max one deal (first match wins)

### Deduplication

- Stores `gmailId` in ActivityLog metadata
- Subsequent syncs check `gmailId` before logging
- Prevents duplicate activities even if email synced multiple times

---

## 📋 Setup Checklist

- [x] Gmail API scope added to NextAuth (`gmail.readonly`)
- [x] Database fields added (`gmailToken`, `gmailRefreshToken`, `lastGmailSyncAt`)
- [x] Manual sync endpoint created (`/api/email/sync`)
- [x] Cron sync endpoint created (`/api/cron/sync-emails`)
- [x] Cron check-stalled endpoint created (`/api/cron/check-stalled`)
- [x] EmailSyncButton component integrated into dashboard
- [x] Email activities show in deal timeline
- [x] vercel.json created with cron schedules
- [x] .env.example documented with all required variables
- [x] GMAIL_AUTOMATION_SETUP.md with 4 setup options

### Still To Do (Optional)

- [ ] Stall detection notifications (email, Slack, in-app)
- [ ] Email activity aggregation (thread grouping)
- [ ] User-configurable sync frequency
- [ ] Email search/filter in dashboard
- [ ] Manual email-to-deal assignment (UI)
- [ ] Sent email tracking (sent to contacts)

---

## 🚀 Testing Checklist

### Prerequisites

1. User has authorized Gmail during login
2. At least one Contact added to a Deal
3. Test email sent from/to Contact email address

### Manual Sync Test

- [ ] Click "Sync Gmail" button
- [ ] See "Syncing..." state
- [ ] Get success notification
- [ ] Email appears in deal timeline within 5 seconds
- [ ] Deal `lastActivityAt` updates
- [ ] Contact `lastContactedAt` updates

### Cron Sync Test (Pick One Setup Option)

1. **Vercel:**
   - [ ] Deploy to Vercel
   - [ ] Check Settings → Cron Jobs
   - [ ] See "Sync Emails" scheduled for `*/15 * * * *`
   - [ ] Wait 15 minutes for first auto-run

2. **EasyCron:**
   - [ ] Create job at easycron.com
   - [ ] Click "Run Now" to test
   - [ ] Check endpoint response (should be 200 OK)
   - [ ] Set frequency to `*/15 * * * *`

3. **GitHub Actions:**
   - [ ] Create `.github/workflows/sync-emails.yml`
   - [ ] Add CRON_SECRET secret
   - [ ] Commit and push
   - [ ] Check Actions tab for successful runs

4. **Self-Hosted:**
   - [ ] Add crontab entry
   - [ ] Test with `crontab -l` to verify
   - [ ] Check `/tmp/email-sync.log` after 15 minutes

### Verification

- [ ] New activities appear without clicking button
- [ ] Activities show 📧 email_received icon
- [ ] Deal health scoring factors in email activity
- [ ] Stall detection resets when emails arrive
- [ ] No duplicate activities on re-run
- [ ] Dashboard Activity Feed updates automatically

---

## 📚 Documentation

| Document | Contains |
|----------|----------|
| `GMAIL_AUTOMATION_SETUP.md` | 4 setup options with step-by-step guide |
| `lib/scheduledTasks.ts` | Task definitions + comments on scaling |
| `EMAIL_AUTOMATION_STATUS.md` | This file - overall architecture |
| `.env.example` | All required environment variables |

---

## 🔄 Data Sync Frequency

| Operation | Frequency | Purpose |
|-----------|-----------|---------|
| Email fetch | Every 15 min | Real-time email → deal linking |
| Health recalc | Every 1 hour | Update risk scores |
| Stall check | Every 8am | Alert on stalled deals |
| Token refresh | Auto (NextAuth) | Maintain Gmail access |

---

## 💡 Key Features

1. **Activity Auto-Logging:** Emails automatically become deal activities
2. **Stall Reset:** Email activity resets stall detection (deal is active again)
3. **Health Scoring:** Recent emails boost deal health score
4. **Contact Tracking:** `lastContactedAt` tracks relationship health
5. **Deduplication:** Same email never logged twice
6. **Deal Intelligence:** Integrates with risk scoring + recommendations

---

## 🎓 Architecture Highlights

- **No user intervention required** after initial Gmail authorization
- **Scales to multiple users** (cron runs for all with Gmail connected)
- **Fault-tolerant** (failed users don't block others)
- **Secure** (tokens auto-refresh, cron requires secret header)
- **Extensible** (ready for SMS, Slack, email notifications)

---

## 📖 Next Reading

1. Start with: `GMAIL_AUTOMATION_SETUP.md` (pick a setup option)
2. Then read: `lib/gmail.ts` (email matching logic)
3. Finally: `/api/cron/sync-emails` code (full flow)
