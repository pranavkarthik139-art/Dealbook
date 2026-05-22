import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const feedback = await prisma.productFeedback.create({
      data: {
        userId: 1, // Demo user
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        respondentRole: data.respondentRole,
        overallRating: data.overallRating ? parseInt(data.overallRating) : null,
        likelyRecommend: data.likelyRecommend ? parseInt(data.likelyRecommend) : null,
        likedFeatures: data.likedFeatures || [],
        likedReasons: data.likedReasons,
        missingFeatures: data.missingFeatures || [],
        featureRequests: data.featureRequests,
        painPoints: data.painPoints,
        easeOfUse: data.easeOfUse ? parseInt(data.easeOfUse) : null,
        designFeedback: data.designFeedback,
        comparingTo: data.comparingTo,
        advantages: data.advantages,
        disadvantages: data.disadvantages,
        additionalSuggestions: data.additionalSuggestions,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: feedback.id,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const feedback = await prisma.productFeedback.findMany({
      where: { userId: 1 },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
