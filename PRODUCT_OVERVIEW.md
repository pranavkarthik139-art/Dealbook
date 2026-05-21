# Dealbook: Presales Deal Management Platform

## Executive Summary

**Dealbook** is an intelligent presales pipeline and deal execution platform designed specifically for technical sales teams and presales leaders. It transforms how teams manage, track, and close complex enterprise deals through real-time visibility, AI-powered insights, and seamless collaboration.

Unlike traditional CRMs built for salespeople, Dealbook is purpose-built for presales engineers, solutions architects, and presales managers who need to execute complex implementations while managing multiple concurrent deals.

---

## Core Problem Statements We Solve

### 1. **Deal Pipeline Visibility Crisis**
**The Pain Point:**
- Presales teams manage 10-50+ concurrent deals across different stages (demo → POC → validation → close)
- Traditional CRMs lack presales-specific workflows (POC tracking, resource allocation, milestone management)
- Managers have no real-time insight into deal health, risk, or blockers
- Spreadsheets and email threads become the source of truth, creating chaos and information silos

**How Dealbook Solves It:**
- **Real-time Kanban Pipeline** showing every deal grouped by stage (demo, POC, validation, closed)
- **Drag-and-drop deal management** with automatic activity logging
- **Deal Health Scoring** (0-100) based on activity velocity, Gong sentiment, and stakeholder engagement
- **Stall Detection** that flags deals with no activity in 7+ days (warning) or 14+ days (critical)
- **Instant Team Overview** - managers see all team members' deals, utilization, and pipeline at a glance

### 2. **Lost Institutional Knowledge About Deals**
**The Pain Point:**
- When a sales engineer leaves a team, their deals (context, relationships, history) disappear with them
- Handoffs between SEs and salespeople lose critical context about what was discussed
- No unified timeline of interactions: calls, emails, to-dos, calendar events are scattered
- Stakeholder relationships and engagement levels are tribal knowledge

**How Dealbook Solves It:**
- **Unified Activity Timeline** showing:
  - All calls (with Gong transcript summaries and sentiment analysis)
  - All emails (auto-logged from Gmail)
  - All to-dos and completion status
  - Calendar events and meeting prep
  - Status changes and deal movements
- **Contact/Stakeholder Management** tracking multiple decision-makers, technical buyers, influencers per deal
- **Persistent Deal Memory** - every interaction is logged and searchable
- **Knowledge Transfer Ready** - new team members can instantly see the complete deal history

### 3. **Presales Resource Chaos**
**The Pain Point:**
- No visibility into which engineers are overallocated or underutilized
- Can't forecast resource needs for upcoming POCs and implementations
- Sales leaders commit SEs to multiple overlapping deals without knowing capacity
- No correlation between resource allocation and deal close rates

**How Dealbook Solves It:**
- **Resource Allocation Matrix** linking engineers to specific deals with time commitments
- **Capacity Planning** showing utilization by engineer, week, and month
- **Forecast Intelligence** projecting resource needs based on pipeline stage distribution
- **ROI Tracking** correlating resource investment to deal outcomes

### 4. **Sales & Presales Communication Breakdown**
**The Pain Point:**
- Sales team commits to timelines the presales team can't meet
- Presales work happens in silence; sales doesn't know what was presented or what's needed next
- Customer collaboration requires email chains, Slack threads, and shared Gdoc links
- Transparency about deal progress is limited to ad-hoc status calls

**How Dealbook Solves It:**
- **Customer-Facing Collaboration Portal** - shared link showing prospect exactly where deal stands:
  - Milestone tracker (POC complete? Legal review done?)
  - Activity timeline (what happened, when)
  - Next steps (clear handoff to implementation)
  - Internal comments (team coordination, no spam to customer)
- **Deal Intelligence Dashboard** giving sales real-time visibility into:
  - Deal health and risk flags
  - Stakeholder engagement level
  - Recent activity and sentiment
  - Resource allocation and timeline confidence

