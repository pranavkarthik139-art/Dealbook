# Hashwork Presales Platform: Product Requirements Document
## Based on Competitive Analysis & Qualification Frameworks (May 2026)

---

## Executive Summary

This document synthesizes research from market-leading presales platforms (Pipedrive, HubSpot, Salesforce, Gong, Vivun, Rocketlane) and proven sales qualification frameworks (MEDDICC, BANT, SPICED) to define what attributes, insights, and features Hashwork needs to compete as a presales intelligence platform.

**Key Finding:** The market leaders focus on three pillars:
1. **Comprehensive Deal Qualification** (MEDDICC-aligned attributes)
2. **AI-Powered Risk & Insight Generation** (conversation intelligence, engagement signals)
3. **Resource Forecasting & Pipeline Intelligence** (capacity planning, probability-weighted forecasts)

Hashwork currently excels at #1 (basic deal tracking) but lacks #2 (intelligence) and #3 (forecasting).

---

## Part 1: Market-Leading Deal Attributes

### What Pipedrive Tracks
- **Default fields**: Deal name, stage, value, close date, expected close date, owner, associated contacts/organizations
- **System fields**: Creation date, modification history, stage changes, activity timeline
- **Custom fields**: Users can add any field type (text, number, date, monetary, single/multi-option, person, organization)
- **Key insight**: Pipedrive emphasizes **stage progression and field history** — teams see not just current state but how deals evolve

### What HubSpot Tracks
- **Essential properties**: Deal amount, MRR (recurring), TCV (total contract value), close date, stage, owner, probability
- **Advanced metrics**: Weighted amount (deal value × probability), company association, contact associations, product mix
- **Key insight**: HubSpot focuses on **revenue forecasting** — every deal has a probability-weighted value that feeds forecasts

### What Gong Tracks
- **Conversation intelligence**: 300+ data points per deal including engagement signals, communication cadence, competitor mentions, stakeholder involvement, sentiment analysis
- **Deal likelihood score**: 50% from conversation data + 50% from activity, contacts, timing, historical data
- **Risk indicators**: Early warning signals for at-risk deals (AI 21% more accurate than reps by week 4)
- **Key insight**: Gong focuses on **conversation patterns as leading indicators** — what's said in calls predicts close probability more accurately than rep opinion

### What Vivun Tracks
- **Activity logging**: Presales activities (demos, POCs, technical evaluations) tied to deals
- **Resource allocation**: Which presales engineer worked on which deal, for how long
- **Competitive intelligence**: Which competitors mentioned, how frequently
- **Product gaps**: What features customers ask for vs. what's in product
- **Key insight**: Vivun focuses on **presales effort & resource ROI** — teams can measure whether presales investment correlates with win rates and deal size

### What Rocketlane Tracks
- **Project execution**: Milestone-based deal progression with risk flagging
- **Resource rebalancing**: Real-time capacity adjustments as risks emerge
- **Delivery forecast**: Predictive insights for when deals will actually close and deliver value
- **Key insight**: Rocketlane focuses on **deal-to-delivery continuity** — managing presales through delivery through to outcomes

---

## Part 2: Qualification Frameworks → Deal Attributes

### MEDDICC Framework (Most Relevant for Presales)

| MEDDICC Element | Deal Attribute | How to Track |
|---|---|---|
| **Metrics (M)** | Quantifiable business impact (revenue, time savings, compliance goals) | Text field: "M1: Reduce onboarding 3 weeks" / "M2: Cut support tickets 40%" |
| **Economic Buyer** | Who controls the budget decision | Contact role: "Economic Buyer" or relationship field |
| **Decision Criteria** | What criteria will buyer use to evaluate solution | Checkbox list or text: "RFP requirements met", "TCO acceptable", "Data security certified" |
| **Decision Process** | Steps buyer will take (RFP → eval → proof → legal → procurement) | Stage pipeline or milestone checklist |
| **Identify Pain** | Customer's admitted pain and impact | Text field: "Pain: 'Our current solution takes 6 weeks to onboard'" |
| **Champion** | Internal seller with power and personal stake | Contact relationship: "Champion", with notes on their influence and motivation |
| **Competition** | Who else they're evaluating | Multi-select or contact field: "Evaluating Competitor X, Y, Z" |

