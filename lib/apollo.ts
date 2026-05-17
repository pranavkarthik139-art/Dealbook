export interface CompanyData {
  id: string;
  name: string;
  domain: string;
  website: string;
  industry: string;
  subIndustry?: string;
  employeeCount?: number;
  employeeCountRange?: string;
  fundingStatus?: string;
  fundingAmount?: number;
  fundingStage?: string;
  lastRaisedAmount?: number;
  lastRaisedDate?: string;
  headquarters?: {
    city?: string;
    state?: string;
    country?: string;
  };
  logoUrl?: string;
  description?: string;
  linkedinUrl?: string;
  technologies?: string[];
  yearFounded?: number;
  revenueRange?: string;
  estimatedRevenue?: number;
}

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  linkedinUrl?: string;
  company?: string;
}

export interface ApolloSearchResult {
  company: CompanyData;
  contacts: ContactData[];
}

const APOLLO_API_BASE = 'https://api.apollo.io/api/v1';
const API_KEY = process.env.APOLLO_API_KEY;

async function makeApolloRequest(endpoint: string, body: any) {
  if (!API_KEY) {
    throw new Error('Apollo API key not configured');
  }

  try {
    const response = await fetch(`${APOLLO_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Apollo API error: ${response.status}`, await response.text());
      throw new Error(`Apollo API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Apollo API request failed:', error);
    throw error;
  }
}

export async function searchCompanies(query: string): Promise<CompanyData[]> {
  try {
    const response = await makeApolloRequest('/organizations/search', {
      q_organization_name: query,
      page: 1,
      per_page: 10,
    });

    return response.organizations || [];
  } catch (error) {
    console.error('Failed to search companies:', error);
    return [];
  }
}

export async function enrichCompanyByDomain(domain: string): Promise<CompanyData | null> {
  try {
    const response = await makeApolloRequest('/organizations/match', {
      domain: domain,
    });

    if (response.organization) {
      return mapApolloCompanyData(response.organization);
    }
    return null;
  } catch (error) {
    console.error('Failed to enrich company by domain:', error);
    return null;
  }
}

export async function getCompanyContacts(
  companyName: string,
  limit: number = 5
): Promise<ContactData[]> {
  try {
    const response = await makeApolloRequest('/contacts/search', {
      q_organization_name: companyName,
      page: 1,
      per_page: limit,
    });

    return (response.contacts || []).map((contact: any) => ({
      id: contact.id,
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      email: contact.email,
      phone: contact.phone_numbers?.[0],
      title: contact.title,
      linkedinUrl: contact.linkedin_url,
      company: contact.organization_name,
    }));
  } catch (error) {
    console.error('Failed to get company contacts:', error);
    return [];
  }
}

function mapApolloCompanyData(data: any): CompanyData {
  return {
    id: data.id,
    name: data.name,
    domain: data.domain,
    website: data.website_url || data.domain,
    industry: data.industry,
    subIndustry: data.sub_industry,
    employeeCount: data.employee_count,
    employeeCountRange: data.employee_count_range || data.estimated_num_employees,
    fundingStatus: data.funding_status,
    fundingAmount: data.total_funding || data.funding_amount,
    fundingStage: data.latest_funding_stage || data.funding_stage,
    lastRaisedAmount: data.latest_funding_amount,
    lastRaisedDate: data.latest_funding_date,
    headquarters: {
      city: data.headquarters_city,
      state: data.headquarters_state,
      country: data.headquarters_country,
    },
    logoUrl: data.logo_url,
    description: data.short_description,
    linkedinUrl: data.linkedin_url,
    technologies: data.technologies || [],
    yearFounded: data.year_founded,
    revenueRange: data.annual_revenue_range,
    estimatedRevenue: data.estimated_annual_revenue,
  };
}
