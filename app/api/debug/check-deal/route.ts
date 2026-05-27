import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Simple endpoint to check if a deal exists and what data it has
 */
export async function GET(req: NextRequest) {
  try {
    const dealId = req.nextUrl.searchParams.get('id');
    if (!dealId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const id = parseInt(dealId);

    // Check if deal exists
    const deal = await prisma.deal.findUnique({
      where: { id },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Try each relation separately
    const results: any = {
      dealExists: true,
      deal: deal,
      relations: {},
    };

    try {
      results.relations.calendarEvents = await prisma.calendarEvent.findMany({ where: { dealId: id } });
    } catch (e) {
      results.relations.calendarEventsError = (e as Error).message;
    }

    try {
      results.relations.todos = await prisma.todo.findMany({ where: { dealId: id } });
    } catch (e) {
      results.relations.todosError = (e as Error).message;
    }

    try {
      results.relations.activityLogs = await prisma.activityLog.findMany({ where: { dealId: id } });
    } catch (e) {
      results.relations.activityLogsError = (e as Error).message;
    }

    try {
      results.relations.contacts = await prisma.contact.findMany({ where: { dealId: id } });
    } catch (e) {
      results.relations.contactsError = (e as Error).message;
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