**Why MEDDICC for Presales:** MEDDICC is the #1 framework used by enterprise B2B SaaS (73% of companies >$100K ARR). Organizations that adopt it see 18% higher win rates and 24% larger deal sizes. **This should be the backbone of Hashwork's health scoring.**

### BANT Framework (Initial Qualification)

Use **before** investing presales resources. Quick filter:
- **Budget**: Verified financial approval exists
- **Authority**: Decision maker identified
- **Need**: Customer has stated a compelling problem
- **Timeline**: Clear deal timeline (not "sometime next year")

**Application:** BANT should be a pre-qualification checklist before deal enters "poc" stage.

### SPICED Framework (Complex Deals)

Use for deals that require **multi-threaded stakeholder engagement** and custom solutions:
- **Situation**: Understanding customer's full context (industry, company size, current state)
- **Pain**: Customer's specific pain points (not generic)
- **Impact**: Quantified business impact if pain is solved
- **Critical Event**: What triggered urgency? (fiscal year end, system failure, regulatory deadline)
- **Decision**: Clear understanding of buying committee and decision criteria

**Application:** SPICED depth for deals >$500K or 3+ stakeholders.

---

## Part 3: Missing Presales Intelligence (Hashwork Gap Analysis)

### What Hashwork Currently Has ✓
- Deal stage pipeline (demo → POC → validation → closed)
- Deal health score (basic: activity recency, no advanced signals)
- Activity timeline (calendar + email auto-logging)
- Deal amount & owner
- Basic stall detection (no activity for X days)

### What Hashwork Is Missing ✗

#### 1. **Qualification Attributes** (Foundation for Health Scoring)
```
Missing fields:
- Economic buyer identification
- Decision criteria checklist
- Decision process timeline/milestones
- Champion identification + motivation
- Explicit pain statement (quantified)
- Competition awareness
- Deal probability (vs. hardcoded stages)
- BANT qualification flag (ready for presales?)
- Close date with confidence level
```

#### 2. **AI-Powered Insights** (Like Gong's Conversation Intelligence)
```
Missing:
- Engagement signal tracking (email open rate, reply velocity, meeting attendance)
- Stakeholder involvement map (how many people involved, who engaged, who silent?)
- Sentiment analysis on emails/notes
- Deal momentum scoring (getting better or worse?)
- Risk scoring (not just stalled, but actual risk of loss)
- Competitor mention tracking & frequency
- Dead deal prediction (before rep realizes it's dead)
```

#### 3. **Forecasting & Capacity Intelligence**
```
Missing:
- Probability-weighted pipeline (deal value × probability, not just stage-based forecast)
- Resource allocation tracking (which presales engineer on which deals)
- Presales effort vs. outcome correlation
- Forecast accuracy (predicted close vs. actual close)
- Capacity utilization heatmap
- Bottleneck identification (where deals get stuck)
```

---

## Part 4: Redesigned Health Scoring Algorithm (MEDDICC-Based)

**Current Algorithm Problem:** Based only on activity recency and days in stage. Ignores deal qualification and momentum.

**New Health Score (0-100)** combines 5 weighted factors:

