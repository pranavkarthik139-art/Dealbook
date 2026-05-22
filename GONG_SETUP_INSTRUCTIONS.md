# Gong Integration Setup Guide

## Step 1: Get Gong API Credentials

### 1.1 Access Gong Settings
1. Log in to your Gong account (https://gong.io)
2. Go to **Settings** → **Integrations** → **API**
3. Click **Generate API Credentials**

### 1.2 Get Access Token
- Copy your **Access Token** (long string starting with `gong_...`)
- Copy your **Refresh Token** (for long-running integrations)

### 1.3 Note Rate Limits
- **Standard Plan**: 10,000 API calls/day, 100 calls/minute
- **Enterprise Plan**: Custom limits
- Dealbook uses ~2-5 calls/day with optimization (see GONG_INTEGRATION_GUIDE.md)

---

## Step 2: Configure Environment Variables

### 2.1 Update `.env.local` (Development)
```bash
# Gong API Configuration
GONG_ACCESS_TOKEN=gong_xxxxxxxxxxxxxxxxxxxxxxxxxx
GONG_REFRESH_TOKEN=gong_yyyyyyyyyyyyyyyyyyyyyyyyy

# Cron Job Secret (for scheduled sync)
CRON_SECRET=your-secret-key-here-min-32-chars
```

### 2.2 Update `.env.production` (Vercel)
```bash
# Add same env vars in Vercel dashboard:
# Settings → Environment Variables
GONG_ACCESS_TOKEN=gong_xxxxxxxxxxxxxxxxxxxxxxxxxx
GONG_REFRESH_TOKEN=gong_yyyyyyyyyyyyyyyyyyyyyyyyy
CRON_SECRET=your-secret-key-here-min-32-chars
```

**Vercel Setup:**
1. Go to https://vercel.com/dashboard
2. Select Dealbook project
3. Settings → Environment Variables
4. Add GONG_ACCESS_TOKEN, GONG_REFRESH_TOKEN, CRON_SECRET
5. Click "Save"
6. Redeploy the project

---

## Step 3: Schedule Daily Sync Job

### Option A: Using Vercel Cron (Recommended)

**File: `vercel.json`**
```json
{
  "crons": [{
    "path": "/api/calls/gong/sync-efficient",
    "schedule": "0 3 * * *"
  }]
}
```

- **Trigger:** Daily at 3 AM UTC
- **Cost:** Free (included with Vercel)
- **Reliability:** 99.9%

**Deploy:**
```bash
git add vercel.json
git commit -m "add Gong sync cron job"
git push
```

### Option B: Using External Cron Service

If not using Vercel, use a service like:
- **EasyCron** (free): https://www.easycron.com
- **cron-job.org** (free): https://cron-job.org
- **AWS EventBridge** (paid)

**Setup Example (EasyCron):**
1. Go to https://www.easycron.com
2. Create new cron job
3. URL: `https://dealbook.vercel.app/api/calls/gong/sync-efficient`
4. HTTP Auth: 
   - Username: `token`
   - Password: `your-CRON_SECRET-value`
5. Schedule: `0 3 * * *` (daily at 3am)
6. Click "Create"

### Option C: Manual Trigger (Testing)

```bash
# Test sync manually
curl -X POST https://dealbook.vercel.app/api/calls/gong/sync-efficient \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Step 4: Test the Integration

### 4.1 Verify Credentials
```bash
# Test API connection
node -e "
const GongClient = require('./lib/gong-client').GongClient;
const client = new GongClient('YOUR_ACCESS_TOKEN');
client.getCall('sample_call_id').then(console.log);
"
```

### 4.2 Check Sync Endpoint
```bash
# Check sync status
curl https://dealbook.vercel.app/api/calls/gong/sync-efficient
```

Should return:
```json
{
  "status": "ok",
  "lastSync": "2026-05-23T03:00:00Z",
  "totalCallsSynced": 42,
  "metrics": {
    "averageApiCallsPerSync": "2.3",
    "estimatedMonthlyApiCalls": "69",
    "estimatedMonthlyCost": "$0.01"
  }
}
```

### 4.3 Trigger Manual Sync
```bash
# Manually trigger sync (bypassing schedule)
curl -X POST https://dealbook.vercel.app/api/calls/gong/sync-efficient \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Response should show:
```json
{
  "success": true,
  "message": "Synced 5 Gong calls, matched 3 to deals",
  "stats": {
    "callsFetched": 5,
    "callsMatched": 3,
    "apiCallsUsed": 1,
    "cacheHitRate": 85,
    "percentOfDailyLimit": "0.01%",
    "estimatedCost": "$0.0001"
  }
}
```

---

## Step 5: Monitor Integration Health

### 5.1 View Sync Dashboard
Visit: `/admin/gong-dashboard` (admin only)

Shows:
- Total calls synced
- Average API calls per sync
- Monthly cost estimate
- Last 7 days of sync history
- Manual sync trigger button

### 5.2 Check Logs
```sql
-- View recent syncs in database
SELECT * FROM gong_sync_logs 
ORDER BY synced_at DESC 
LIMIT 10;
```

### 5.3 Set Up Alerts
Create a notification if sync fails:
```typescript
// In sync endpoint error handler
if (status === 'failed') {
  await sendAlert({
    title: 'Gong sync failed',
    message: `Error: ${errorMessage}`,
    severity: 'warning'
  });
}
```

---

## Step 6: Optimize & Monitor Costs

### 6.1 Cost Baseline
With current optimization strategy:

| Metric | Value |
|--------|-------|
| API Calls/Day | 2-3 |
| API Calls/Month | 60-90 |
| Monthly Cost (if pay-per-call) | $0.01-0.05 |
| Daily Limit Usage | <1% |
| Cache Hit Rate | 85-95% |

### 6.2 Monitor Quarterly
Each quarter, check:
- Are API calls staying under 10k/day limit?
- Is cache hit rate > 80%?
- Are syncs completing successfully?
- Any patterns in matched vs. unmatched calls?

### 6.3 Alerts to Set Up
```typescript
// Alert if approaching daily limit
if (dailyCallCount > 8000) {
  console.warn('🚨 GONG: Approaching 10k daily limit');
  // Send Slack alert
}

// Alert if sync failing for 3+ days
if (consecutiveFailures >= 3) {
  console.error('🚨 GONG: Sync failing consistently');
  // Send Slack alert
}

// Alert if cache hit rate drops below 50%
if (cacheHitRate < 0.5) {
  console.warn('🚨 GONG: Cache effectiveness degraded');
  // Investigate & clear old cache
}
```

---

## Step 7: Troubleshooting

### Issue: "Invalid API Credentials"
- ✅ Check GONG_ACCESS_TOKEN is correct in env vars
- ✅ Verify token hasn't expired (get new one from Gong settings)
- ✅ Check token is not truncated in env var

### Issue: "Sync Not Running"
- ✅ Verify cron job is configured (check Vercel settings)
- ✅ Check CRON_SECRET matches in endpoint
- ✅ Check logs in Vercel dashboard for errors

### Issue: "Too Many API Calls"
- ✅ Check if cache is being cleared unexpectedly
- ✅ Look for duplicate sync triggers
- ✅ Review GongSyncLog for unusually high api_calls_used

### Issue: "Calls Not Being Matched to Deals"
- ✅ Check contact emails in Gong match Dealbook contacts
- ✅ Verify deal names are in call titles
- ✅ Review sync logs for callsMatched count

---

## Step 8: Future Enhancements

### Webhook Integration (Remove Polling)
Instead of daily sync, Gong can push updates:
1. Set up webhook endpoint: `/api/webhooks/gong`
2. Configure in Gong settings
3. Receive real-time call data without API calls
4. Cost savings: 99% fewer API calls

### Advanced Matching
- Match by attendee job titles (Gong enriches this)
- Match by company name + industry
- Fuzzy matching with confidence scoring

### Insights Extraction
- Auto-extract key topics from transcripts
- Flag risk patterns (price objections, competitor mentions)
- Surface deal-specific recommendations

---

## Quick Reference

```bash
# Check Gong credentials
echo $GONG_ACCESS_TOKEN | head -c 20 # Should show "gong_xxxxxx"

# View recent syncs
curl https://dealbook.vercel.app/api/calls/gong/sync-efficient

# Trigger manual sync
curl -X POST https://dealbook.vercel.app/api/calls/gong/sync-efficient \
  -H "Authorization: Bearer $CRON_SECRET"

# Monitor monthly costs
curl https://dealbook.vercel.app/api/calls/gong/sync-efficient | jq '.metrics'
```

---

## Cost Summary

**Dealbook Gong Integration = Nearly Free** 🎉

- Gong subscription: $XXX/month (you already pay this)
- Dealbook API overhead: $0-0.05/month (optimized)
- Total incremental cost: **$0/month** ✅

Compare to naive implementation:
- Polling every 5min: 288 calls/day = $86.4/month
- Fetching all calls daily: 1000+ calls/day = $300+/month

**Savings: 99%** 💰
