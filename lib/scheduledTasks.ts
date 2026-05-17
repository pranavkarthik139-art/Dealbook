// Scheduled Tasks Configuration
// These tasks run automatically at specified intervals

export const SCHEDULED_TASKS = {
  // Every 15 minutes: sync emails for all users with Gmail connected
  EMAIL_SYNC: {
    name: 'sync-emails',
    schedule: '*/15 * * * *', // Every 15 minutes
    description: 'Automatically sync emails from Gmail and log activities',
    endpoint: '/api/cron/sync-emails',
    cronSecret: process.env.CRON_SECRET,
  },

  // Every hour: run health scoring updates
  UPDATE_DEAL_HEALTH: {
    name: 'update-deal-health',
    schedule: '0 * * * *', // Every hour
    description: 'Recalculate deal health scores based on activity',
    endpoint: '/api/cron/update-health',
    cronSecret: process.env.CRON_SECRET,
  },

  // Daily at 8am: check for stalled deals and create alerts
  CHECK_STALLED_DEALS: {
    name: 'check-stalled',
    schedule: '0 8 * * *', // 8am every day
    description: 'Check for stalled deals and notify users',
    endpoint: '/api/cron/check-stalled',
    cronSecret: process.env.CRON_SECRET,
  },
};

export function getTask(taskName: string) {
  return Object.values(SCHEDULED_TASKS).find(t => t.name === taskName);
}

// To set up automated syncing:
// 1. Option A: Use Vercel Cron (built-in, if on Vercel)
// 2. Option B: Use EasyCron.com (free, external)
// 3. Option C: Use GitHub Actions (free, external)
// 4. Option D: Use a Cron job on your server
//
// For all options, make GET request to:
// https://yourdomain.com/api/cron/sync-emails
// Header: x-cron-secret: <CRON_SECRET from .env>