```
Health = (Qualification Score × 30%) 
       + (Momentum Score × 30%) 
       + (Engagement Score × 20%) 
       + (Stakeholder Score × 15%) 
       + (Risk Adjustment × 5%)

QUALIFICATION SCORE (0-100, 30% weight)
─────────────────────────────────────
Base: 50 points (all deals start at 50)

✓ +10 if economic buyer identified
✓ +10 if champion identified
✓ +10 if pain statement quantified (e.g., "reduce time by 3 weeks")
✓ +10 if decision criteria defined (e.g., RFP requirements)
✓ +10 if decision process understood (stages/timeline)
✗ -10 if no competition identified (risky: no leverage)
✗ -5 if close date missing
Result: 50-100 range

MOMENTUM SCORE (0-100, 30% weight)
──────────────────────────────────
Track trend over past 14 days:

Last activity:
  0-2 days ago: 100 pts (excellent)
  3-7 days ago: 75 pts (good)
  8-14 days ago: 50 pts (slowing)
  15-30 days ago: 25 pts (stalled)
  30+ days: 0 pts (dead)

Stage progression:
  ✓ Moved stages in last 30 days: +20 pts bonus
  ✓ BANT validated: +15 pts bonus
  ✗ Stuck in same stage 30+ days: -25 pts penalty

Result: 0-135 range, capped at 100

ENGAGEMENT SCORE (0-100, 20% weight)
───────────────────────────────────
Track interaction quality (last 30 days):

Meeting cadence:
  2+ calls scheduled: 100 pts
  1 call scheduled: 75 pts
  0 calls, but emails back-and-forth: 50 pts
  1-way communication (we keep calling): 25 pts
  No communication: 0 pts

Email engagement:
  Reply within 24 hours: +15 pts
  Reply within 2-3 days: +10 pts
  Reply after 1 week: +5 pts
  No replies to 2+ emails: -20 pts

Stakeholder responsiveness:
  Multiple stakeholders responding: +20 pts bonus
  Only economic buyer engaging: +10 pts
  Only champion, not buyer, engaging: +5 pts

Result: 0-150, capped at 100

STAKEHOLDER SCORE (0-100, 15% weight)
────────────────────────────────────
Buying committee health:

Number of engaged contacts:
  3+ involved: 100 pts (strong multi-threading)
  2 involved: 75 pts (some breadth)
  1 involved: 50 pts (single point of failure)
  0 identified contacts: 0 pts (critical gap)

Role coverage:
  ✓ Economic buyer + champion + influencer: +20 pts bonus
  ✓ Economic buyer + champion: +15 pts bonus
  ✗ Only end-user, missing economic buyer: -25 pts penalty

Stakeholder engagement level:
  Avg days since last engagement per stakeholder:
    0-7 days: +20 pts
    8-14 days: +10 pts
    15+ days: -10 pts (becoming detached)

Result: 0-140, capped at 100

RISK ADJUSTMENT (-50 to +20, 5% weight)
──────────────────────────────────────
Red flags that lower score:

✗ Close date past (overdue): -50 pts
✗ Competitor aggressively pursuing (from notes): -25 pts
✗ Budget approval not confirmed (BANT): -20 pts
✗ Legal/security holding up deal (from notes): -15 pts
✗ Competitor chosen in meeting notes: -40 pts (deal likely lost)

Green flags:

✓ Legal/procurement approved: +15 pts
✓ POC completed successfully (from notes): +20 pts
✓ Deal size increased (from field): +10 pts

FINAL HEALTH CALCULATION
────────────────────────
health = (qual × 0.30) + (momentum × 0.30) + (engagement × 0.20) + (stakeholder × 0.15) + (risk × 0.05)

Color coding:
  80-100: GREEN (On track, continue)
  50-79: AMBER (Needs attention, define next action)
  0-49: RED (At risk, needs intervention or close as lost)

Example Deal:
──────────────
Deal: "Acme Corp POC" | Amount: $250K | Stage: POC | Days in stage: 12

QUALIFICATION:
  - Economic buyer: ✓ CFO identified (+10)
  - Champion: ✓ COO will benefit (+10)
  - Pain: ✓ "Reduce onboarding 3 weeks" (+10)
  - Decision criteria: ✗ Not defined (-5 from base 50)
  - Subtotal: 65

MOMENTUM:
  - Last activity: 4 days ago (email) → 75 pts
  - Moved stages: Yes, demo→POC 8 days ago (+20)
  - BANT validated: Yes (+15)
  - Subtotal: 110 → capped 100

ENGAGEMENT:
  - Meetings: 1 call scheduled next week → 75 pts
  - Emails: 2 replies in 36 hours → +15
  - Multi-stakeholder: CFO + COO responding → +20
  - Subtotal: 110 → capped 100

STAKEHOLDER:
  - Contacts engaged: 2 → 75 pts
  - Role coverage: Economic buyer + champion → +15
  - Last engagement: 1 day (CFO), 2 days (COO) → +20
  - Subtotal: 110 → capped 100

RISK:
  - Close date: 35 days out (reasonable) → no adjustment
  - POC going well (noted): +20
  - Subtotal: +20

FINAL:
health = (65×0.30) + (100×0.30) + (100×0.20) + (100×0.15) + (20×0.05)
       = 19.5 + 30 + 20 + 15 + 1
       = 85.5 → GREEN ✓

Interpretation: Deal is healthy. Continue with next POC milestones. Schedule decision process review call with economic buyer in 7 days.
```

