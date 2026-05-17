import { NextRequest, NextResponse } from 'next/server';
import {
  searchCompanies,
  enrichCompanyByDomain,
  getCompanyContacts,
  CompanyData,
  ContactData,
} from '@/lib/apollo';

export async function POST(request: NextRequest) {
  try {
    const { query, domain } = await request.json();

    if (!query && !domain) {
      return NextResponse.json({ success: false, error: 'Query or domain required' }, { status: 400 });
    }

    let companyData: CompanyData | null = null;
    let contacts: ContactData[] = [];

    // Priority 1: Try to enrich by domain (most reliable)
    if (domain) {
      console.log(`🔍 Enriching company by domain: ${domain}`);
      companyData = await enrichCompanyByDomain(domain);
      if (companyData) {
        console.log(`✅ Found company by domain: ${companyData.name}`);
      }
    }

    // Priority 2: If no company found by domain, search by name
    if (!companyData && query) {
      console.log(`🔍 Searching for company by name: ${query}`);
      const results = await searchCompanies(query);
      if (results.length > 0) {
        companyData = results[0];
        console.log(`✅ Found company by name: ${companyData.name}`);
      } else {
        console.log(`❌ No company found for query: ${query}`);
      }
    }

    // Get contacts if we found a company
    if (companyData) {
      console.log(`📧 Fetching contacts for ${companyData.name}`);
      contacts = await getCompanyContacts(companyData.name, 5);
    }

    return NextResponse.json({
      success: !!companyData,
      company: companyData,
      contacts,
    });
  } catch (error) {
    console.error('Company enrichment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enrich company data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
