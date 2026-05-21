# Hashwork: Market Reality Check
## Why Presales Tools Exist (And Why Hashwork Matters)

---

## The Core Problem: CRMs Don't Understand Presales

### CRM Positioning (Salesforce, HubSpot, Pipedrive)
**What they're designed for:** Reps managing deals through a sales funnel
- Track: deal stage, rep activity, company info, close date, value
- Assume: One person (rep) owns the relationship
- Measure: Pipeline, win rate, rep productivity

**What they ignore:** Everything technical

### Presales Reality
- **NOT ONE PERSON** — technical buyer, economic buyer, end user, security officer, legal reviewer
- **NOT ONE CONVERSATION** — discovery call, POC scoping, environment setup, demo sessions, security review, budget approval
- **NOT LINEAR** — deals loop back (failed POC → redesign → retry), parallel workstreams (legal + security simultaneously), unexpected blockers (technical incompatibility after 6-week eval)

**Example:** A $500K deal in Salesforce looks like:
```
Deal Stage: Validation
Days in Stage: 32
Owner: Sarah (AE)
Close Date: June 30
Amount: $500K
Last Activity: Email 3 days ago
Status: On track
```

**Reality behind that deal:**
- Sarah has 5 stakeholders across 3 companies (customer + vendor partners)
- Technical POC started 20 days ago, now 70% complete
- Security review pending (waiting 10 days for customer's CISO to review)
- Customer's COO wants 20% discount because they saw competitor demo Monday
- Sales engineer spent 12 hours debugging production data replication (customer's issue, not ours)
- Customer's infrastructure team discovered our solution won't work with their legacy system (uncovered yesterday)

**Salesforce doesn't see any of this.** The AE writes "Waiting on security review" in notes. That's it.

---

## The Market Reality (2026)

### CRM Market: Dominated, Mature
- Salesforce: 20.7% share, $41.5B revenue, 8-11% growth
- HubSpot: Growing 20-25% annually, dominant in SMB/mid-market
- Pipedrive: 100,000+ customers, sales-native positioning
- **Consolidation complete.** No new CRM will win general market.

### Presales Market: Fragmented, Exploding
**Why?** Because presales is the **most underserved role in B2B software sales.**

**SEs are forced to stack 2-3 tools because no single tool covers presales operations:**

```
Typical 2026 SE Tool Stack:
├─ Demo Automation (Navattic, Naoma, DemoBoost)
│  Purpose: Stop wasting SE time on repetitive demos
│  Usage: 40,000+ demos built in 2025 (Navattic alone)
│
├─ Conversation Intelligence (Gong)
│  Purpose: See what's actually said, auto-extract risks
│  Usage: 300+ data points per deal, 21% more accurate than rep opinion
│
├─ Presales Operations (Vivun, Homerun)
│  Purpose: Track SE workload, map POC progress, link to sales outcomes
│  Usage: Measure technical win contribution
│
└─ CRM (Salesforce, HubSpot)
   Purpose: Track deal stage and close date
   Problem: Doesn't understand what SEs actually do
```

**Each tool solves one part of presales. None solve the complete picture.**

---

## The Hashwork Opportunity: What's Missing?

### What SEs Actually Need (But Don't Have)

**1. Deal Qualification Tracking That Accounts for Technical Reality**

Current CRM approach:
```
Stage: POC
Days in Stage: 25
Health: Stalled (no activity 4 days)
```

SE reality:
```
POC Status: 60% complete (3 of 5 components tested)
Technical Blocker: Customer's firewall blocks our API calls
  ├─ Discovery: 3 days ago
  ├─ Investigation: In progress (our engineer debugging)
  ├─ Resolution: Waiting on customer's IT (ticket #12584)
  ├─ Estimated Resolution: 5 more days
  └─ Deal Impact: If unresolved → Deal dies

Alternative Solution Found: Our competitor's API uses HTTP instead of HTTPS
  ├─ Feasibility: 2-day implementation
  ├─ Cost: $50K (customer willing)
  ├─ Approval: Need product sign-off
```

**CRM sees:** Stalled deal, no activity → Red flag, risk of loss
**SE knows:** Blocker is known and solvable, deal is actually still green

**Hashwork solves:** Track technical blockers, resolution status, and deal health independent of surface-level activity

---

**2. SE Workload + Outcome Correlation**

Current approach: SEs report hours in CRM notes ("Spent 6 hours debugging customer's infrastructure")
Reality: Manual, inconsistent, no visibility

Hashwork solves:
```
SE Utilization Dashboard
├─ Sarah: 60 hours this month
│  ├─ 12 hours: High-value technical validation (→ won $500K deal)
│  ├─ 18 hours: Low-value repetitive demos (automated 8 of them)
│  └─ 30 hours: Customer infrastructure debugging (customer's problem, not ours)
│
├─ Marcus: 48 hours this month
│  ├─ 8 hours: Technical discovery
│  ├─ 35 hours: POC delivery
│  └─ 5 hours: Lost deals (waste, should have closed earlier)
```

**Visible insight:** Sarah is wasting 30 hours on customer problems. Marcus is doing less work but closing bigger deals.

**Action:** Automate intro demos, push customer infrastructure work back to customer, reallocate Sarah to high-value deals.

**CRM can't do this.** No presales tool does this well.

---

**3. Deal Health That's Predictive, Not Reactive**

Market leaders (Gong, Vivun) have started this, but their data is:
- **Gong:** "300+ conversation signals → probability score" (black box, hard to action)
- **Vivun:** "SE effort → deal correlation" (macro-level, not specific)
- **Pipedrive/HubSpot:** "Activity recency + stage" (crude, lots of false positives)

Hashwork solves: **Transparent, actionable health scoring**

```
Deal: Acme Corp ($250K, POC)
Health: 72 (Amber — needs attention)

Why 72?
├─ ✓ Qualification: 82
│  ├─ ✓ Economic buyer identified (CFO)
│  ├─ ✓ Champion identified (CTO, advocates for us)
│  ├─ ✓ Pain quantified ("Reduce onboarding 3 weeks")
│  └─ ✗ Decision process unclear (missing)
│
├─ ✗ Momentum: 55
│  ├─ Last activity: 7 days ago (email reply)
│  ├─ POC progress: 60% complete, but stuck on firewall issue
│  └─ Trend: Was accelerating 2 weeks ago, now flat
│
├─ ✓ Engagement: 88
│  ├─ Calls: 1 scheduled for tomorrow
│  ├─ Email cadence: Replies within 24 hours (good)
│  └─ Stakeholder breadth: CFO + CTO + COO (3 people engaged)
│
└─ ⚠️ Risks: +1 Technical (firewall blocker)

Next Action: Call tomorrow to unblock firewall issue. Decision call with CFO next week.
```

**Why this matters:** Deal is healthy, not failing. Blocker is known. This is actionable.

---

### What Hashwork Should Be (Positioning)

**NOT:** "A better CRM for presales" (Vivun, Homerun already do this)

**NOT:** "Call intelligence like Gong" (Gong owns this, too entrenched)

**NOT:** "Demo automation platform" (Navattic, Naoma own this)

**BUT:** **"The presales operations dashboard that SEs and presales leaders use to see what's actually happening in technical validation, track blockers, and predict which deals will close."**

---

## Competitive Map (2026 Reality)

```
                              ↑ Deal Forecasting
                              │
                      Gong    │
                    (Signals) │
                              │
                         ┌────┼────┐
            Vivun        │Hashwork?│   HubSpot/Salesforce
         (Workflow)      │ (Blockers│   (Pipeline)
                         │ & Status)│
                         └────┼────┘
                              │
                              ↓ SE Workload Tracking

Demo Automation ←─────────────┼─────────────→ CRM
  (Navattic)                  │              (Salesforce)
                         Fragmented
                           Market
```

**Current state:** Teams use Gong + Vivun + Navattic + Salesforce = 4 tools, data silos

**Hashwork opportunity:** Bridge the middle — SE operations dashboard that SEs use daily (not just leaders)

---

## Why This Actually Matters (Real Reasons SEs Need Hashwork)

### 1. SEs Are Drowning in Information Fragmentation
- Demo status in Navattic
- Call notes in Gong
- Deal stage in Salesforce
- Customer conversations in email and Slack
- POC progress in... a spreadsheet? Customer's Jira board? Notes app?

**No single place to see "what's actually happening with this deal from a technical perspective."**

Hashwork solves: **Single source of truth for technical deal progress**

---

### 2. CRM Data Entry Kills Presales Productivity
- SEs have love-hate relationship with CRM
- Data entry is tedious ("Why am I typing what I just said on the call into Salesforce?")
- But context is invaluable ("Oh, last time we talked about integrations, not APIs")

**SE time on CRM update:** 10-15% of workday = ~5-8 hours per month = $5-10K per SE per year in wasted time

Hashwork solves: **Auto-logging from calendar + email means no manual CRM updates. Just read + act.**

---

### 3. Deal Risk Emerges from Technical Details, Not Sales Activity
Most deals don't fail from "rep didn't follow up" or "lost to competitor on price."

**They fail from:**
- Technical incompatibility discovered at POC stage
- Customer IT blocked feature we rely on
- Integration with their legacy system is harder than expected
- Performance doesn't meet their peak-load requirements
- Security compliance is impossible without re-architecting

**These details live in:** Slack, email threads, POC logs, customer's Jira board, Gong transcripts

**They don't live in:** CRM

Hashwork solves: **Central capture of technical blockers and resolution status**

---

### 4. SEs Can't Forecast Their Own Impact on Deals
SE productivity metric: "% of deals you touched that closed"

But CRM doesn't capture:
- Which deals need SE involvement
- How much SE work was required vs. what was helpful
- Whether deal would close without your POC (you're guessing)

Vivun tracks this macro-level. But SE needs it deal-by-deal:

"On this $500K deal, I spent 20 hours. Did that 20 hours matter? Or would Sarah (the AE) have closed it anyway?"

Hashwork solves: **Clear SE → deal outcome linkage via technical validation tracking**

---

## The Real Question: Why Would Someone Use Hashwork?

### Use Case 1: Mid-Market SaaS (50+ employees, 3-8 SEs)
- Uses: Salesforce + Gong + Navattic
- Problem: "We can see calls recorded (Gong), see deals (Salesforce), see demos (Navattic), but we can't see: Are POCs on track? Which technical blockers matter? Why is Sarah's close rate 30% higher than Marcus's?"
- Hashwork solves: Presales operational visibility

### Use Case 2: Presales Manager
- Problem: "I have 5 SEs. I can't see what they're working on. I know they're busy, but I can't tell if they're working on high-value deals or wasting time on $20K deals that will close anyway. I also can't tell if deals are failing due to technical reasons (fixable) or sales reasons (different issue)."
- Hashwork solves: SE workload allocation + deal risk visibility

### Use Case 3: Sales Engineer
- Problem: "I'm in 3 different tools every day. Gong for call intel, Salesforce to see next steps, email for customer context, our wiki for technical docs, Slack for team discussion. I can't get a single view of 'here's everything I need to know about the Acme deal right now.'"
- Hashwork solves: Single dashboard for current deal + all relevant context

---

## Hashwork's Actual Competitive Moat

**Vivun:** We own presales operations (SE workload tracking)
**Gong:** We own conversation intelligence (what's said in calls)
**Navattic:** We own demo automation (scaling first-touch)
**Salesforce:** We own deal pipeline (executives care about $)

**Hashwork can own:** The SE's hourly reality (what blockers exist, are they solvable, what do I do next?)

This is NOT the same as Vivun's macro-level "SE effort → deal outcome." It's more tactical:

```
Vivun: "Sarah worked 60 hours, closed $1.2M, ROI $20K per hour"
Hashwork: "Sarah has 4 active POCs. Here's the blocker in each. Here's the resolution ETA. Here's the next call date. You're blocked on: 1 customer IT issue, 1 product limitation (needs quick fix), 1 budget approval (not blockers for us)."
```

---

## The Uncomfortable Truth: Why Most Presales Tools Fail

1. **Too much feature scope** — Try to replace CRM, demo tool, and call intel at once → bloated, confusing, no clear value

2. **Built for leaders, not ICs** — Vivun, Homerun are presales leader dashboards. SEs don't open them daily.

3. **No deep integration with real workflows** — Assume SEs will log activities manually. They won't. Auto-logging is table stakes now (Gong did this).

4. **Fail to replace any existing tool** — If you don't fully replace a tool SEs are already using, you're adding another tool to the stack, not simplifying it.

---

## Hashwork's Real Thesis (Unfiltered)

**If Hashwork tries to compete with Vivun at "presales operations for leaders," it loses (Vivun is entrenched, better funded).**

**If Hashwork tries to compete with Gong at "call intelligence," it loses (Gong is category-defining, too entrenched).**

**If Hashwork tries to compete with Salesforce at "CRM," it loses (impossible).**

**Hashwork wins by being THE daily tool for SEs.**

Not "the presales platform." Not "the deal board." But: **"The place SEs go to see their current POCs, what's blocking them, and what to do next."**

Simple example:
```
Sarah opens Hashwork in the morning.
Sees: "4 active POCs"
Clicks POC 1: "Firewall blocker discovered yesterday. Customer's IT investigating. ETA: 2 days. My next call: tomorrow 10am to check status."
Clicks POC 2: "60% complete. No blockers. Closing statement due Monday. Product team needs to review use case."
Clicks POC 3: "Customer waiting on budget approval. Not a technical issue. Marcus (AE) following up with procurement."
Clicks POC 4: "We found a critical limitation in their use case. Design doc in progress. Timeline: review with customer Friday."

Sarah can now:
- Prioritize her day
- Know exactly what she needs to prep for each call
- Know which blockers are hers to solve vs. which are customer/sales team
- See whether she's on a good path or headed for failure
```

**Does Salesforce do this?** No, it's about deals, not POC status.
**Does Gong do this?** No, it's about what was said, not what needs to happen.
**Does Vivun do this?** Sort of, but at macro level, not SE daily workflow.
**Does anyone do this well?** No. This is the gap.

---

## The Real Competition

**Hashwork isn't competing with Vivun, Gong, or Navattic.**

**It's competing with spreadsheets, email, and Slack.**

Most presales teams are tracking POC progress in:
- **Google Sheets:** "POC Tracker v23 (Jan 2026)" with tabs for each deal
- **Airtable:** Custom view, manually updated by SEs
- **Notion:** Team knowledge base with POC status, hard to keep in sync
- **Slack threads:** "anyone have updates on Acme POC?"
- **Email:** Forwarding status updates around, searching history to remember context

**If Hashwork becomes "the way our team tracks POC progress," it wins.**

Everything else (beautiful UI, MEDDICC scoring, health algorithms) is secondary.

---

## What This Means for Your Roadmap

### Don't Build For the Market
**Don't try to:**
- Compete with Gong on conversation intelligence
- Compete with Vivun on presales operations
- Compete with Navattic on demo automation
- Compete with Salesforce on CRM

### Build For the Person Who Actually Uses It Every Hour
**DO:**
- Build for the SE's hourly reality
- Make it the place they open first in the morning
- Make it 80% faster to use than their current spreadsheet
- Make it the single source of truth for "what's my POC status across all deals?"

### Specific Features That Matter
1. **POC status tracker** (Gantts for each deal showing milestones, blockers, ETAs)
2. **Blocker catalog** (add blocker → track resolution → auto-flag deal risk)
3. **Smart notifications** (not "deal was touched," but "customer responded to your firewall question" or "your POC is overdue")
4. **Auto-context** (pull latest from email, calendar, calls → summarize for tomorrow's meeting)
5. **Deal status from SE perspective** (not rep's perspective)

### Features That Don't Matter
- Building MEDDICC checklist UI (SEs don't care about frameworks)
- Health scoring algorithm (interesting, but not the core problem)
- Probability weighting (that's HubSpot's job)
- Presales analytics dashboard (that's Vivun's job)

---

## Final Answer to Your Question

> "If building apps was this simple, why would people need my app?"

**Because the market is fragmented, SEs are drowning in tools, and NO ONE is solving the SE's hourly reality.**

The opportunity is NOT:
- "Build the next Vivun" (market leader, too entrenched)
- "Build MEDDICC-powered deal scoring" (feature, not product)
- "Build a better CRM" (Salesforce won)

The opportunity IS:
- "Build the tool SEs open first in the morning, use all day, and can't live without"
- "Be so good at tracking POC progress that teams stop using spreadsheets"
- "Make SEs 30% faster at knowing what to do next on their deals"

That's a real problem. That's a real business.

Everything else is optimization.