---

## Part 5: Critical New Deal Attributes to Add

### Add to Database Schema (Prisma)

```prisma
model Deal {
  // Existing fields
  id              Int
  userId          Int
  name            String
  amount          Decimal?
  stage           String  // demo, poc, validation, closed
  status          String  // active, lost, on_hold, etc.
  
  // NEW: Qualification (MEDDICC)
  economicBuyerId Int?              // Contact ID of budget-holder
  economicBuyer   Contact?          @relation(name: "economicBuyer", fields: [economicBuyerId], references: [id])
  
  championId      Int?              // Contact ID of internal champion
  champion        Contact?          @relation(name: "champion", fields: [championId], references: [id])
  
  painStatement   String?           // Quantified: "Reduce onboarding from 6 to 3 weeks"
  decisionCriteria String?          // JSON or comma-separated: "RFP met", "Security certified", "TCO < $50K"
  decisionProcess String?           // Stages/milestones: "RFP → eval → legal → procurement"
  
  competitorsList String?           // Comma-separated: "Competitor A, Competitor B"
  
  // NEW: Qualification Scoring (BANT)
  isBantQualified Boolean           @default(false)
  bcdBudgetApproved Boolean?        // B = Budget confirmed
  bcdAuthorityIdentified Boolean?   // A = Authority confirmed
  bcdNeedDefined Boolean?           // N = Need quantified
  bcdTimelineSet Boolean?           // T = Timeline clear (not "sometime")
  
  // NEW: Probability & Timeline
  winProbability  Int               @default(50) // 0-100, updated by health score or manually
  expectedCloseDate DateTime?       // When we expect deal to close
  closeDateConfidence String        @default("low") // low, medium, high (affects forecast weight)
  
  // NEW: Stakeholder Management
  stakeholders    Contact[]         @relation("dealStakeholders")
  
  // NEW: Engagement Tracking
  lastCallDate    DateTime?         // Last meeting/call with any stakeholder
  lastEmailDate   DateTime?         // Last email sent/received
  callsScheduled  Int               @default(0) // Count of upcoming scheduled calls
  
  // NEW: Risk Tracking
  riskFlags       String?           // JSON: { legalBlock: true, budgetUncertain: false, competitive: "Competitor X aggressive" }
  riskNotes       String?           // Free-form risk description
  
  // Existing fields
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  // Relations
  contacts        Contact[]         @relation("dealContacts")
  // ... other relations
}

model Contact {
  id              Int
  userId          Int
  dealId          Int
  name            String
  email           String
  title           String?           // Job title
  
  // NEW: Role classification
  role            String?           // 'economic_buyer', 'champion', 'technical_buyer', 'influencer', 'end_user'
  influence       String?           // 'high', 'medium', 'low' - how much sway in decision
  motivation      String?           // Free-form: "Wants to reduce manual work"
  
  // NEW: Engagement tracking
  lastEngagedAt   DateTime?         // Last email/call with this specific contact
  callCount       Int               @default(0)
  emailCount      Int               @default(0)
  
  deal            Deal              @relation(name: "dealContacts", fields: [dealId], references: [id])
  
  // For economic buyer / champion links
  asEconomicBuyerFor Deal[]         @relation(name: "economicBuyer")
  asChampionFor   Deal[]            @relation(name: "champion")
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

model DealActivityLog {
  id              Int
  dealId          Int
  contactId       Int?              // Which contact was this activity with?
  activityType    String            // 'call', 'email', 'proposal_sent', 'poc_started', 'legal_review', etc.
  description     String
  activityDate    DateTime
  notes           String?           // Notes from the activity
  
  deal            Deal              @relation(fields: [dealId], references: [id])
  
  createdAt       DateTime          @default(now())
}
```

