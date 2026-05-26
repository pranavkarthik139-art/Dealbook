# Tech Stack Intelligence Feature

## Overview
The Tech Stack Intelligence feature enables Sales Engineers and Account Executives to track and manage customer technology infrastructure within deal details. This provides critical context for deal positioning, resource planning, and competitive analysis.

## What Was Built

### 1. Database Schema
- **Model:** `DealTechStack`
- **Location:** `prisma/schema.prisma`
- **Fields:**
  - `idp`: Identity Provider (Okta, JumpCloud, Ping, Auth0, Custom, or null)
  - `idpStatus`: Current or Evaluating
  - `googleStack`: Array of Google products
  - `microsoftStack`: Array of Microsoft products
  - `cloudProviders`: Array of cloud providers (AWS, Azure, GCP, etc.)
  - `otherProducts`: Array of other enterprise products (Slack, Workday, etc.)
  - `notes`: Global notes for the entire tech stack

### 2. API Endpoints

#### GET `/api/deals/[id]/techstack`
Retrieves the tech stack for a specific deal. Creates a default empty stack if none exists.

```bash
curl GET /api/deals/123/techstack
```

Response:
```json
{
  "id": 1,
  "dealId": 123,
  "idp": "okta",
  "idpStatus": "current",
  "googleStack": [
    { "product": "Google Workspace", "status": "current" },
    { "product": "Google Cloud Platform", "status": "evaluating" }
  ],
  "microsoftStack": [],
  "cloudProviders": [
    { "product": "Amazon Web Services", "status": "current" }
  ],
  "otherProducts": [
    { "product": "Slack", "status": "current" }
  ],
  "notes": "Mixed cloud environment, planning GCP migration..."
}
```

#### PATCH `/api/deals/[id]/techstack`
Updates the tech stack for a deal.

```bash
curl PATCH /api/deals/123/techstack \
  -H "Content-Type: application/json" \
  -d '{
    "idp": "okta",
    "idpStatus": "current",
    "googleStack": [
      { "product": "Google Workspace", "status": "current" }
    ],
    "notes": "Updated notes..."
  }'
```

#### GET `/api/products?query=slack&category=other`
Searches for products in the predefined list. Supports:
- `query`: Product name to search for (autocomplete)
- `category`: Filter by category (google, microsoft, cloud, other)

Response:
```json
{
  "success": true,
  "query": "slack",
  "products": [
    {
      "id": "slack",
      "name": "Slack",
      "category": "other",
      "section": "Other Products"
    }
  ]
}
```

### 3. React Components

#### `<TechStackOverview />`
**File:** `components/deals/TechStackOverview.tsx`

Main container component displayed on deal detail page. Features:
- Tabbed interface (Google, Microsoft, Cloud, Other)
- IDP selector at top
- Product management (add/remove/toggle status)
- Global notes field
- Save changes button

**Usage:**
```tsx
<TechStackOverview dealId={dealId} onUpdate={(data) => console.log(data)} />
```

#### `<StackSection />`
**File:** `components/deals/StackSection.tsx`

Displays products for a single category (Google/Microsoft/Cloud/Other). Supports:
- List of products with Current/Evaluating status
- Add/remove products
- Toggle product status
- Dynamic product search

#### `<StackProductInput />`
**File:** `components/deals/StackProductInput.tsx`

Autocomplete product search with:
- Real-time product search via `/api/products`
- Current/Evaluating status toggle
- Product selection from dropdown

#### `<IDPSelector />`
**File:** `components/deals/IDPSelector.tsx`

Identity Provider selector with:
- Dropdown of 5 predefined IDPs + Custom/Not Using
- Current/Evaluating status toggle
- "Learn More" button (placeholder for AI comparison feature)

### 4. Predefined Products List
**File:** `lib/techStackProducts.ts`

Contains:
- **Google:** Workspace, GCP, Workspace IDM
- **Microsoft:** Office 365, Azure, Entra ID, Intune, AD (On-Prem/Hybrid)
- **Cloud:** AWS, Azure, GCP, Oracle, Other
- **IDP:** Okta, JumpCloud, Ping, Auth0, Custom
- **Other:** 30+ products including:
  - Collaboration: Slack, Teams, Zoom
  - HRMS: Workday, SuccessFactors, BambooHR, etc.
  - CRM: Salesforce, HubSpot
  - Security: CrowdStrike, SentinelOne
  - And more...

