import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/sharing - List all shared deals
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sharedDeals = await prisma.sharedDeal.findMany({
      where: {
        sharedByUserId: user.id,
      },
      include: {
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
            stage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      sharedDeals: sharedDeals.map((sd) => ({
        id: sd.id,
        deal: sd.deal,
        sharedWithEmail: sd.sharedWithEmail,
        permission: sd.permission,
        accessToken: sd.accessToken,
        isPublic: sd.isPublic,
        expiresAt: sd.expiresAt,
        createdAt: sd.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching shared deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared deals' },
      { status: 500 }
    );
  }
}

// POST /api/sharing - Share a deal
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dealId, sharedWithEmail, permission = 'view', expiresAt } = body;

    if (!dealId || !sharedWithEmail) {
      return NextResponse.json(
        { error: 'dealId and sharedWithEmail are required' },
        { status: 400 }
      );
    }

    // Verify deal ownership
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal || deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check if already shared with this email
    const existing = await prisma.sharedDeal.findUnique({
      where: {
        dealId_sharedWithEmail: {
          dealId,
          sharedWithEmail,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Deal is already shared with this email' },
        { status: 400 }
      );
    }

    // Generate unique access token
    const accessToken = crypto.randomBytes(32).toString('hex');

    const sharedDeal = await prisma.sharedDeal.create({
      data: {
        dealId,
        sharedByUserId: user.id,
        sharedWithEmail,
        permission,
        accessToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isPublic: false,
      },
      include: {
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
            stage: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId,
        action: 'deal_shared',
        description: `Deal shared with ${sharedWithEmail}`,
        metadata: {
          sharedWithEmail,
          permission,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        sharedDeal: {
          id: sharedDeal.id,
          deal: sharedDeal.deal,
          sharedWithEmail: sharedDeal.sharedWithEmail,
          permission: sharedDeal.permission,
          accessToken: sharedDeal.accessToken,
          expiresAt: sharedDeal.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sharing deal:', error);
    return NextResponse.json(
      { error: 'Failed to share deal' },
      { status: 500 }
    );
  }
}
