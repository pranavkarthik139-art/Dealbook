# Tech Stack Feature - Complete Testing Guide

## ✅ Implementation Status

### What's Done
- ✅ **Database Schema**: `DealTechStack` model created in Prisma
- ✅ **API Endpoints**: Full CRUD operations for tech stack
- ✅ **Product Database**: 30+ predefined products including:
  - Google Stack (Workspace, GCP, etc.)
  - Microsoft Stack (Office 365, Azure, Entra ID, Intune, AD)
  - Cloud Providers (AWS, Azure, GCP, Oracle)
  - Other Products (Slack, Teams, Zoom, Workday, Jira, Confluence, etc.)
- ✅ **React Components**: 4 fully built components
  - TechStackOverview (main container)
  - StackSection (category management)
  - StackProductInput (autocomplete search)
  - IDPSelector (IDP selection)
- ✅ **Integration**: Component added to Deal Detail Page

### What's Integrated
The `TechStackOverview` component is now displayed on every deal detail page between:
- Company Enrichment section (above)
- Contacts/Stakeholders section (below)

---

## 🧪 Step-by-Step Testing Guide

### Test 1: Navigation & First Load
**Goal:** Verify component displays correctly on deal pages

1. Open your app and navigate to any deal
2. Scroll down past "Company Details" section
3. You should see **"📚 Tech Stack"** section
4. Verify it says "Track the customer's technology infrastructure"

**Expected Result:**
- Section displays with clean, minimal design
- No errors in browser console
- Loading state shows briefly then clears

---

### Test 2: IDP Selection
**Goal:** Test Identity Provider dropdown

1. In the Tech Stack section, find the "Identity Provider" dropdown
2. Click the dropdown
3. Select **"Okta"**
4. You should see two radio buttons appear:
   - "Current" (selected by default)
   - "Evaluating"
5. Click "🔍 Learn More" button
6. Should show a placeholder message about AI comparison (coming soon)

**Expected Result:**
- Dropdown works
- Radio buttons appear
- Learn More button is interactive
- Changes are visible immediately

---

### Test 3: Add Products (Google Stack)
**Goal:** Test adding and searching for products

1. Click the **"Google Stack"** tab
2. Section shows "No products added yet"
3. Click **"+ Add Product"** button
4. A search box appears with "Search products... (e.g., Workday, Slack)" placeholder
5. Type **"Workspace"** in search box
6. You should see "Google Workspace" appear in dropdown below
7. Click on "Google Workspace"
8. Product appears in the list with "Current" status selected

**Expected Result:**
- Search autocomplete works
- Product appears in list
- Can see product name and status
- Current/Evaluating radio buttons work

---

### Test 4: Toggle Product Status
**Goal:** Test changing product status

1. With Google Workspace in the list, click the **"Evaluating"** radio button
2. Product status should change immediately
3. Click **"Current"** again
4. Toggles back

**Expected Result:**
- Status toggles immediately
- No page refresh needed
- Visual feedback is clear

---

### Test 5: Remove Product
**Goal:** Test removing products

1. Hover over the Google Workspace product in the list
2. An **"✕"** button appears on the right
3. Click it
4. Product disappears from the list
5. Back to "No products added yet" message

**Expected Result:**
- Remove button appears on hover
- Clicking removes product immediately
- Clean removal without page refresh

---

### Test 6: Switch Between Tabs
**Goal:** Test tab navigation between stacks

1. Add Google Workspace to Google Stack (from Test 3)
2. Click **"Microsoft Stack"** tab
3. Shows "No products added yet"
4. Click **"+ Add Product"**
5. Type **"Azure"**
6. Select "Microsoft Azure" (you should see multiple Azure options)
7. Add it with "Current" status
8. Click **"Cloud"** tab
9. Should show "No products added yet"
10. Add **"AWS"**
11. Go back to **"Google Stack"** tab
12. Should still have "Google Workspace" there

**Expected Result:**
- Each tab maintains its own product list
- Switching tabs doesn't lose data
- Products persist in correct tabs

---

### Test 7: Other Products Tab
**Goal:** Test the "Other Products" tab with mixed products

1. Click **"Other Products"** tab
2. Add these products one by one:
   - Search "Slack" → Select "Slack" (Current)
   - Search "Work" → Select "Workday" (Evaluating)
   - Search "Jira" → Select "Jira" (Current)
   - Search "Confluence" → Select "Confluence" (Evaluating)
3. Your list should now have 4 products from different categories

**Expected Result:**
- Multiple products of different types can coexist
- Search finds products across categories
- All statuses display correctly

---

### Test 8: Notes & Save
**Goal:** Test the notes field and persistence

1. Scroll to the **"Notes"** field at the bottom
2. Type: "Mixed Google/Microsoft environment. Evaluating Azure migration in Q3. Using Slack for collab."
3. Click **"Save Changes"** button (should be blue/active)
4. Should see "Changes saved" or similar feedback
5. Refresh the page (F5)
6. Navigate back to the deal
7. Verify all products and notes still appear

**Expected Result:**
- Notes field accepts input
- Save button activates when changes made
- Data persists after refresh
- No unsaved changes warning

