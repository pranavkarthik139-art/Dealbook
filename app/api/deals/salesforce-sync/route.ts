/**
 * Sync Deals to Salesforce Opportunities
 *
 * Strategies:
 * - Change detection: only write if fields changed
 * - Async queue: don't block on Salesforce
 * - Batching: 100 records per API call
 * - External ID: prevent duplicates
 *
 * Usage:
 * - POST /api/deals/salesforce-sync (sync all deals)
 * - POST /api/deals/[id]/salesforce-sync (sync single deal)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SalesforceClient } from '@/lib/salesforce-client';

const USER_ID = 1; // Demo user

// Initialize Salesforce client
let sfClient: SalesforceClient | null = null;

function getSalesforceClient(): SalesforceClient {
  if (!sfClient) {
    const accessToken = process.env.SALESFORCE_ACCESS_TOKEN;
    const instanceUrl = process.env.SALESFORCE_INSTANCE_URL;

    if (!accessToken || !instanceUrl) {
      throw new Error('Salesforce credentials not configured');
    }

    sfClient = new SalesforceClient(accessToken, instanceUrl);
  }

  return sfClient;
}

/**
 * Sync all deals to Salesforce
 * POST /api/deals/salesforce-sync
 */
export async function POST(request: NextRequest) {
  try {
    const sf = getSalesforceClient();

    // Get all deals
    const deals = await prisma.deal.findMany({
      where: { userId: USER_ID },
      include: { contacts: true },
    });

    console.log(`\n🔄 Syncing ${deals.length} deals to Salesforce...`);

    let queuedCount = 0;
    let skippedCount = 0;

    // Queue each deal for sync
    for (const deal of deals) {
      try {
        // Get Salesforce mapping
        let mapping = await prisma.salesforceMapping.findUnique({
          where: { dealId: deal.id },
        });

        // If no mapping, create one (upsert)
        if (!mapping) {
          mapping = await prisma.salesforceMapping.create({
            data: {
              id: `deal_${deal.id}`,
              dealId: deal.id,
              salesforceId: '', // Will be populated by Salesforce on first write
              lastSyncedAt: new Date(),
              lastSyncedHash: '',
              status: 'pending',
            },
          });
        }

        // Build fields to sync
        const fieldsToSync = {
          Name: deal.name,
          Amount: deal.amount,
          StageName: mapDealStageToSalesforce(deal.stage),
          Probability: deal.probability,
          Description: deal.email || undefined,
          // Custom fields (if they exist in your Salesforce org)
          Dealbook_Health_Score__c: calculateHealthScore(deal),
          Dealbook_Deal_ID__c: deal.id.toString(),
          Dealbook_Stage__c: deal.stage,
          LeadSource: deal.leadSource || 'Other',
        };

        // Check for changes (Strategy 2)
        const hasChanges = await sf.updateIfChanged('Opportunity', mapping.salesforceId, fieldsToSync);

        if (hasChanges) {
          queuedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Failed to queue deal ${deal.id}:`, error);
      }
    }

    // Get queue stats
    const stats = sf.getStats();

    return NextResponse.json({
      success: true,
      message: `Queued ${queuedCount} deals for sync, skipped ${skippedCount} (no changes)`,
      stats: {
        queuedCount,
        skippedCount,
        queueSize: stats.queueSize,
        successfulWrites: stats.successfulWrites,
        failedWrites: stats.failedWrites,
        apiCalls: stats.apiCalls,
      },
    });
  } catch (error) {
    console.error('Salesforce sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync deals to Salesforce',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Sync single deal to Salesforce
 * POST /api/deals/[id]/salesforce-sync
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const sf = getSalesforceClient();

    // Get deal
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { contacts: true },
    });

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    console.log(`\n📤 Syncing deal "${deal.name}" to Salesforce...`);

    // Get or create mapping
    let mapping = await prisma.salesforceMapping.findUnique({
      where: { dealId },
    });

    if (!mapping) {
      mapping = await prisma.salesforceMapping.create({
        data: {
          id: `deal_${dealId}`,
          dealId,
          salesforceId: '', // Will be populated on first write
          lastSyncedAt: new Date(),
          lastSyncedHash: '',
          status: 'pending',
        },
      });
    }

    // Build fields
    const fieldsToSync = {
      Name: deal.name,
      Amount: deal.amount,
      StageName: mapDealStageToSalesforce(deal.stage),
      Probability: deal.probability,
      Description: deal.email || undefined,
      Dealbook_Health_Score__c: calculateHealthScore(deal),
      Dealbook_Deal_ID__c: deal.id.toString(),
      Dealbook_Stage__c: deal.stage,
      LeadSource: deal.leadSource || 'Other',
    };

    // Queue with change detection
    const hasChanges = await sf.updateIfChanged(
      'Opportunity',
      mapping.salesforceId,
      fieldsToSync
    );

    // Update mapping
    await prisma.salesforceMapping.update({
      where: { dealId },
      data: {
        lastSyncedAt: new Date(),
        status: hasChanges ? 'pending' : 'synced',
      },
    });

    return NextResponse.json({
      success: true,
      message: hasChanges
        ? `Deal queued for sync to Salesforce`
        : `No changes to sync`,
      deal: {
        id: deal.id,
        name: deal.name,
        synced: hasChanges,
      },
    });
  } catch (error) {
    console.error('Deal sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync deal',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get sync status
 * GET /api/deals/salesforce-sync
 */
export async function GET() {
  try {
    const sf = getSalesforceClient();

    // Get sync statistics
    const mappings = await prisma.salesforceMapping.findMany({
      where: { userId: USER_ID },
    });

    const syncedCount = mappings.filter((m) => m.status === 'synced').length;
    const pendingCount = mappings.filter((m) => m.status === 'pending').length;
    const failedCount = mappings.filter((m) => m.status === 'failed').length;

    const stats = sf.getStats();

    return NextResponse.json({
      success: true,
      syncs: {
        total: mappings.length,
        synced: syncedCount,
        pending: pendingCount,
        failed: failedCount,
      },
      queue: {
        size: stats.queueSize,
        successfulWrites: stats.successfulWrites,
        failedWrites: stats.failedWrites,
        totalApiCalls: stats.apiCalls,
        successRate: stats.successRate,
      },
      pendingJobs: sf.getPendingJobs(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Map Dealbook stage to Salesforce opportunity stage
 */
function mapDealStageToSalesforce(dealStage: string): string {
  const mapping: Record<string, string> = {
    demo: 'Qualification',
    poc: 'Needs Analysis',
    validation: 'Proposal/Price Quote',
    closed: 'Closed Won',
  };
  return mapping[dealStage] || 'Prospecting';
}

/**
 * Helper: Calculate health score for Salesforce
 * Returns 0-100
 */
function calculateHealthScore(deal: any): number {
  let score = 100;

  // Deduct for inactivity
  const daysSinceLastActivity = deal.lastActivityAt
    ? Math.floor((Date.now() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  score -= Math.min(daysSinceLastActivity * 2, 50);

  // Deduct if overdue
  if (deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date()) {
    score -= 30;
  }

  // Add points for high probability
  if (deal.probability >= 80) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}