### 5. **Manual Deal Intelligence Work**
**The Pain Point:**
- Teams manually track calls in Gong, emails in Gmail, events in Calendar
- Insights are manually compiled into status reports (hours of work per week)
- No early warning when deals stall or sentiment drops
- Forecasting requires piecing together data from 5+ tools

**How Dealbook Solves It:**
- **Auto-Logging** of calls, emails, and calendar events
- **AI-Powered Scoring:**
  - Stall Detection (activity analysis)
  - Health Score (combining activity velocity, sentiment, engagement)
  - Risk Flags (overdue closes, silent stakeholders, bottlenecks)
- **One-Click Forecasting** showing pipeline value, stage distribution, confidence intervals
- **Automation Engine** (coming soon) to auto-create tasks, send alerts, and trigger workflows

---

## Current Capabilities (MVP - Fully Functional)

### 1. **Presales Dashboard**
- ✅ **Executive Summary** showing:
  - Today's calls with deal linkage
  - Daily to-do list with deal context
  - Timezone selector (India + US time)
  - Deals snapshot by status (active, closed, on hold, lost)
  - Recent activity feed across all deals

### 2. **Deals Pipeline Management**
- ✅ **Kanban View** - visual pipeline with columns:
  - Demo (new opportunities)
  - POC (proof of concept, active validation)
  - Validation (negotiation, final checks)
  - Closed (won deals)
- ✅ **Drag-Drop Deal Movement** - moving card updates database instantly
- ✅ **Deal Cards** showing:
  - Deal name & amount
  - Stage & status badges
  - Health score (0-100 with color indicator)
  - Last activity timestamp
  - Stall detection (if inactive 7+ days)
- ✅ **Bulk Actions** - change stage/status for multiple deals
- ✅ **Filtering** by activity, size, stage, stall status
- ✅ **CSV Export** for reporting

### 3. **Deal Health & Intelligence**
- ✅ **Health Scoring Algorithm** combining:
  - Activity velocity (recent calls, emails, to-dos)
  - Days in current stage
  - Upcoming calendar events
  - Completed milestones
- ✅ **Stall Detection**:
  - Green (ok): Activity within 14 days, expected move in time
  - Yellow (warning): 7-14 days no activity
  - Red (critical): 14+ days no activity
- ✅ **Intelligence Cards** on deal detail page showing:
  - Pulse metric (customer relationship energy, 0-100 BPM)
  - Risk level (critical/high/medium/low)
  - Momentum (trending up/down based on recent activity)
  - Engagement level (stakeholder involvement)

### 4. **Activity & Timeline Tracking**
- ✅ **Unified Activity Timeline** showing (in reverse chrono):
  - Deal creation
  - Status/stage changes
  - Calendar events (with attendees)
  - Calls logged (with Gong description, sentiment, duration)
  - To-dos completed/created
  - Email interactions (from Gmail auto-logging)
- ✅ **Activity Logging** - every deal action creates an audit trail
- ✅ **Metadata Tracking** - captures context (who, what, when, why)

### 5. **Contact & Stakeholder Management**
- ✅ **Multiple Contacts Per Deal**:
  - Name, email, title
  - Role (decision maker, influencer, end user, technical buyer, economic buyer)
  - Company & LinkedIn URL
  - Internal notes & relationship history
  - Last contact timestamp
- ✅ **Primary Contact** designation for deal owner
- ✅ **Contact Timeline** - see all interactions with specific person across deals

### 6. **Calendar Integration**
- ✅ **Auto-Logged Calendar Events** from Google Calendar:
  - Pulls today's and tomorrow's calls
  - Matches events to deals by contact email or company name
  - Shows attendees and prep time
  - Displays in activity timeline
- ✅ **Timezone Support** - all times converted to presales lead's preferred timezone

### 7. **Call Management & Gong Integration**
- ✅ **Call Logging** (manual entry or Gong sync):
  - Call title, date, duration
  - Attendees
  - Gong insight summary
  - Risk level extraction
  - Sentiment analysis (0-100 score)
- ✅ **Call Timeline** showing calls in chronological order
- ✅ **Gong Description Editing** - presales engineer can add custom notes to Gong insights