---

### Test 9: Cloud Providers Tab
**Goal:** Test cloud provider selection

1. Click **"Cloud"** tab
2. Add **"AWS"** with Current status
3. Add **"Azure"** with Current status  
4. Add **"Oracle Cloud"** with Evaluating status
5. Verify all three appear in the list

**Expected Result:**
- All cloud providers search correctly
- Multiple clouds can be selected
- Reflects real multi-cloud reality (from research)

---

### Test 10: Complete Real-World Scenario
**Goal:** Full end-to-end test with realistic data

**Setup:** Create/open a deal for "Acme Corp"

1. **IDP**: Select "Okta" (Current)
2. **Google Stack**: 
   - Google Workspace (Current)
   - Google Cloud Platform (Evaluating)
3. **Microsoft Stack**:
   - Office 365 (Current)
   - Azure (Current)
   - Entra ID (Current)
4. **Cloud**:
   - AWS (Current)
   - Azure (Current)
5. **Other Products**:
   - Slack (Current)
   - Workday (Current)
   - CrowdStrike (Current)
   - Jira (Evaluating)
   - Confluence (Evaluating)
6. **Notes**: "Modern enterprise stack. Google apps for productivity, Azure for infrastructure. Multi-cloud with AWS. Planning Jira/Confluence adoption for engineering team."
7. **Save**

**Expected Result:**
- All products appear in correct tabs
- Notes save successfully
- Page displays cleanly without clutter
- No console errors
- On refresh, all data persists

---

## 🎯 API Testing (Optional, for Advanced Testing)

### Test API Directly

**Get Tech Stack:**
```bash
curl http://localhost:3000/api/deals/1/techstack
```

**Update Tech Stack:**
```bash
curl -X PATCH http://localhost:3000/api/deals/1/techstack \
  -H "Content-Type: application/json" \
  -d '{
    "idp": "okta",
    "idpStatus": "current",
    "googleStack": [
      {"product": "Google Workspace", "status": "current"}
    ],
    "microsoftStack": [
      {"product": "Office 365", "status": "current"}
    ],
    "cloudProviders": [
      {"product": "AWS", "status": "current"}
    ],
    "otherProducts": [
      {"product": "Slack", "status": "current"}
    ],
    "notes": "Test notes"
  }'
```

**Search Products:**
```bash
curl "http://localhost:3000/api/products?query=slack"
curl "http://localhost:3000/api/products?query=&category=microsoft"
```

---

## ✔️ Testing Checklist

- [ ] Component renders on deal detail page
- [ ] IDP dropdown works
- [ ] IDP status toggles (Current/Evaluating)
- [ ] Learn More button exists (placeholder working)
- [ ] Product search autocompletes (tested with Workspace, Slack, Workday, etc.)
- [ ] Products add correctly to each tab
- [ ] Product status toggles work
- [ ] Product removal works
- [ ] Tab switching maintains data
- [ ] Notes field accepts input
- [ ] Save button saves changes
- [ ] Data persists on page refresh
- [ ] No console errors
- [ ] UI displays cleanly (no overflow, proper spacing)
- [ ] All 4 tabs work (Google, Microsoft, Cloud, Other)
- [ ] Multi-cloud selection works
- [ ] Mixed product types in Other tab work
- [ ] Complete real-world scenario works

---

## 🚨 Known Issues / Placeholders

1. **"Learn More" Button**: Shows placeholder text "AI-powered comparison feature coming soon"
   - This will be implemented in Phase 2
   - Currently just a visual affordance

2. **Auto-detection**: Not yet implemented
   - Will infer stack from email domains in Phase 2

3. **Analytics**: Not yet implemented
   - Will add stack prevalence dashboard in Phase 2

---

## 🎬 Demo Walkthrough (5 minutes)

If you want to show this to someone:

1. Open a deal with no tech stack (fresh deal)
2. Show that Tech Stack section is empty
3. Select Okta as IDP
4. Add Google Workspace and GCP
5. Switch to Microsoft tab, add Office 365 and Azure
6. Switch to Cloud tab, add AWS and Azure
7. Switch to Other tab, add Slack, Workday, Jira
8. Add notes: "Modern multi-cloud, hybrid on-prem/cloud"
9. Save
10. Show that everything persists
11. Mention that phase 2 will add AI comparison and analytics

---

## 📞 Support

If testing reveals issues:

1. **Check browser console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check network requests (Network tab)

2. **Check database** (if comfortable with it)
   - Run: `npx prisma studio`
   - Navigate to `DealTechStack` table
   - Verify data appears there

3. **Common issues**:
   - **Component doesn't show**: Check import in DealDetailView.tsx
   - **Search doesn't work**: Check `/api/products` endpoint
   - **Data doesn't save**: Check network tab for API errors
   - **Styling looks off**: Verify theme CSS variables are loaded

---

## 🚀 Ready to Deploy

Once all tests pass, this feature is ready for:
- ✅ Production deployment
- ✅ Team rollout
- ✅ Customer demo
- ✅ Integration with analytics (Phase 2)