### Dashboard Fields to Display

**Deal List / Kanban View** (each card shows):
- Deal name
- Amount
- **Primary Contact** (name + title)
- **Stage & Days in Stage**
- **Health Score** (with color: Green/Amber/Red)
- **Next Action** (derived from risk flags)
- Last activity timestamp

**Deal Detail Page** (new sections):
- **MEDDICC Checklist** (qual score shown as progress)
  - ☐ Economic buyer identified
  - ☐ Champion identified
  - ☐ Pain quantified
  - ☐ Decision criteria defined
  - ☐ Decision process mapped
  - ☐ Competition identified

- **Stakeholder Map** (table showing contacts)
  - Name | Title | Role | Last Engaged | Call Count | Status

- **Timeline Milestones**
  - POC start/end dates
  - Legal review deadline
  - Budget approval date
  - Expected close date

- **Risk Dashboard**
  - Current risks (legal block, budget, competitor, timeline)
  - Risk trend (improving/declining)

---

## Part 6: New Insights to Generate (Phase 2)

### Automatic Insights Engine

**On each deal view, show:**

1. **Qualification Gap** (Red if MEDDICC incomplete)
   - "Missing: Economic buyer identification. Next step: Schedule call with CFO."

2. **Momentum Indicator** (Trend arrow + prediction)
   - "↗ Accelerating: 2 calls this week (vs. 1 last week). Projected close: 30 days."
   - OR "↘ Slowing: Last activity 9 days ago. Risk: Going cold."