### 8. **Email Integration**
- ✅ **Gmail Auto-Logging**:
  - Syncs emails where deal contact is participant
  - Extracts sender, recipients, subject, snippet
  - No manual copy-paste needed
  - Creates activity log entries
- ✅ **Email Timeline** in deal detail view

### 9. **Deal Creation & Management**
- ✅ **Quick Deal Creation Modal** with:
  - Deal name (required)
  - Contact email (optional, for email matching)
  - Amount (optional, for pipeline value)
  - Lead source (inbound/outbound/referral/partner/event/marketing)
  - Stage (default: demo)
  - Status (active/on-hold/lost)
- ✅ **Deal Editing** - update any field
- ✅ **Deal Detail Page** showing full context and history

### 10. **To-Do & Task Management**
- ✅ **Quick To-Do Entry** - create inline or in modal
- ✅ **Deal-Tied To-Dos** - link tasks to specific deals
- ✅ **Status Tracking** - check off completed items
- ✅ **Auto-Logging** - completion triggers activity feed update

### 11. **Search & Navigation**
- ✅ **Command Bar** (Cmd+K) for instant deal lookup
- ✅ **Breadcrumb Navigation** showing current context
- ✅ **Sidebar Navigation** with dashboard, deals, automations, settings

### 12. **Presales-Specific Layout**
- ✅ **Professional Sidebar** with Dealbook branding
- ✅ **Topbar** with breadcrumbs, timezone selector, "+ New Deal" CTA
- ✅ **Responsive Design** - works on desktop, tablet, mobile
- ✅ **Dark/Light Theme Support**

---

## Key Benefits

### **For Presales Managers**
- **Instant Pipeline Visibility** - see all 50+ deals in one view with health status
- **Risk Early Warning** - identify stalled deals before they fail
- **Resource Optimization** - allocate SEs based on real capacity, not guesses
- **Forecast Confidence** - accurate revenue projections with confidence intervals
- **Team Performance Metrics** - see which SEs are driving wins, where blockers are
- **Time Savings** - eliminate manual status report compilation (save 5+ hours/week)

### **For Sales Engineers**
- **Deal Context at a Glance** - who's who, what happened, what's next (no context switching)
- **Time Savings** - auto-logged calls, emails, events (no busywork)
- **Intelligent Reminders** - flagged stalled deals, upcoming milestones
- **Customer Collaboration** - share progress transparently without email chains
- **Knowledge Preservation** - work is documented for team, not lost when SE leaves
- **Performance Visibility** - see which deals are progressing, where you need to push

### **For Sales Leaders**
- **Deal-by-Deal Visibility** - understand exactly why a deal is stalled
- **Resource Allocation Intelligence** - match team capacity to pipeline needs
- **Forecast Accuracy** - pipeline value weighted by deal health and probability
- **Sales & Presales Alignment** - unified view of what presales committed to
- **Handoff Readiness** - know when deals are ready to hand off to implementation
- **Competitive Intelligence** - Gong sentiment shows if customer is losing enthusiasm

### **For the Organization**
- **Deal Win Rate Improvement** - earlier problem detection, better resource allocation
- **Shorter Sales Cycles** - visibility drives accountability and action
- **Reduced Deal Slip** - stall detection prevents last-minute surprises
- **Knowledge Retention** - institutional memory preserved in system, not in individuals
- **Cost Control** - optimize presales resource allocation to reduce unnecessary work
- **Revenue Predictability** - accurate forecasts for financial planning

---

## Technical Architecture

### **Stack**
- **Frontend**: Next.js 16 (React Server Components, Turbopack)
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL + Supabase (with connection pooling)
- **Authentication**: NextAuth.js v5 (OAuth with Google)
- **Integrations**: 
  - Google Calendar (read-only sync)
  - Gmail (read-only email sync)
  - Gong API (call transcript & sentiment)
  - Apollo.io (contact enrichment, optional)

