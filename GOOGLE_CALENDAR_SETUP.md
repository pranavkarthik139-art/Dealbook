# Google Calendar Integration Setup

## Overview

The Dealbook dashboard now integrates with Google Calendar to automatically fetch your upcoming calls and match them to deals.

## Requirements

- Google Cloud Console project
- Google Calendar API enabled
- Service Account with Calendar API access
- Access to share calendar with the service account

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Enable the **Google Calendar API**:
   - Click "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the service account details:
   - Service account name: `dealbook-calendar`
   - Click "Create and Continue"
   - Click "Continue" through the optional steps
   - Click "Done"

### 3. Create a Service Account Key

1. Go back to "Credentials" page
2. Under "Service Accounts", click on the service account you just created
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Choose **JSON** format
6. Click "Create"
7. A JSON file will download - **keep this file safe**

### 4. Share Your Google Calendar

1. Open [Google Calendar](https://calendar.google.com)
2. Find the service account email in the JSON file (looks like: `service-account@project-id.iam.gserviceaccount.com`)
3. In Google Calendar:
   - Right-click on "My Calendar"
   - Click "Settings and sharing"
   - Scroll to "Share with specific people"
   - Paste the service account email
   - Select "See all event details"
   - Click "Send"

### 5. Configure Environment Variables

1. Open `.env.local` in the project root
2. Extract values from the JSON key file:
   - `GOOGLE_PROJECT_ID`: Copy `project_id` from the JSON
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Copy `client_email` from the JSON
   - `GOOGLE_PRIVATE_KEY`: Copy `private_key` from the JSON (keep the `\n` escape sequences as-is)

Example `.env.local`:
```
GOOGLE_PROJECT_ID="your-project-id"
GOOGLE_SERVICE_ACCOUNT_EMAIL="dealbook-calendar@your-project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

### 6. Test the Integration

1. Start the dev server: `npm run dev`
2. Navigate to the dashboard: `http://localhost:3000/dashboard`
3. You should see "Today's Focus" section with calendar events
4. Check browser console for any errors

## API Endpoints

### GET /api/calendar/events
Fetches calendar events for a date range and matches them to deals.

**Query Parameters:**
- `start` (optional): Start date ISO string
- `end` (optional): End date ISO string

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event-id",
      "title": "Acme Demo Call",
      "startTime": "2026-05-17T14:00:00.000Z",
      "endTime": "2026-05-17T15:00:00.000Z",
      "attendees": ["client@example.com"],
      "dealId": 1
    }
  ],
  "count": 1
}
```

### POST /api/calendar/sync
Syncs calendar events with deals (matches event titles to deal names).

**Request Body:**
```json
{
  "startDate": "2026-05-17T00:00:00Z",
  "endDate": "2026-05-24T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "events": [...],
  "matched": 3,
  "total": 5
}
```

## Troubleshooting

### "No Google Calendar credentials configured"
- Make sure all three environment variables are set in `.env.local`
- Restart the dev server after updating `.env.local`

### "Failed to fetch calendar events"
- Check that the service account email has access to your calendar
- Verify the `GOOGLE_PRIVATE_KEY` is properly formatted with newlines

### Events not matching to deals
- Make sure deal names appear in event titles
- Example: Event "Acme Corp - Demo" matches deal "Acme Corp"
- Check the browser console for the matching score

## How It Works

The dashboard automatically:
1. Fetches events from your Google Calendar
2. Fuzzy-matches event titles to deal names
3. Displays matched calls in the "Today's Focus" section
4. Shows a link to the associated deal

The matching algorithm:
- Exact match: 100 points
- Deal name in event title: 90 points
- Event title in deal name: 70 points
- Word-by-word matching: 60 points
- Threshold: 50 points to consider a match

## Future Enhancements

- [ ] OAuth 2.0 integration (no service account needed)
- [ ] Manual deal-to-calendar matching UI
- [ ] Event creation from deals
- [ ] Calendar-based insights (call frequency, timing patterns)
- [ ] Timezone-aware event display

## Security Notes

- **Never commit `.env.local` to git** - it contains sensitive credentials
- The service account has read-only access to your calendar
- Keys can be rotated in Google Cloud Console if compromised
- For production, store credentials in a secrets manager
