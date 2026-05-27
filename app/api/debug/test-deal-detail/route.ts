import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { detectStall } from '@/lib/dealHealth';

/**
 * Test endpoint to verify deal detail fetch works without 500 errors
 * Usage: GET /api/debug/test-deal-detail?id=123
 */
export async function GET(request: NextRequest) {
  try {
    const dealId = request.nextUrl.searchParams.get('id');
    if (!dealId) {
      return NextResponse.json(
        { error: 'Missing id parameter. Usage: /api/debug/test-deal-detail?id=123' },
        { status: 400 }
      );
    }

    const id = parseInt(dealId);

    // Test 1: Fetch deal without relations (like the fixed endpoint)
    const deal = await prisma.deal.findUnique({
      where: { id },
    });

    if (!deal) {
      return NextResponse.json({
        status: 'error',
        message: 'Deal not found',
        dealId: id,
      }, { status: 404 });
    }

    // Test 2: Calculate stall detection
    const stall = detectStall({
      id: deal.id,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
      lastActivityAt: deal.lastActivityAt?.toISOString() || null,
      status: deal.status || undefined,
      stage: deal.stage || undefined,
    });

    // Test 3: Format response (like the fixed endpoint)
    const dealWithMetadata = {
      ...deal,
      amount: deal.amount ? parseFloat(deal.amount.toString()) : null,
      probability: deal.probability || 50,
      expectedCloseDate: deal.expectedCloseDate?.toISOString() || null,
      stall,
      calendarEvents: [],
      todos: [],
      activityLogs: [],
      contacts: [],
    };

    // Test 4: Try to fetch relations separately (to see if any fail)
    const relationTests: any = {};

    try {
      relationTests.calendarEvents = {
        count: await prisma.calendarEvent.count({ where: { dealId: id } }),
        status: 'ok',
      };
    } catch (e) {
      relationTests.calendarEvents = {
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      };
    }

    try {
      relationTests.todos = {
        count: await prisma.todo.count({ where: { dealId: id } }),
        status: 'ok',
      };
    } catch (e) {
      relationTests.todos = {
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      };
    }

    try {
      relationTests.activityLogs = {
        count: await prisma.activityLog.count({ where: { dealId: id } }),
        status: 'ok',
      };
    } catch (e) {
      relationTests.activityLogs = {
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      };
    }

    try {
      relationTests.contacts = {
        count: await prisma.contact.count({ where: { dealId: id } }),
        status: 'ok',
      };
    } catch (e) {
      relationTests.contacts = {
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      };
    }

    return NextResponse.json({
      status: 'success',
      message: 'Deal detail fetch test successful',
      deal: dealWithMetadata,
      relationTests,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[TEST] Deal detail fetch error:', errorMsg);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch deal detail',
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