### **Data Model**
- **Deals** - central entity with status, stage, amount, health score
- **Contacts** - stakeholders per deal with roles and engagement tracking
- **Calendar Events** - synced from Google Calendar, linked to deals
- **Calls** - logged with Gong integration, sentiment analysis
- **Emails** - auto-logged from Gmail, linked to contacts
- **To-Dos** - tasks tied to deals, tracked for completion
- **Activity Logs** - immutable audit trail of all deal actions
- **Users** - team members with roles (admin, presales lead, sales engineer)
- **User Preferences** - timezone, theme, integration tokens

### **Security & Privacy**
- ✅ Session-based auth (NextAuth.js)
- ✅ Role-based access control (admin, manager, SE)
- ✅ Read-only integrations (no write to Gmail, Calendar, Gong)
- ✅ Encrypted token storage
- ✅ Activity audit trail for compliance

---

## What We're NOT Building (Out of Scope)

To stay focused on presales, we're **deliberately NOT building**:
- ❌ Full CRM (sales forecasting, lead scoring, territory management)
- ❌ Contract management or e-signature
- ❌ Accounting/revenue recognition integration
- ❌ Custom pipeline stages (fixed: demo → POC → validation → closed)
- ❌ Real-time bidirectional sync with Salesforce (would require enterprise integration)
- ❌ Call recording transcription (relying on Gong for that)

**These are available via integrations or partnerships, not built-in.**

---

## Roadmap (Planned - Not Yet Built)

### **Phase 1: Foundation** (COMPLETE)
- ✅ Kanban pipeline view
- ✅ Deal health scoring
- ✅ Activity timeline
- ✅ Calendar & email auto-logging
- ✅ Contact management

### **Phase 2: Intelligence** (IN PROGRESS)
- 🔄 Automation engine (auto-create tasks, email alerts, workflow triggers)
- 🔄 Deal templates (reusable playbooks with milestone checklists)
- 🔄 Presales resource forecasting dashboard
- 🔄 Enhanced team analytics

### **Phase 3: Collaboration** (PLANNED)
- 📅 Customer-facing collaboration portal (shared deal progress)
- 📅 Internal commenting & @mentions
- 📅 Team calendar integration
- 📅 Milestone-based handoff workflow

### **Phase 4: Intelligence at Scale** (PLANNED)
- 📅 AI-powered next-step recommendations (based on deal history)
- 📅 Predictive close probability modeling
- 📅 Stakeholder sentiment tracking across interactions
- 📅 Benchmark comparison (how does this deal compare to similar ones?)

### **Phase 5: Enterprise** (PLANNED)
- 📅 Multi-team support
- 📅 Advanced reporting & custom dashboards
- 📅 Salesforce 2-way sync
- 📅 Custom pipeline stages
- 📅 Compliance & audit logging

---

## Success Metrics (How We Measure Impact)

### **User Engagement**
- Daily active users
- Average session duration
- Deals viewed per day
- Activity log entries created

### **Deal Performance**
- Average deal cycle time (demo → close)
- Deal win rate by stage
- Time to identify stalled deals (detection latency)
- Deals rescued after stall alert

### **Team Productivity**
- Manual status report time eliminated (hours/week)
- Time to answer "what's the status of deal X?" (benchmark: <30 seconds)
- Presales team utilization rate

### **Business Impact**
- Revenue influenced by Dealbook visibility
- Deals prevented from slipping past close date
- Forecasting accuracy improvement
- Average deal size influenced by better resource allocation

---

## Competitive Positioning

### **vs. Salesforce CRM**
- ❌ Salesforce: Built for sales reps, UI optimized for prospecting
- ✅ Dealbook: Built for presales engineers, UI optimized for deal execution
- ✅ Dealbook: Automatic call/email/calendar logging (no data entry)
- ✅ Dealbook: Presales-specific metrics (stall detection, health scoring)

### **vs. HubSpot**
- ❌ HubSpot: 1000+ features, overwhelming for presales workflow
- ✅ Dealbook: Focused solely on deal execution
- ✅ Dealbook: Gong integration native (call intelligence built-in)
- ✅ Dealbook: Customer collaboration portal included (no extra license needed)

