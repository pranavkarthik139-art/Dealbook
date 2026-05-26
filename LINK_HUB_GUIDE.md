# 📎 Link Hub - Feature Guide

## Overview
Link Hub is a centralized link management system that lets you save, organize, and share both internal reference links and public-facing links with easy copy-to-clipboard functionality.

## Key Features

### 1. **Link Management**
- **Create Links**: Save URLs with title, description, and category
- **Edit Links**: Update link details anytime
- **Delete Links**: Remove links you no longer need
- **Organize**: Categorize links (general, sales, technical, legal, financial, other)

### 2. **Link Types**
- **🔒 Internal Links**: Private team references (legal docs, technical guides, internal wikis)
- **🔓 Public Links**: Shareable with prospects/clients (demos, resources, guides)
  - Automatic public token generation
  - Optional expiration dates for temporary access

### 3. **Easy Copy**
- **One-Click Copy**: Copy any link URL to clipboard instantly
- **Copy Tracking**: System tracks how many times each link was copied
- **Timestamp**: Last copied time shown on each card
- **Toast Notification**: Visual feedback when link is copied

### 4. **Search & Filter**
- **Full-Text Search**: Search by title, description, or URL
- **Type Filter**: Show internal, public, or all links
- **Category Filter**: Group links by category
- **Real-Time Results**: Instant filtering as you type

### 5. **Analytics**
- **Copy Count**: See how many times a link has been copied (useful for measuring engagement)
- **View Count**: For public links, track how many times they've been viewed
- **Usage Timestamps**: Know when links were last copied/viewed
- **Dashboard Stats**: Total links, public count, total copies at a glance

### 6. **Public Link Sharing**
- **Shareable Tokens**: Generate short, shareable links for external distribution
- **Expiration Dates**: Set optional expiration times (e.g., "Demo link valid until Friday")
- **Access Control**: Non-public links cannot be accessed via public token
- **Public Endpoint**: `/api/links/public/[token]` for external access

## How to Use

### Creating a Link

