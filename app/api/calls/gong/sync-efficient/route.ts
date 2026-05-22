/**
 * Efficient Gong Sync Endpoint
 *
 * Strategy: Only sync calls updated since last sync (incremental)
 * - First run: Sync all calls
 * - Subsequent runs: Sync only new/updated calls
 * - Caching: 24-48 hour cache for all calls
 * - Cost: 1-2 API calls per sync (vs. 100+ for full sync)
 *
 * Usage: POST /api/calls/gong/sync-efficient
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GongClient } from '@/lib/gong-client';

const USER_ID = 1; // Demo user

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (cron job, admin, etc.)
    const authToken = request.headers.get('authorization');
    if (!authToken || authToken !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize Gong client
    const gongAccessToken = process.env.GONG_ACCESS_TOKEN;
    if (!gongAccessToken) {
      return NextResponse.json(
        { error: 'Gong API credentials not configured' },
        { status: 400 }
      );
    }

    const gong = new GongClient(gongAccessToken);

    // Step 1: Get last sync time
    const lastSync = await getLastSyncTime(USER_ID);
    console.log(`📋 Last sync: ${lastSync.toISOString()}`);

    // Step 2: Incremental fetch (COST OPTIMIZATION)
    // Only fetch calls updated since last sync
    const newCalls = await gong.syncCallsSinceLastUpdate(lastSync);
    console.log(`📡 Fetched ${newCalls.length} updated calls`);

    // Step 3: Match calls to deals & store
    const matchedCalls: any[] = [];

    for (const call of newCalls) {
      const dealId = await matchCallToDeal(USER_ID, call);

      if (dealId) {
        // Store call in database
        const storedCall = await prisma.call.upsert({
          where: { gongCallId: call.id },
          create: {
            userId: USER_ID,
            dealId,
            title: call.title,
            callDate: call.startTime,
            durationMinutes: call.duration,
            attendees: call.participants,
            gongCallId: call.id,
            gongSentiment: call.sentiment,
            gongRiskLevel: call.riskLevel,
            gongSyncedAt: new Date(),
          },
          update: {
            title: call.title,
            callDate: call.startTime,
            durationMinutes: call.duration,
            attendees: call.participants,
            gongSentiment: call.sentiment,
            gongRiskLevel: call.riskLevel,
            gongSyncedAt: new Date(),
          },
        });

        matchedCalls.push(storedCall);

        // Update deal's last activity
        await prisma.deal.update({
          where: { id: dealId },
          data: {
            lastActivityAt: new Date(),
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: USER_ID,
            dealId,
            action: 'call_synced_gong',
            description: `Call "${call.title}" synced from Gong`,
            metadata: {
              gongCallId: call.id,
              participants: call.participants,
              sentiment: call.sentiment,
              riskLevel: call.riskLevel,
            },
          },
        });
      }
    }

    // Step 4: Update sync log
    const usageStats = gong.getUsageStats();

    await prisma.gongSyncLog.create({
      data: {
        userId: USER_ID,
        syncType: 'incremental',
        callsFetched: newCalls.length,
        callsMatched: matchedCalls.length,
        apiCallsUsed: usageStats.dailyCallCount,
        syncedAt: new Date(),
        nextSyncScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: matchedCalls.length > 0 ? 'success' : 'success_no_calls',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${newCalls.length} Gong calls, matched ${matchedCalls.length} to deals`,
      stats: {
        callsFetched: newCalls.length,
        callsMatched: matchedCalls.length,
        apiCallsUsed: usageStats.dailyCallCount,
        cacheHitRate: usageStats.cacheHitRate,
        percentOfDailyLimit: usageStats.percentageOfLimit.toFixed(2) + '%',
        estimatedCost: '$' + usageStats.estimatedDailyCost.toFixed(2),
      },
      calls: matchedCalls.map((call) => ({
        id: call.id,
        title: call.title,
        dealId: call.dealId,
        participants: call.attendees,
      })),
    });
  } catch (error) {
    console.error('Gong sync error:', error);

    // Log sync failure
    try {
      await prisma.gongSyncLog.create({
        data: {
          userId: USER_ID,
          syncType: 'incremental',
          callsFetched: 0,
          callsMatched: 0,
          apiCallsUsed: 0,
          syncedAt: new Date(),
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Failed to sync Gong calls',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get time of last successful sync
 */
async function getLastSyncTime(userId: number): Promise<Date> {
  const lastSync = await prisma.gongSyncLog.findFirst({
    where: {
      userId,
      status: 'success',
    },
    orderBy: { syncedAt: 'desc' },
    take: 1,
  });

  if (lastSync) {
    return lastSync.syncedAt;
  }

  // First sync: go back 30 days
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

/**
 * Helper: Match call to deal by contact email or fuzzy title match
 */
async function matchCallToDeal(userId: number, call: any): Promise<number | null> {
  // Priority 1: Match by contact email (exact)
  const contacts = await prisma.contact.findMany({
    where: { userId },
    select: { dealId: true, email: true },
  });

  for (const email of call.participants) {
    const contact = contacts.find((c) => c.email === email);
    if (contact) return contact.dealId;
  }

  // Priority 2: Fuzzy match on title
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  const callTitleLower = call.title.toLowerCase();
  for (const deal of deals) {
    if (deal.name && callTitleLower.includes(deal.name.toLowerCase())) {
      return deal.id;
    }
  }

  return null;
}

/**
 * GET - Check sync status
 */
export async function GET(request: NextRequest) {
  try {
    const lastSync = await prisma.gongSyncLog.findFirst({
      where: { userId: USER_ID },
      orderBy: { syncedAt: 'desc' },
      take: 1,
    });

    const recentSyncs = await prisma.gongSyncLog.findMany({
      where: { userId: USER_ID },
      orderBy: { syncedAt: 'desc' },
      take: 7, // Last 7 syncs
    });

    const totalCalls = await prisma.call.count({
      where: { userId: USER_ID },
    });

    const avgApiCallsPerSync =
      recentSyncs.reduce((sum, sync) => sum + sync.apiCallsUsed, 0) / recentSyncs.length || 0;

    return NextResponse.json({
      status: 'ok',
      lastSync: lastSync ? lastSync.syncedAt : null,
      totalCallsSynced: totalCalls,
      recentSyncs: recentSyncs.map((sync) => ({
        date: sync.syncedAt,
        callsFetched: sync.callsFetched,
        callsMatched: sync.callsMatched,
        apiCallsUsed: sync.apiCallsUsed,
        status: sync.status,
      })),
      metrics: {
        averageApiCallsPerSync: avgApiCallsPerSync.toFixed(2),
        estimatedMonthlyApiCalls: (avgApiCallsPerSync * 30).toFixed(0),
        estimatedMonthlyCost: '$' + (avgApiCallsPerSync * 30 * 0.0001).toFixed(2),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}
