import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, TECH_STACK_PRODUCTS } from '@/lib/techStackProducts';

/**
 * GET /api/products?query=slack
 * Search and list tech stack products
 * Supports filtering by category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');

    let results = searchProducts(query);

    // Filter by category if provided
    if (category) {
      results = results.filter(p => p.category === category);
    }

    return NextResponse.json({
      success: true,
      query,
      category,
      count: results.length,
      products: results,
      categories: ['google', 'microsoft', 'cloud', 'other']
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
