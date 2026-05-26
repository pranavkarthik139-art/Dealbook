import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const link = await prisma.link.findUnique({
      where: { publicToken: params.token },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Check if link is public
    if (!link.isPublic) {
      return NextResponse.json({ error: 'Link is not public' }, { status: 403 });
    }

    // Check expiration
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json(
        { error: 'Link has expired' },
        { status: 410 }
      );
    }

    // Update view count and last viewed time
    await prisma.link.update({
      where: { id: link.id },
      data: {
        viewCount: link.viewCount + 1,
        lastViewedAt: new Date(),
      },
    });

    // Return link info (but owner email is redacted for privacy)
    return NextResponse.json({
      title: link.title,
      url: link.url,
      description: link.description,
      category: link.category,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    console.error('Error fetching public link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    );
  }
}
