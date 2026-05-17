import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    console.log('🧪 Google Calendar API Test');
    console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Project ID:', process.env.GOOGLE_PROJECT_ID);

    // Try to authenticate
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

    const auth = new google.auth.GoogleAuth({
      credentials: credentials as any,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    console.log('✓ Auth object created');

    const calendar = google.calendar({ version: 'v3', auth });
    console.log('✓ Calendar client created');

    // Try to list calendars
    const calendarList = await calendar.calendarList.list();
    console.log('✓ Calendar list retrieved');
    console.log('Calendars:', calendarList.data.items?.map(c => ({ id: c.id, summary: c.summary })));

    // Try to list events on primary calendar
    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const eventsList = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 10,
    });

    console.log('✓ Events retrieved');
    console.log('Events on primary calendar:', eventsList.data.items?.length || 0);
    console.log('Event details:', eventsList.data.items?.map(e => ({ summary: e.summary, start: e.start })));

    return NextResponse.json({
      success: true,
      authenticated: true,
      calendars: calendarList.data.items?.length || 0,
      events: eventsList.data.items?.length || 0,
      rawCalendarData: calendarList.data,
      rawEventsData: eventsList.data,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Test failed:', errorMsg);
    console.error('Full error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