1. Click **"+ New Link"** button in the top right
2. Fill in the details:
   - **Title**: What this link is for (e.g., "Sales Demo Deck")
   - **URL**: The actual link (e.g., https://docs.google.com/presentation/...)
   - **Description** (optional): Notes about the link
   - **Category**: Choose or use default
   - **Link Type**: Internal or Public
3. If making it Public, optionally set an expiration date
4. Click **"Save Link"**

### Copying a Link

1. Find the link in your list
2. Click the **"Copy"** button on the card
3. Link is copied to clipboard - you'll see visual confirmation
4. Paste anywhere (email, Slack, documents, etc.)

### Sharing Public Links

1. Create a link and mark it as **"🔓 Public"**
2. Check the **"Generate shareable link"** checkbox
3. A public token is automatically created
4. Share the generated token/URL with prospects
5. They can access the link metadata without knowing your dashboard

### Filtering & Searching

**Search**: Type keywords in the search box to find links by:
- Title: "Sales"
- Description: "contract"
- URL: "docs.google.com"

**Filter by Type**:
- "All Types" - Show everything
- "🔒 Internal Only" - Team references only
- "🔓 Public Only" - Shareable links only

**Filter by Category**:
- Select a category to narrow down results
- "All Categories" to show all

## Use Cases

### Sales Team
- **Demo Links**: Sales decks, product demos, trial sign-ups
- **Collateral**: One-pagers, case studies, pricing pages
- **Internal Resources**: Sales playbooks, objection handling guides
- **Public Sharing**: Send demo links to prospects with expiration dates

### Presales/Solutions Engineering
- **Technical Resources**: Architecture diagrams, API docs, GitHub repos
- **POC Guides**: Setup instructions, configuration examples
- **Reference Materials**: Compliance docs, security information, SLAs
- **Public: Sharing**: Share docs with clients during evaluation phase

### Leadership/Managers
- **Team Resources**: Onboarding guides, training materials, processes
- **External**: Marketing assets, company information, media kit
- **Governance**: Policies, procedures, compliance documents
- **Decision Tracking**: Know which links are most accessed (via copy count)

### Marketing
- **Campaign Links**: Landing pages, webinar registrations, resource centers
- **Shareable Assets**: Ebooks, whitepapers, benchmarks (with expiration)
- **Lead Magnets**: Gated content, demos, trials
- **Track Usage**: See how often links are copied/accessed

## API Endpoints

### List/Create Links
- **GET** `/api/links` - List all user's links (with filters)
  - Query params: `?category=sales&type=internal&search=demo`
- **POST** `/api/links` - Create new link

### Link Operations
- **GET** `/api/links/[id]` - Get single link
- **PATCH** `/api/links/[id]` - Update link
- **DELETE** `/api/links/[id]` - Delete link

### Copy Tracking
- **POST** `/api/links/[id]/copy` - Increment copy count & update timestamp

### Public Access
- **GET** `/api/links/public/[token]` - Access public link (no auth required)

## Database Schema

```prisma
model Link {
  id              Int       @id @default(autoincrement())
  userId          Int       @map("user_id")

  title           String    @db.VarChar(255)
  url             String    @db.Text
  description     String?   @db.Text
  category        String    @default("general")
  linkType        String    // 'internal', 'public'

  isPublic        Boolean   @default(false)
  publicToken     String?   @unique
  expiresAt       DateTime? 

  copyCount       Int       @default(0)
  viewCount       Int       @default(0)
  lastCopiedAt    DateTime?
  lastViewedAt    DateTime?

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Features Breakdown

### 📊 Analytics
- **Copy Count**: How many times the link was copied
- **View Count**: For public links, how many times accessed
- **Last Copied**: Timestamp of most recent copy
- **Last Viewed**: Timestamp of most recent public view
- **Trending**: (Future) See which links are most used

### 🔐 Security
- **Private by Default**: Links are internal unless explicitly marked public
- **Ownership Check**: Users can only see/edit their own links
- **Public Token**: Unique, obfuscated token for sharing (not exposed in UI)
- **Expiration**: Optional time-based access control for public links
- **Access Control**: Public links can't be modified by non-owners

### 🎯 Organization
- **Categories**: 6 default categories (general, sales, technical, legal, financial, other)
- **Custom Categories**: (Future) Create your own categories
- **Tags**: (Future) Add multiple tags per link
- **Collections**: (Future) Group related links together

### 🚀 Future Enhancements
- Bulk import from bookmarks/browser
- Link preview (og:image, title, description)
- Custom short URLs (branded links)
- Link expiration with auto-delete
- Duplicate detection
- Usage reports/dashboards
- Team sharing (share collections with team members)
- Notifications (link about to expire)
- Link validation (test if URLs are still alive)
- Rich link preview in chat/Slack integrations

## Integration Opportunities

### Slack Bot
```
/link save "Title" https://url.com -category sales -public
/link search "keyword"
/link copy "link-id"
```

### Email Integration
- Email a link to save it (forward to email address)
- Get link suggestions in email templates

### Deal Context
- Link links to specific deals
- Share deal-related links in deal timeline
- Suggest relevant links when viewing deals

### Chrome Extension
- Right-click → Save to Link Hub
- Quick access to links from any page
- One-click paste functionality

## Tips & Best Practices

### Organization
1. **Be Descriptive**: Use clear titles so you can find links quickly
2. **Add Descriptions**: Explain why this link matters for future reference
3. **Use Categories**: Don't let everything be "general"
4. **Name Consistently**: Follow naming conventions (e.g., "Client-XYZ-POC-Guide")

### Sharing
1. **Mark as Public**: Only make links public if appropriate to share
2. **Set Expiration**: For sensitive or temporary links, set an expiration date
3. **Track Usage**: Check copy count to see if links are being used
4. **Update Regularly**: Remove broken/outdated links

### Discoverability
1. **Use Search**: Search bar is faster than scrolling
2. **Filter by Type**: Separate internal from public for quick access
3. **Check Stats**: Most-copied links are your most valuable resources
4. **Group by Category**: Links in same category are usually related

---

**Questions or Feature Requests?**
The Link Hub is designed to be your central repository for all URL-based resources. Whether it's sales collateral, technical documentation, or client assets - everything is organized, searchable, and easy to share.
