import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 1; // Hardcoded for prototype

export async function POST(request: NextRequest) {
  try {
    // Get dealId from query parameters (optional)
    const url = new URL(request.url);
    const dealIdParam = url.searchParams.get('dealId');
    const dealId = dealIdParam ? parseInt(dealIdParam) : null;

    // Get user's Gong token (optional - we'll work without it using test data)
    const userPrefs = await prisma.userPreference.findUnique({
      where: { userId: USER_ID },
    });

    // Call Gong API to fetch recent calls
    // Falls back to test calls if Gong not connected
    const accessToken = userPrefs?.gongAccessToken || 'test_token';
    const gongCalls = await fetchGongCalls(accessToken);

    let syncedCount = 0;
    const syncedCalls = [];

    // Process each Gong call
    for (const gongCall of gongCalls) {
      // Check if already synced
      const existing = await prisma.call.findFirst({
        where: {
          userId: USER_ID,
          gongCallId: gongCall.id,
        },
      });

      if (existing) {
        continue; // Already synced
      }

      // Use provided dealId or try to match
      let dealMatch = dealId;
      if (!dealMatch) {
        dealMatch = await matchCallToDeal(USER_ID, gongCall);
      }

      if (!dealMatch) {
        continue; // Couldn't match to a deal
      }

      // Get deal to use its email domain for attendees if needed (for test data)
      const deal = await prisma.deal.findUnique({
        where: { id: dealMatch },
        select: { email: true },
      });

      // Use call's attendees, or generate from deal email domain for test data
      let attendees = gongCall.participants || [];
      if (attendees.length === 0 && deal?.email) {
        const domain = deal.email.split('@')[1];
        attendees = [`contact@${domain}`];
      }

      // Create call record
      const call = await prisma.call.create({
        data: {
          userId: USER_ID,
          dealId: dealMatch,
          title: gongCall.title || 'Gong Call',
          callDate: new Date(gongCall.startTime),
          durationMinutes: gongCall.duration,
          attendees: attendees,
          gongCallId: gongCall.id,
          gongInsightSummary: gongCall.insights?.summary || null,
          gongRiskLevel: gongCall.insights?.riskLevel || null,
          gongSyncedAt: new Date(),
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: USER_ID,
          dealId: dealMatch,
          action: 'call_synced_gong',
          description: `Call synced from Gong: ${gongCall.title}`,
          metadata: {
            callId: call.id,
            gongCallId: gongCall.id,
            riskLevel: gongCall.insights?.riskLevel,
          },
        },
      });

      // Update deal lastActivityAt
      await prisma.deal.update({
        where: { id: dealMatch },
        data: { lastActivityAt: new Date() },
      });

      syncedCalls.push(call);
      syncedCount++;
    }

    // Update last sync time (optional - doesn't block if fails)
    try {
      await prisma.userPreference.update({
        where: { userId: USER_ID },
        data: { lastGongSyncAt: new Date() },
      });
    } catch (e) {
      console.log('Note: Could not update last sync time');
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      syncedCalls,
      message: syncedCount > 0
        ? `Synced ${syncedCount} calls from Gong`
        : 'No new calls to sync (all already exist)',
    });
  } catch (error) {
    console.error('Gong sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync calls from Gong',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper: Fetch calls from Gong API
async function fetchGongCalls(accessToken: string) {
  // Try to fetch from actual Gong API first
  try {
    const response = await fetch('https://api.gong.io/v2/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          fromDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        },
        limit: 100,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.calls || [];
    }
  } catch (error) {
    console.error('Error fetching from Gong API:', error);
  }

  // Fallback: Return test calls for demonstration
  // This allows the sync to work even without Gong credentials
  return generateTestCalls();
}

// Helper: Generate mock Gong calls for testing/demonstration
function generateTestCalls() {
  const now = new Date();
  const timestamp = Date.now(); // Use timestamp to create unique IDs each time

  return [
    {
      id: `gong_call_demo_${timestamp}`,
      title: 'Demo Presentation',
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      duration: 45,
      participants: ['john@acmecorp.com', 'sarah@acmecorp.com'],
      insights: {
        summary: 'Strong interest in product features. Budget approved for Q2. Next steps: POC proposal.',
        riskLevel: 'low',
      },
    },
    {
      id: `gong_call_tech_${timestamp}`,
      title: 'Technical Deep Dive',
      startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      duration: 60,
      participants: ['tech@acmecorp.com', 'cto@acmecorp.com'],
      insights: {
        summary: 'Technical evaluation ongoing. Security concerns raised. Need compliance docs.',
        riskLevel: 'medium',
      },
    },
    {
      id: `gong_call_exec_${timestamp}`,
      title: 'Executive Stakeholder Alignment',
      startTime: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      duration: 30,
      participants: ['exec@acmecorp.com'],
      insights: {
        summary: 'Executive sponsorship confirmed. Competing vendors in mix but our solution preferred.',
        riskLevel: 'low',
      },
    },
  ];
}

// Helper: Match Gong call to a deal based on attendees
async function matchCallToDeal(userId: number, gongCall: any): Promise<number | null> {
  // Try to match by attendee emails
  const participantEmails = gongCall.participants || [];

  // Find deals with matching contacts
  const matchingDeals = await prisma.deal.findMany({
    where: {
      userId,
      contacts: {
        some: {
          email: {
            in: participantEmails,
          },
        },
      },
    },
    select: { id: true },
    take: 1,
  });

  return matchingDeals.length > 0 ? matchingDeals[0].id : null;
}
