import { NextRequest, NextResponse } from 'next/server';
import { enrichDealData } from '@/lib/apollo';

export async function POST(req: NextRequest) {
  try {
    const { email, companyName } = await req.json();

    if (!email && !companyName) {
      return NextResponse.json(
        { error: 'Email or company name is required' },
        { status: 400 }
      );
    }

    const enrichedData = await enrichDealData(email, companyName);

    return NextResponse.json({
      success: true,
      data: enrichedData,
    });
  } catch (error) {
    console.error('Enrichment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enrich data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
