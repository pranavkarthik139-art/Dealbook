import { prisma } from '@/lib/db';
import { detectStall } from '@/lib/dealHealth';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build where clause based on role
    let whereClause: any = { userId: parseInt(user.id) };

    // Managers and admins can see all deals
    if (user.role === 'presales_lead' || user.role === 'admin') {
      whereClause = {};
    }

    // OPTIMIZED: Only fetch essential deal data, no related records
    const deals = await prisma.deal.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        amount: true,
        status: true,
        stage: true,
        probability: true,
        expectedCloseDate: true,
        createdAt: true,
        updatedAt: true,
        lastActivityAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Add pagination limit
    });

    const dealsWithMetadata = deals.map((deal) => {
      const stall = detectStall({
        id: deal.id,
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
        lastActivityAt: deal.lastActivityAt?.toISOString() || null,
        status: deal.status || undefined,
        stage: deal.stage || undefined,
      });

      return {
        ...deal,
        amount: deal.amount ? parseFloat(deal.amount.toString()) : null,
        stall,
      };
    });

    const summary = {
      total: deals.length,
      active: deals.filter((d) => d.status === 'active').length,
      closed: deals.filter((d) => d.status === 'closed').length,
      onHold: deals.filter((d) => d.status === 'on_hold').length,
      lost: deals.filter((d) => d.status === 'lost').length,
      stallCritical: dealsWithMetadata.filter((d) => d.stall.risk === 'critical').length,
      stallWarning: dealsWithMetadata.filter((d) => d.stall.risk === 'warning').length,
    };

    return NextResponse.json({ deals: dealsWithMetadata, summary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      company,
      email,
      amount,
      status = 'active',
      stage = 'demo',
      leadSource,
      closeDate,
      // Enriched contact data
      contactFirstName,
      contactLastName,
      contactTitle,
      contactLinkedIn,
      // Enriched company data
      companyIndustry,
      companySize,
      companyWebsite,
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Deal name is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Contact email is required' },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Deal amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create deal
    const deal = await prisma.deal.create({
      data: {
        userId: user.id,
        name,
        email: email || null,
        amount: parseFloat(amount),
        status,
        stage,
        leadSource: leadSource || null,
        expectedCloseDate: closeDate ? new Date(closeDate) : null,
      },
    });

    // Create primary contact with the provided email and enriched data
    const contactName = contactFirstName && contactLastName
      ? `${contactFirstName} ${contactLastName}`
      : (contactFirstName || contactLastName || company || name);

    await prisma.contact.create({
      data: {
        userId: user.id,
        dealId: deal.id,
        name: contactName,
        email: email,
        title: contactTitle || null,
        company: company || null,
        linkedinUrl: contactLinkedIn || null,
        role: 'decision_maker', // Default role for first contact
      },
    });

    // Log activity with enriched data
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        dealId: deal.id,
        action: 'deal_created',
        description: `Deal "${name}" created for ${company || 'Unknown Company'} - ${contactName}`,
        metadata: {
          company: company || null,
          email: email,
          amount: amount,
          // Enriched contact data
          contactFirstName: contactFirstName || null,
          contactLastName: contactLastName || null,
          contactTitle: contactTitle || null,
          contactLinkedIn: contactLinkedIn || null,
          // Enriched company data
          companyIndustry: companyIndustry || null,
          companySize: companySize || null,
          companyWebsite: companyWebsite || null,
        },
      },
    });

    const dealWithNumber = {
      ...deal,
      amount: deal.amount ? parseFloat(deal.amount.toString()) : null,
    };

    return NextResponse.json(dealWithNumber, { status: 201 });
  } catch (error) {
    console.error('❌ ERROR creating deal:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to create deal', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
