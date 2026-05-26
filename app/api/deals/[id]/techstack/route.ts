import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/deals/[id]/techstack
 * Get tech stack for a deal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);

    // Get existing tech stack
    const { data, error } = await supabase
      .from('deal_tech_stacks')
      .select('*')
      .eq('deal_id', dealId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If not found, create empty record
    if (!data) {
      const { data: newData, error: createError } = await supabase
        .from('deal_tech_stacks')
        .insert({
          deal_id: dealId,
          user_id: 1,
          idp: null,
          idp_status: 'current',
          google_stack: [],
          microsoft_stack: [],
          cloud_providers: [],
          other_products: [],
          notes: null
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create tech stack:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      return NextResponse.json(newData);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch tech stack:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech stack' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/deals/[id]/techstack
 * Update tech stack for a deal
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const body = await request.json();

    // Map camelCase from frontend to snake_case for database
    const updateData: any = {};

    if (body.idp !== undefined) updateData.idp = body.idp;
    if (body.idpStatus !== undefined) updateData.idp_status = body.idpStatus;
    if (body.googleStack !== undefined) updateData.google_stack = body.googleStack;
    if (body.microsoftStack !== undefined) updateData.microsoft_stack = body.microsoftStack;
    if (body.cloudProviders !== undefined) updateData.cloud_providers = body.cloudProviders;
    if (body.otherProducts !== undefined) updateData.other_products = body.otherProducts;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Update tech stack
    const { data, error } = await supabase
      .from('deal_tech_stacks')
      .update(updateData)
      .eq('deal_id', dealId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to update tech stack:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update tech stack';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
