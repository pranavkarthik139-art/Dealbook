import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/sharing/public/:token
 * Public endpoint for accessing shared deals
 * No authentication required - token provides access control
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const accessToken = token;

    // Find shared deal by access token
    const sharedDeal = await prisma.sharedDeal.findUnique({
      where: { accessToken },
      include: {
        deal: {
          include: {
            contacts: true,
            todos: {
              select: {
                id: true,
                content: true,
                completed: true,
              },
            },
            activityLogs: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        },
        sharedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!sharedDeal) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 404 }
      );
    }

    // Check expiration
    if (sharedDeal.expiresAt && sharedDeal.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Access token has expired' },
        { status: 403 }
      );
    }

    // Check permission level
    const canEdit = sharedDeal.permission === 'edit';
    const canComment = ['comment', 'edit'].includes(sharedDeal.permission);

    return NextResponse.json({
      success: true,
      sharedDeal: {
        id: sharedDeal.id,
        sharedWithEmail: sharedDeal.sharedWithEmail,
        permission: sharedDeal.permission,
        canEdit,
        canComment,
        sharedBy: sharedDeal.sharedBy,
        createdAt: sharedDeal.createdAt,
        deal: {
          id: sharedDeal.deal.id,
          name: sharedDeal.deal.name,
          amount: sharedDeal.deal.amount,
          stage: sharedDeal.deal.stage,
          status: sharedDeal.deal.status,
          probability: sharedDeal.deal.probability,
          expectedCloseDate: sharedDeal.deal.expectedCloseDate,
          lastActivityAt: sharedDeal.deal.lastActivityAt,
          contacts: sharedDeal.deal.contacts,
          todos: sharedDeal.deal.todos,
          recentActivity: sharedDeal.deal.activityLogs.slice(0, 10),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching shared deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared deal' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sharing/public/:token/comment
 * Add comment to shared deal (if permission allows)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const accessToken = token;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Find shared deal by access token
    const sharedDeal = await prisma.sharedDeal.findUnique({
      where: { accessToken },
    });

    if (!sharedDeal) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 404 }
      );
    }

    // Check expiration
    if (sharedDeal.expiresAt && sharedDeal.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Access token has expired' },
        { status: 403 }
      );
    }

    // Check permission
    if (!['comment', 'edit'].includes(sharedDeal.permission)) {
      return NextResponse.json(
        { error: 'You do not have permission to comment' },
        { status: 403 }
      );
    }

    // For public comments, we create a system user
    // In production, this would be authenticated
    let user = await prisma.user.findFirst({
      where: { email: sharedDeal.sharedWithEmail },
    });

    if (!user) {
      // Create a temporary/external user record for the shared deal recipient
      user = await prisma.user.create({
        data: {
          email: sharedDeal.sharedWithEmail,
          name: sharedDeal.sharedWithEmail.split('@')[0],
          role: 'external',
        },
      });
    }

    // Create comment
    const comment = await prisma.collaborationComment.create({
      data: {
        dealId: sharedDeal.dealId,
        userId: user.id,
        content,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: sharedDeal.dealId,
        action: 'comment_added',
        description: `${user.name} commented: "${content.substring(0, 50)}..."`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: comment.id,
          content: comment.content,
          authorEmail: sharedDeal.sharedWithEmail,
          createdAt: comment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
