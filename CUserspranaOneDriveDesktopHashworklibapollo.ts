import axios from 'axios';

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_API_BASE = 'https://api.apollo.io/v1';

export interface ApolloCompany {
  name?: string;
  industry?: string;
  size?: string;
  website?: string;
  founded_year?: number;
  linkedin_url?: string;
}

export interface ApolloContact {
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  phone_number?: string;
}

export interface EnrichedDealData {
  companyName?: string;
  companyIndustry?: string;
  companySize?: string;
  companyWebsite?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  contactLinkedIn?: string;
}

/**
 * Search for a contact by email using Apollo.io API
 */
export async function searchContactByEmail(email: string): Promise<ApolloContact | null> {
  if (!APOLLO_API_KEY || !email) {
    return null;
  }

  try {
    const response = await axios.post(
      `${APOLLO_API_BASE}/contacts/search`,
      {
        email_addresses: [email],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        params: {
          api_key: APOLLO_API_KEY,
        },
      }
    );

    const contacts = response.data?.contacts || [];
    if (contacts.length > 0) {
      const contact = contacts[0];
      return {
        first_name: contact.first_name,
        last_name: contact.last_name,
        title: contact.title,
        email: contact.email,
        linkedin_url: contact.linkedin_url,
        phone_number: contact.phone_number,
      };
    }

    return null;
  } catch (error) {
    console.error('Apollo contact search error:', error);
    return null;
  }
}

/**
 * Search for a company by name or domain using Apollo.io API
 */
export async function searchCompanyByName(companyName: string): Promise<ApolloCompany | null> {
  if (!APOLLO_API_KEY || !companyName) {
    return null;
  }

  try {
    const response = await axios.post(
      `${APOLLO_API_BASE}/companies/search`,
      {
        q_organization_name: companyName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        params: {
          api_key: APOLLO_API_KEY,
        },
      }
    );

    const companies = response.data?.organizations || [];
    if (companies.length > 0) {
      const company = companies[0];
      return {
        name: company.name,
        industry: company.industry,
        size: company.organization_size_category || company.estimated_num_employees?.toString(),
        website: company.website_url,
        founded_year: company.founded_year,
        linkedin_url: company.linkedin_url,
      };
    }

    return null;
  } catch (error) {
    console.error('Apollo company search error:', error);
    return null;
  }
}

/**
 * Enrich deal data by searching Apollo for contact and company info
 */
export async function enrichDealData(
  email: string,
  companyName?: string
): Promise<EnrichedDealData> {
  const enriched: EnrichedDealData = {};

  try {
    // Search for contact by email
    const contact = await searchContactByEmail(email);
    if (contact) {
      enriched.contactFirstName = contact.first_name;
      enriched.contactLastName = contact.last_name;
      enriched.contactTitle = contact.title;
      enriched.contactLinkedIn = contact.linkedin_url;

      // If we don't have a company name, try to extract from email domain
      if (!companyName && contact.email) {
        const domain = contact.email.split('@')[1];
        if (domain && domain !== 'gmail.com' && domain !== 'yahoo.com' && domain !== 'outlook.com') {
          companyName = domain.split('.')[0];
        }
      }
    }

    // Search for company info
    if (companyName) {
      const company = await searchCompanyByName(companyName);
      if (company) {
        enriched.companyName = company.name || companyName;
        enriched.companyIndustry = company.industry;
        enriched.companySize = company.size;
        enriched.companyWebsite = company.website;
      }
    }

    return enriched;
  } catch (error) {
    console.error('Error enriching deal data:', error);
    return enriched;
  }
}

/**
 * Batch search for multiple contacts/companies
 */
export async function batchEnrichDealData(
  email: string,
  companyName?: string,
  contactName?: string
): Promise<EnrichedDealData> {
  // For now, just use the single enrichment
  // In the future, this could do parallel requests
  return enrichDealData(email, companyName);
}