Utilities:
- `searchProducts(query)`: Search products by name
- `getProductName(id)`: Get product name by ID
- `getProductCategory(id)`: Get category for a product

---

## Integration with Deal Detail Page

Add this to your deal detail page (`app/deals/[id]/page.tsx`):

```tsx
import { TechStackOverview } from '@/components/deals/TechStackOverview';

export default function DealDetail({ params }: { params: { id: string } }) {
  const dealId = parseInt(params.id);

  return (
    <div>
      {/* ... existing content ... */}
      
      {/* Add Tech Stack Section after deal info */}
      <TechStackOverview 
        dealId={dealId} 
        onUpdate={(data) => {
          console.log('Tech stack updated:', data);
          // Optional: refresh other components
        }}
      />

      {/* ... rest of content ... */}
    </div>
  );
}
```

---

## Design Details

### UI/UX
- **Colors:** Minimal, uses existing design system (Paper, Ink, Cobalt, Line)
- **No bright colors** - professional, clean appearance
- **Tabs:** Modern tabbed interface like browser tabs
- **Interactive:** Smooth transitions, clear hover states
- **Responsive:** Works on all screen sizes

### Workflow
1. User opens deal detail page
2. Scrolls to Tech Stack section
3. Selects Identity Provider from dropdown
4. Clicks tab to view/edit that category
5. Searches for product (e.g., "Workday" → autocomplete)
6. Selects product and toggles Current/Evaluating status
7. Can remove product by clicking X button
8. Adds notes about the stack
9. Clicks "Save Changes" to persist

---

## Data Storage

Each deal has **at most one** `DealTechStack` record with:
- Single IDP (Okta, JumpCloud, or Custom)
- Multiple products per category (array of objects with product name + status)
- Single notes field for entire stack
- Automatically created on first fetch if doesn't exist

---

## Future Enhancements

### Phase 2: AI Comparison
- "Learn More" button triggers AI analysis
- Compare customer's current IDP vs. alternatives
- Show feature differences, pros/cons
- Suggest migration paths

### Phase 3: Analytics
- Dashboard: Stack prevalence across all deals
- Track which stacks are most common
- Filter deals by tech stack
- Report: HRMS distribution, cloud provider adoption, etc.

### Phase 4: Auto-Detection
- Infer stack from email domains (gmail.com → Google, outlook.com → Microsoft)
- Detect from contact's company domain
- Suggest products based on industry/company size

### Phase 5: Integrations
- Sync with Salesforce CRM
- Connect to LinkedIn for company tech stack research
- API integrations for real-time stack detection

---

## Testing

### Manual Testing Steps
1. Create a new deal
2. Navigate to deal detail page
3. Scroll to Tech Stack section
4. Select "Okta" as IDP
5. Click "Google Stack" tab
6. Search for "Workspace" in product search
7. Select "Google Workspace" with "Current" status
8. Add another product (GCP with "Evaluating")
9. Click "Other Products" tab
10. Search for "Workday"
11. Select and save
12. Verify all products display correctly
13. Edit notes and save
14. Refresh page and verify data persists

### API Testing
```bash
# Get tech stack
curl http://localhost:3000/api/deals/1/techstack

# Update tech stack
curl -X PATCH http://localhost:3000/api/deals/1/techstack \
  -H "Content-Type: application/json" \
  -d '{
    "idp": "okta",
    "googleStack": [
      {"product": "Google Workspace", "status": "current"}
    ]
  }'

# Search products
curl http://localhost:3000/api/products?query=slack
curl http://localhost:3000/api/products?query=&category=microsoft
```

---

## Files Created

1. **Database:**
   - `prisma/schema.prisma` - Added DealTechStack model

2. **Backend:**
   - `app/api/deals/[id]/techstack/route.ts` - Tech stack API
   - `app/api/products/route.ts` - Product search API
   - `lib/techStackProducts.ts` - Predefined products list

3. **Frontend Components:**
   - `components/deals/TechStackOverview.tsx` - Main container
   - `components/deals/StackSection.tsx` - Category section
   - `components/deals/StackProductInput.tsx` - Product search
   - `components/deals/IDPSelector.tsx` - IDP selector

---

## Next Steps

1. ✅ Database schema created
2. ✅ API endpoints implemented
3. ✅ React components built
4. ⏳ Integrate into deal detail page (next)
5. ⏳ Test end-to-end
6. ⏳ Add analytics dashboard
7. ⏳ Implement AI comparison feature

