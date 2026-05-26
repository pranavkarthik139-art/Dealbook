/**
 * Predefined tech stack products for autocomplete and validation
 */

export const TECH_STACK_PRODUCTS = {
  google: {
    workspace: "Google Workspace",
    gcp: "Google Cloud Platform",
    workspace_idm: "Google Workspace Identity",
  },
  microsoft: {
    office365: "Microsoft Office 365",
    azure: "Microsoft Azure",
    entra: "Microsoft Entra ID",
    intune: "Microsoft Intune",
    ad_onprem: "Active Directory (On-Prem)",
    ad_hybrid: "Active Directory (Hybrid)",
  },
  cloud: {
    aws: "Amazon Web Services",
    azure: "Microsoft Azure",
    gcp: "Google Cloud Platform",
    oracle: "Oracle Cloud",
    other: "Other Cloud Provider",
  },
  idp: {
    okta: "Okta",
    jumpcloud: "JumpCloud",
    ping: "Ping Identity",
    auth0: "Auth0",
    custom: "Custom/Other",
  },
  other: {
    // Collaboration
    slack: "Slack",
    teams: "Microsoft Teams",
    zoom: "Zoom",

    // HRMS
    workday: "Workday",
    successfactors: "SAP SuccessFactors",
    bamboohr: "BambooHR",
    guidepoint: "Guidepoint",
    rippling: "Rippling",
    lattice: "Lattice",

    // CRM/Sales
    salesforce: "Salesforce",
    hubspot: "HubSpot",

    // Support/Service
    zendesk: "Zendesk",

    // Project Management
    jira: "Jira",
    confluence: "Confluence",
    asana: "Asana",
    monday: "Monday.com",

    // Security
    crowdstrike: "CrowdStrike",
    sentinelone: "SentinelOne",
    falcon: "CrowdStrike Falcon",

    // VPN/Network
    cisco: "Cisco",
    fortinet: "Fortinet",
    palo_alto: "Palo Alto Networks",

    // Enterprise
    sap: "SAP",
    oracle_db: "Oracle Database",

    // Other
    other: "Other",
  },
};

/**
 * Flat list of all products with categories for search
 */
export const PRODUCTS_FLAT = [
  // Google
  { id: "workspace", name: "Google Workspace", category: "google", section: "Google Stack" },
  { id: "gcp", name: "Google Cloud Platform", category: "google", section: "Google Stack" },
  { id: "workspace_idm", name: "Google Workspace Identity", category: "google", section: "Google Stack" },

  // Microsoft
  { id: "office365", name: "Microsoft Office 365", category: "microsoft", section: "Microsoft Stack" },
  { id: "azure", name: "Microsoft Azure", category: "microsoft", section: "Microsoft Stack" },
  { id: "entra", name: "Microsoft Entra ID", category: "microsoft", section: "Microsoft Stack" },
  { id: "intune", name: "Microsoft Intune", category: "microsoft", section: "Microsoft Stack" },
  { id: "ad_onprem", name: "Active Directory (On-Prem)", category: "microsoft", section: "Microsoft Stack" },
  { id: "ad_hybrid", name: "Active Directory (Hybrid)", category: "microsoft", section: "Microsoft Stack" },

  // Cloud
  { id: "aws", name: "Amazon Web Services", category: "cloud", section: "Cloud Providers" },
  { id: "gcp_cloud", name: "Google Cloud Platform", category: "cloud", section: "Cloud Providers" },
  { id: "azure_cloud", name: "Microsoft Azure", category: "cloud", section: "Cloud Providers" },
  { id: "oracle", name: "Oracle Cloud", category: "cloud", section: "Cloud Providers" },

  // Other - Collaboration
  { id: "slack", name: "Slack", category: "other", section: "Other Products" },
  { id: "teams", name: "Microsoft Teams", category: "other", section: "Other Products" },
  { id: "zoom", name: "Zoom", category: "other", section: "Other Products" },

  // Other - HRMS
  { id: "workday", name: "Workday", category: "other", section: "Other Products" },
  { id: "successfactors", name: "SAP SuccessFactors", category: "other", section: "Other Products" },
  { id: "bamboohr", name: "BambooHR", category: "other", section: "Other Products" },
  { id: "rippling", name: "Rippling", category: "other", section: "Other Products" },
  { id: "lattice", name: "Lattice", category: "other", section: "Other Products" },

  // Other - CRM/Sales
  { id: "salesforce", name: "Salesforce", category: "other", section: "Other Products" },
  { id: "hubspot", name: "HubSpot", category: "other", section: "Other Products" },

  // Other - Support
  { id: "zendesk", name: "Zendesk", category: "other", section: "Other Products" },

  // Other - Project Management
  { id: "jira", name: "Jira", category: "other", section: "Other Products" },
  { id: "confluence", name: "Confluence", category: "other", section: "Other Products" },
  { id: "asana", name: "Asana", category: "other", section: "Other Products" },
  { id: "monday", name: "Monday.com", category: "other", section: "Other Products" },

  // Other - Security
  { id: "crowdstrike", name: "CrowdStrike", category: "other", section: "Other Products" },
  { id: "sentinelone", name: "SentinelOne", category: "other", section: "Other Products" },
  { id: "falcon", name: "CrowdStrike Falcon", category: "other", section: "Other Products" },

  // Other - Network/VPN
  { id: "cisco", name: "Cisco", category: "other", section: "Other Products" },
  { id: "fortinet", name: "Fortinet", category: "other", section: "Other Products" },
  { id: "palo_alto", name: "Palo Alto Networks", category: "other", section: "Other Products" },

  // Other - Enterprise
  { id: "sap", name: "SAP", category: "other", section: "Other Products" },
  { id: "oracle_db", name: "Oracle Database", category: "other", section: "Other Products" },
];

/**
 * Search products by query
 */
export function searchProducts(query: string): typeof PRODUCTS_FLAT {
  if (!query.trim()) return PRODUCTS_FLAT;

  const lowerQuery = query.toLowerCase();
  return PRODUCTS_FLAT.filter(
    product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get product name by ID
 */
export function getProductName(id: string): string | null {
  const product = PRODUCTS_FLAT.find(p => p.id === id);
  return product ? product.name : null;
}

/**
 * Get category for a product ID
 */
export function getProductCategory(id: string): string | null {
  const product = PRODUCTS_FLAT.find(p => p.id === id);
  return product ? product.category : null;
}
