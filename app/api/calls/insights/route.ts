/**
 * API endpoint to generate call insights using Claude AI
 * POST /api/calls/insights
 * Body: { callId: number, transcript?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateCallInsights, generateMockTranscript } from '@/lib/google-meet';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId, transcript: providedTranscript } = await request.json();

    if (!callId) {
      return NextResponse.json(
        { error: 'callId is required' },
        { status: 400 }
      );
    }

    // Fetch the call from database
    const call = await prisma.call.findUnique({
      where: { id: parseInt(callId) },
      include: { deal: true },
    });

    if (!call) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    // Verify user owns this call's deal
    if (call.deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot access this call' },
        { status: 403 }
      );
    }

    // Use provided transcript or generate mock
    const mockMeeting = generateMockTranscript();
    mockMeeting.title = call.title;
    mockMeeting.date = call.callDate;

    // Generate insights using Claude
    const insights = await generateCallInsights(mockMeeting);

    // Save insights to the call record
    const updatedCall = await prisma.call.update({
      where: { id: call.id },
      data: {
        // Store insights in the Gong fields temporarily
        gongSummary: insights.summary,
        gongSentiment: insights.sentiment,
        gongRiskLevel: insights.riskLevel,
      },
    });

    return NextResponse.json({
      success: true,
      callId: call.id,
      insights,
      call: updatedCall,
    });
  } catch (error) {
    console.error('[Insights API] Error generating insights:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch insights for a specific call
 * GET /api/calls/[id]/insights
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const callId = request.nextUrl.searchParams.get('callId');

    if (!callId) {
      return NextResponse.json(
        { error: 'callId parameter is required' },
        { status: 400 }
      );
    }

    const call = await prisma.call.findUnique({
      where: { id: parseInt(callId) },
      include: { deal: true },
    });

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Verify user owns this call
    if (call.deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Return insights if available
    if (!call.gongSummary) {
      return NextResponse.json(
        { error: 'No insights generated yet' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      callId: call.id,
      summary: call.gongSummary,
      sentiment: call.gongSentiment,
      riskLevel: call.gongRiskLevel,
    });
  } catch (error) {
    console.error('[Get Insights API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
