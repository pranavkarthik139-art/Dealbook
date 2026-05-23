import { google } from 'googleapis';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  description?: string;
}

export interface CalendarEventWithDeal extends CalendarEvent {
  dealId?: number;
}

// Fuzzy match helper - finds if any deal name appears in the event title
function fuzzyMatch(eventTitle: string, dealName: string): number {
  const eventLower = eventTitle.toLowerCase();
  const dealLower = dealName.toLowerCase();

  // Exact match
  if (eventLower === dealLower) return 100;
  if (eventLower.includes(dealLower)) return 90;
  if (dealLower.includes(eventLower)) return 70;

  // Check for key words
  if (dealLower.length >= 3) {
    const keyWords = dealLower.split(' ');
    let matchCount = 0;
    for (const word of keyWords) {
      if (word.length >= 2 && eventLower.includes(word)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      return (matchCount / keyWords.length) * 60;
    }
  }

  return 0;
}

export async function fetchCalendarEvents(
  calendarId: string,
  startTime: Date,
  endTime: Date,
  accessToken?: string
): Promise<CalendarEvent[]> {
  try {
    let auth;

    if (accessToken) {
      // Use OAuth token from user's authenticated session
      auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
    } else {
      // Fallback to service account (for backward compatibility)
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();

      if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        throw new Error('Missing Google credentials in environment');
      }

      const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: 'key-id',
        private_key: privateKey,
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        client_id: 'client-id',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      };

      auth = new google.auth.GoogleAuth({
        credentials: credentials as any,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      });
    }

    const calendar = google.calendar({ version: 'v3', auth: auth as any });

    console.log('📅 Querying Google Calendar:', {
      calendarId,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
    });

    const response = await calendar.events.list({
      calendarId,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = response.data.items || [];
    console.log(`📅 Google Calendar returned ${events.length} events`);
    events.forEach((e) => {
      console.log(`  - ${e.summary}: ${e.start?.dateTime || e.start?.date}`);
    });

    return events.map((event) => ({
      id: event.id || '',
      title: event.summary || 'Untitled',
      startTime: new Date(event.start?.dateTime || event.start?.date || ''),
      endTime: new Date(event.end?.dateTime || event.end?.date || ''),
      attendees: event.attendees?.map((a) => a.email || '') || [],
      description: event.description || undefined,
    }));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error fetching calendar events:', errorMsg);
    console.error('Full error:', error);
    throw error;
  }
}

export function matchDealToEvent(
  eventTitle: string,
  eventAttendees: string[],
  deals: { id: number; name: string; email?: string | null }[]
): number | undefined {
  if (!eventTitle || deals.length === 0) return undefined;

  // First priority: exact email match with attendees
  if (eventAttendees && eventAttendees.length > 0) {
    for (const deal of deals) {
      if (deal.email && eventAttendees.includes(deal.email)) {
        return deal.id;
      }
    }
  }

  // Second priority: fuzzy match on title
  let bestMatch: { dealId: number; score: number } | null = null;

  for (const deal of deals) {
    const score = fuzzyMatch(eventTitle, deal.name);
    if (score > 50 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { dealId: deal.id, score };
    }
  }

  return bestMatch?.dealId;
}

export async function matchDealsToEvents(
  events: CalendarEvent[],
  deals: { id: number; name: string; email?: string | null }[]
): Promise<CalendarEventWithDeal[]> {
  return events.map((event) => ({
    ...event,
    dealId: matchDealToEvent(event.title, event.attendees, deals),
  }));
}

export async function syncCalendarEvents(
  calendarId: string,
  startTime: Date,
  endTime: Date,
  deals: { id: number; name: string; email?: string | null }[],
  accessToken?: string
): Promise<CalendarEventWithDeal[]> {
  const events = await fetchCalendarEvents(calendarId, startTime, endTime, accessToken);
  return matchDealsToEvents(events, deals);
}
