import { prisma } from '@/lib/db';
import {
  analyzeEnhancedDeal,
  DealAnalysisInput,
  EnhancedDealIntelligence,
} from '@/lib/dealIntelligence';
import { NextRequest, NextResponse } from 'next/server';
import { differenceInDays } from 'date-fns';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * GET /api/deals/[id]/intelligence
 *
 * Returns comprehensive deal intelligence including:
 * - Contact engagement signals (per-contact analysis)
 * - Activity trend analysis (7-day, 30-day trends)
 * - Milestone velocity (stage duration vs. historical patterns)
 * - Historical comparison (percentile ranking, predicted close date)
 * - Risk scoring with factor breakdown and reasoning
 * - ML feature vector for future model training
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dealId = parseInt(id);

    // Fetch deal with all necessary relations for intelligence analysis
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        contacts: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            role: true,
            lastContactedAt: true,
          },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
            metadata: true,
          },
        },
        calendarEvents: {
          where: {
            startTime: {
              gte: new Date(), // Only upcoming events
            },
          },
          orderBy: { startTime: 'asc' },
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            attendees: true,
          },
        },
        todos: {
          select: {
            id: true,
            content: true,
            completed: true,
            createdAt: true,
          },
        },
      },
    });

    if (!deal || deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Transform Prisma deal to DealAnalysisInput format
    const dealAnalysisInput: DealAnalysisInput = {
      id: deal.id,
      name: deal.name,
      stage: deal.stage || undefined,
      amount: deal.amount ? parseFloat(deal.amount.toString()) : undefined,
      status: deal.status || undefined,
      createdAt: deal.createdAt,
      lastActivityAt: deal.lastActivityAt || undefined,
      expectedCloseDate: deal.expectedCloseDate || undefined,

      // Relations
      contacts: deal.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        title: contact.title || undefined,
        role: contact.role || undefined,
        lastContactedAt: contact.lastContactedAt || undefined,
      })),
      activityLogs: deal.activityLogs.map((log) => ({
        id: log.id,
        action: log.action,
        description: log.description || '',
        createdAt: log.createdAt,
        metadata: (typeof log.metadata === 'object' && log.metadata !== null) ? log.metadata as Record<string, any> : {},
      })),
      calendarEvents: deal.calendarEvents.map((event) => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        attendees: event.attendees || [],
      })),
      todos: deal.todos,
    };

    // Calculate additional context from deal data
    const upcomingCalls = deal.calendarEvents.length;
    const completedTodos = deal.todos.filter((t) => t.completed).length;
    const totalTodos = deal.todos.length;

    // Analyze the deal using the enhanced intelligence engine
    const intelligence = analyzeEnhancedDeal(dealAnalysisInput, {
      upcomingCalls,
      completedMilestones: completedTodos,
      totalMilestones: totalTodos,
    });

    // Format response with proper type safety
    const response: {
      deal: {
        id: number;
        name: string;
        stage?: string;
        status?: string;
        amount?: number;
      };
      intelligence: EnhancedDealIntelligence;
      metadata: {
        contactCount: number;
        recentActivityCount: number;
        upcomingCallsCount: number;
        todoProgress: string;
        analyzeDate: string;
      };
    } = {
      deal: {
        id: deal.id,
        name: deal.name,
        stage: deal.stage || undefined,
        status: deal.status || undefined,
        amount: dealAnalysisInput.amount,
      },
      intelligence,
      metadata: {
        contactCount: deal.contacts.length,
        recentActivityCount: Math.min(
          deal.activityLogs.length,
          deal.activityLogs.filter(
            (log) => differenceInDays(new Date(), log.createdAt) <= 30
          ).length
        ),
        upcomingCallsCount: upcomingCalls,
        todoProgress: `${completedTodos}/${totalTodos}`,
        analyzeDate: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error analyzing deal intelligence:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze deal intelligence',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