3. **Stakeholder Health** (How many engaged, who's quiet)
   - "Strong: 3 stakeholders engaged. ⚠️ CFO hasn't responded in 8 days — follow up."

4. **Benchmark Comparison**
   - "This deal's health (85) is above team average (72). Likely to close."

5. **Risk Alert** (If close date is 14 days away)
   - "⚠️ Close date in 14 days. Status: Legal review pending. Action: Get update from legal."

6. **Next Action Recommendation** (Based on MEDDICC + stage)
   - If POC stage + economic buyer missing → "Schedule meeting with CFO to kick off POC"
   - If validation stage + decision process unclear → "Send decision timeline document"
   - If 45 days to close + no legal review → "Initiate legal/security review"

---

## Part 7: Implementation Roadmap

### Phase 2.5: Enhanced Deal Attributes (1 week)
1. Extend Prisma schema (add MEDDICC fields, probability, stakeholder tracking)
2. Run migration: `npx prisma migrate dev --name add_meddicc_attributes`
3. Create API endpoints for MEDDICC updates
4. Update Deal Detail page to show MEDDICC checklist

### Phase 3: New Health Score Algorithm (2 weeks)
1. Write `lib/dealHealthV2.ts` implementing MEDDICC-based scoring
2. Calculate health on every deal save
3. Update Deal Card to show health score with color coding
4. Add health score to Kanban column header (avg. health per stage)
5. Create insights dashboard showing deals by health tier

### Phase 4: Engagement Intelligence (2 weeks)
1. Track call dates, email engagement, stakeholder responsiveness (enhance ActivityLog)
2. Calculate engagement metrics automatically from calendar + email auto-logging
3. Show engagement trend (improving/declining) on deal view
4. Build "Momentum" visualization (slope of activity over time)

### Phase 5: Risk Dashboard & Forecasting (2 weeks)
1. Create risk flag UI (legal block, budget, competitor, timeline)
2. Build forecast view: probability-weighted pipeline by close date
3. Add deal-to-deal risk correlation (e.g., "2 deals stalled by same legal block")

---

## Part 8: Data Model Comparison: Hashwork vs. Market Leaders

| Attribute | Hashwork (Current) | Pipedrive | HubSpot | Gong | Vivun | Hashwork (Required) |
|-----------|---|---|---|---|---|---|
| Basic deal info | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Stage pipeline | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contact associations | Partial | ✓ | ✓ | ✓ | ✓ | **✓✓ (MEDDICC roles)** |
| Decision maker ID | ✗ | Limited | Limited | ✓ | ✓ | **✓✓** |
| Probability weighting | ✗ | ✓ | ✓ | ✓ | ✓ | **✓** |
| MEDDICC tracking | ✗ | Limited | ✗ | Implicit | Implicit | **✓✓ (explicit)** |
| Engagement signals | ✗ | Limited | Limited | ✓✓ | ✓ | **✓ (from email/cal)** |
| Risk scoring | ✗ | Limited | ✗ | ✓✓ | Limited | **✓** |
| Resource allocation | ✗ | ✗ | ✗ | ✗ | ✓✓ | Future phase |
| Forecast accuracy | ✗ | ✗ | Limited | ✓ | ✓ | **✓** |

---

## Part 9: Success Metrics

After implementing this roadmap, measure:

1. **Qualification Lift**
   - % of deals with complete MEDDICC info (target: 80% by month 2)
   - Average days to qualification (target: reduce by 30%)

2. **Forecast Accuracy**
   - Predicted close date vs. actual (target: within 5 days)
   - Probability-weighted pipeline accuracy (target: within 10%)

3. **Win Rate Improvement**
   - Green health deals: target 70%+ win rate
   - Red health deals: target <20% win rate (accurate prediction)

4. **Risk Detection**
   - Days from risk onset to detection (target: <5 days)
   - % of "at-risk" deals caught before they're completely dead

5. **Presales Efficiency**
   - Time spent on low-probability deals (target: <10% of time)
   - Stakeholder engagement breadth (target: avg. 2.5 contacts per deal, currently ~1.2)

---

## References & Sources

**Frameworks:**
- [MEDDICC Sales Methodology - Official Guide](https://meddicc.com/meddpicc-sales-methodology-and-process)
- [MEDDICC: Complete Sales Qualification Guide (2026)](https://prospeo.io/s/meddicc)
- [BANT vs SPICED Sales Frameworks (2026)](https://www.claap.io/blog/bant-vs-spiced)

**Competitive Platforms:**
- [Pipedrive Deal Tracking](https://support.pipedrive.com/en/article/deal-detail-view)
- [HubSpot Deal Properties Guide (2026)](https://www.leadcrm.io/blog/hubspot-deal-properties-guide/)
- [Gong Deal Intelligence & Likelihood Scores](https://help.gong.io/docs/understanding-gong-deals)
- [Vivun PreSales Platform](https://www.vivun.com/presales/optimize-and-analyze)
- [Rocketlane Series C & Nitro Platform](https://www.rocketlane.com/press/rocketlane-raises-series-c)

**Performance Data:**
- [MEDDICC Adoption: 73% of enterprise SaaS, 18% higher win rates](https://www.apollo.io/insights/meddpicc-sales)
- [Gong Accuracy: 21% more precise than reps by week 4](https://help.gong.io/docs/explainer-under-the-hood-of-deal-likelihood-scores)
- [Vivun Cycle Time: 20% reduction after adoption](https://www.vivun.com/presales/operate-execute)

---

## Next Steps

1. **Review & Approve**: Confirm this aligns with your presales workflows and competitive ambitions
2. **Prioritize**: Which Phase 2.5-5 features are most critical for your first customer demo?
3. **Refine Attributes**: Interview your early users (presales engineers) — ask "What would you track if you could track anything?"
4. **Prototype**: Build MEDDICC checklist UI first (2-3 days), then health score algorithm (3-4 days)
5. **Validate**: Test with 2-3 real deals from early customers — is health score predictive of actual close?