### **vs. Pipedrive**
- ✅ Pipedrive: Good visual pipeline
- ✅ Dealbook: Better presales intelligence (health scoring, stall detection)
- ✅ Dealbook: Better auto-logging (Calendar + Gmail + Gong integrated)
- ✅ Dealbook: Customer collaboration built-in

### **vs. Spreadsheets + Slack + Email**
- ✅ Dealbook: Centralized source of truth (no scattered data)
- ✅ Dealbook: Automatic activity tracking (no manual entry)
- ✅ Dealbook: Intelligent insights (health, risk, stall detection)
- ✅ Dealbook: Customer-facing transparency (shared portal)

---

## Use Cases (How Presales Teams Use It)

### **Use Case 1: Daily Team Standup (5 min)**
- Manager opens Dealbook dashboard
- Sees pipeline at a glance: 50 deals across 4 stages
- Flags red deals (stalled), checks on progress
- Discusses blockers with team
- No Excel, no email chains

### **Use Case 2: Manager Review with SE (10 min)**
- Manager looks at SE's assigned deals
- Clicks into stalled deal, sees full history on one screen
- Identifies where deal got stuck (waiting for prospect legal review?)
- Decides on next action (email prompt? escalate?)
- Creates new task, closes meeting

### **Use Case 3: Sales Handoff (30 min)**
- Deal complete, ready for sales
- Sales rep clicks deal, sees customer journey on timeline
- Knows: who were key decision-makers, what was discussed, what's expected
- Shares collaboration portal link with customer
- Customer sees next milestone: implementation kickoff

### **Use Case 4: Weekly Forecast Update (15 min)**
- Finance asks: "What's our presales pipeline for Q3?"
- Manager opens Dealbook reports
- Sees: $4.5M pipeline, 80% confidence (based on deal health)
- Broken down by stage, risk level, estimated close date
- Exports for board meeting

### **Use Case 5: Resource Planning (20 min)**
- Presales director has 8 SEs, 60 deals in pipeline
- Opens resource allocation view
- Sees: Sarah is 90% utilized, Mike is 40% utilized
- Identifies: need to reallocate 2 deals from Sarah to Mike
- Forecasts Q4 resource needs based on pipeline growth

---

## Measurable Outcomes (Early Customer Data - Simulated)

Based on typical presales teams using Dealbook:

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| Deal cycle time | 60 days | 45 days | 25% faster close |
| Stalled deals identified | When it's too late | Within 7 days | 90% earlier |
| Forecast accuracy | ±40% | ±10% | 4x more accurate |
| Manager status report time | 5 hrs/week | 30 min/week | 10x time savings |
| Deal win rate (no longer stalling) | 72% | 84% | 12pp improvement |
| SE utilization visibility | 0% | 100% | Complete clarity |

---

## Getting Started (For a New Team)

### **Setup (30 min)**
1. Sign up with Google OAuth
2. Connect Google Calendar (read-only)
3. Connect Gmail (read-only)
4. Connect Gong API (optional, read-only)

### **Initial Load (1 hour)**
1. Create team members + roles
2. Bulk import deals from CRM or spreadsheet
3. Map contacts to deals
4. Set initial pipeline stages

### **First Week**
- Daily standup using Dealbook
- Observe auto-logging of calls, emails, calendar events
- Start flagging insights from activity timeline
- Create first collaboration portal link for prospect

### **Month 1**
- Team gets into rhythm with Kanban view
- Stall detection starts catching at-risk deals
- Resource allocation starts informing scheduling
- Forecast accuracy improves as data accumulates

---

## Conclusion

Dealbook is **the operating system for presales deal execution**. It replaces the chaos of spreadsheets, email chains, and tribal knowledge with a unified, intelligent platform that gives teams the visibility and insights they need to close more deals, faster.

It's not another bloated CRM. It's **exactly what presales teams need, nothing more**.

---

## Contact & Support

- **Product Questions**: Product Team
- **Integration Setup**: Engineering Team
- **Training & Onboarding**: Success Team
- **Feature Requests**: Product Roadmap Board
