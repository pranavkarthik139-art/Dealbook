# Hashwork: First Tab Product Specification
## The SE Opens This Before Slack, Email, Salesforce

---

## The Core Question

**What does an SE need to know in the first 60 seconds?**

Not "which deals am I working on?" (Salesforce shows that)
Not "what was said on calls?" (Gong shows that)
Not "what's my utilization?" (Vivun shows that)

**But: "What do I need to do RIGHT NOW across all my POCs?"**

---

## The First Tab: POC Command Center

### What It Shows (Chronologically)

**Section 1: Today's Focus (Top of page)**
```
YOUR CALENDAR TODAY
├─ 10:00 AM - Acme Corp Technical Review Call (15 min prep needed)
│   Last update: Email from CTO yesterday 2pm
│   POC status: 70% complete, 1 blocker
│   Next step: Review their questions in email
│
├─ 2:00 PM - Zenith Demo Session (live POC environment prep)
│   Customer: 3 attendees (all new)
│   POC status: 55% complete
│   What they'll ask about: Integration, security, pricing (prep doc linked)
│
└─ 4:30 PM - GlobalTech Security Review (waiting on them to schedule)
    Status: Blocked on customer calendar
    Days waiting: 4
```

**Section 2: Active POCs (Main View)**

Kanban-style columns, but different from Salesforce pipeline:

```
📍 YOUR POCs (4 Active)

BLOCKED (1)                   IN PROGRESS (2)               BLOCKED ON CUSTOMER (1)
─────────────────────────────────────────────────────────────────────────────────

Acme Corp                     Zenith Corp                    GlobalTech Inc
$250K | 30 days old          $180K | 20 days old            $500K | 45 days old
Stage: POC                    Stage: POC                     Stage: POC
─────────────────────────────────────────────────────────────────────────────────
Status: 70% complete         Status: 55% complete           Status: 45% complete

BLOCKER:                      Next milestone:                Waiting for:
Firewall config              API integration testing        Security review call
                                                             (customer hasn't scheduled)
Discovered: 3 days ago      Due: 4 days                    Days waiting: 4
Customer IT investigating    In progress (on track)         Risk: Going cold

ETA to resolve: 2 days      Next call: Tomorrow 10am
My action: Call today       Prep needed: Review their
to check status             API specs (doc saved)

⚠️ If not resolved → Deal Closed   ✅ On track to close     ⚠️ Call customer today
Probability drop: 40%                                        to reschedule

[Expand] [Details] [Add Note] [Update Status]
```

**This is not a deal card. It's an SE's POC card.**

---

## Core Differences from Deal Board

### Deal Board (Salesforce)
```
Deal name: Acme Corp
Amount: $250K
Stage: POC
Days in stage: 30
Owner: Sarah
Close date: June 30
Last activity: Email 3 days ago
```

### POC Card (Hashwork First Tab)
```
POC: Acme Firewall Integration Validation
Parent deal: Acme Corp ($250K)
Progress: 70% complete (7 of 10 milestones done)

Technical blocker: Firewall config incompatibility
├─ Discovered: 3 days ago
├─ Root cause: Their corporate firewall blocks our API on port 443
├─ Investigation status: Customer IT investigating (ticket #12584, last update 2 hours ago)
├─ Solution path: Workaround exists (use HTTP instead) or their IT can whitelist our IPs
├─ ETA to resolution: 2 days (customer IT's estimate)
├─ If unresolved by: June 5 → Deal slides by 2 weeks
├─ Probability impact: If unresolved → 40% probability drop

Your next action: Call CTO today at 3pm to check on IT ticket status
Prep needed: Have workaround doc ready to share if IT is stuck

Related deal info (pulled from Salesforce):
├─ Economic buyer: CFO (not yet engaged on this blocker)
├─ Champion: CTO (is engaged, pushing IT to fix)
├─ Latest from email: "IT ticket submitted, reviewing with infra team"
├─ Latest from calendar: Last call 3 days ago (30 min discussion about this exact issue)
├─ Timeline: Close date June 30, but if this takes 2 more weeks, we're at June 14 (tight)
```

**This is fundamentally different. It's from an SE's perspective, not a rep's.**

---

## Section 3: Blockers Waiting On Me (Action Items)

```
🔴 YOU'RE BLOCKING DEALS (3 items need your action this week)

Zenith Corp - API integration testing
├─ Assigned to: You
├─ Due: Friday (2 days left)
├─ Impact: If delayed → Demo demo call next week gets pushed back
├─ Effort remaining: 4 hours
└─ Status: In progress (60% done)

NextGen Corp - Design doc for custom integration
├─ Assigned to: You
├─ Due: Wednesday (1 day left)
├─ Impact: Customer needs this to submit to their architecture review board
├─ Effort remaining: 3 hours
└─ Status: Not started (started writing yesterday, paused)

AcmeCorp - Workaround documentation
├─ Assigned to: You
├─ Due: Today (before 3pm call)
├─ Impact: If not ready, blocker stays unresolved
├─ Effort: 30 minutes
└─ Status: Can start now (pre-written template available)
```

---

## Section 4: POCs at Risk (Early Warning)

```
⚠️ AT-RISK POCs (Might fail if action not taken now)

GlobalTech Inc ($500K, 45 days)
├─ Risk: Going cold
├─ Days since last contact: 4 days
├─ Expected contact: By today
├─ Action to take: Call customer security officer
├─ Why: Security review call is blocking POC completion
│
├─ Related deal info:
│  ├─ Close date: July 15 (but POC needs to be done by June 30)
│  ├─ Days left for POC: 11 days
│  ├─ POC progress: 45% complete, needs security sign-off before finishing
│  └─ Champion: CTO (who's engaged, but CISO is blocking)

Zenith Corp ($180K, 20 days)
├─ Risk: Timeline pressure (too many milestones, not enough time)
├─ POC progress: 55% complete, 5 milestones left
├─ Days left: 10 (close date is June 20)
├─ Effort remaining: 12 hours
├─ Can you do it? No, need product team help on custom integration
├─ Action: Meet with product to scope 2-hour solution (saves 8 hours of workaround time)

[View Details] [Add to Priority] [Snooze]
```

---

## Section 5: This Week's Timeline

```
📅 WEEK VIEW (Your POCs + Milestones + Calls)

Mon (Today)     | Tue             | Wed             | Thu             | Fri
────────────────┼─────────────────┼─────────────────┼─────────────────┼────────────
Acme 10am call  | Zenith API      | NextGen design  | GlobalTech       | Zenith
BLOCKER CHECK   | testing due     | doc due         | security call    | API testing
               |                 |                 | (to be scheduled)| due
               | Zenith API      |                 |                  |
               | 4h work due     | NextGen 3h work | GlobalTech       |
                                 |                 | call if scheduled|
```

This shows what's actually due and what you need to prep for.

---

## What Information Auto-Populates (Zero Manual Entry)

### From Salesforce
- Deal name, amount, stage, close date
- Owner, associated contacts
- Deal stage history (when did it move from demo to POC?)
- Custom fields (if any)

### From Email
- Latest customer emails (threaded by POC)
- Dates of emails (when did they last reply?)
- Key phrases auto-extracted ("firewall blocker," "security review," etc.)

### From Calendar
- Scheduled calls with customer
- Duration of past calls (indicates complexity)
- Attendees (shows who's engaged)
- Call time gaps (haven't spoken in X days?)

### From Gong (Optional)
- Call recording timestamps
- Key moments transcribed ("firewall," "blocker," "timeline")
- Sentiment (is customer frustrated? excited?)

---

## What You Manually Enter (Minimal, High-Value)

1. **POC Status Milestones** (Drag-drop list, check off as complete)
   ```
   ☑ Environment setup
   ☑ Data import testing
   ☑ API integration testing
   ☐ Performance validation
   ☐ Security review
   ☐ Handoff to customer support
   ```

2. **Blockers & Resolution Path** (Structured, not free-form notes)
   ```
   Title: Firewall blocks API calls
   Status: In customer's hands (customer IT investigating)
   ETA: 2 days
   Workaround available? Yes
   Probability impact if unresolved: 40% drop
   ```

3. **Next Actions** (One per POC)
   ```
   Action: Call CTO to check IT ticket status
   When: Today 3pm
   Prep needed: Workaround doc
   ```

That's it. Everything else is pulled from other tools.

---

## Why This Becomes the First Tab

### For the SE
- **One place to see all POCs** (not 5 different tools)
- **Knows exactly what to do next** (not "where are we with this deal?")
- **Prep is automatic** (relevant email history, calendar context, blocker status)
- **Time-saving** (no more digging through email, Slack, Salesforce, spreadsheet)

### For the Manager
- **Sees which POCs are at risk** (automatic early warning)
- **Sees which SEs are blocked** (and on what)
- **Sees SE allocation** (which POCs are taking most time)
- **Forecasting becomes possible** (if we close POCs in X days, deals close in Y days)

---

## The Integration Strategy

### Salesforce Integration (Mandatory)
- Read-only access to: deals, contacts, close dates, custom fields
- **Why read-only:** You're not trying to replace Salesforce, just read what's there
- **Sync:** Every 1 hour (near real-time, not instant)
- **Auth:** OAuth, manage at `/settings/integrations`

### Email Integration (Auto via Calendar)
- Read latest emails from customer email addresses (associated via Salesforce contacts)
- Extract last reply date, key phrases
- **Why:** Show customer's latest communication without SE manually copying it

### Calendar Integration (Already Done)
- Show upcoming calls with customers
- Extract attendee list from calendar invite
- **Why:** Know when next call is, who's joining

### Gong Integration (Optional, Phase 2)
- Read call transcripts
- Extract key moments
- **Why:** Know what was discussed, sentiment

---

## What This Looks Like Day 1 (Minimum)

```
HASHWORK FIRST TAB
├─ TODAY'S FOCUS
│  └─ 3 upcoming calls with POC prep context
│
├─ YOUR POCs (Kanban by status)
│  ├─ In progress (2)
│  ├─ Blocked (1)
│  └─ Blocked on customer (1)
│
├─ YOU'RE BLOCKING (Action items)
│  └─ 3 things due this week that you own
│
└─ AT-RISK POCs
   └─ Early warning if going cold or timeline pressure
```

**That's it.** No AI, no health scoring, no MEDDICC, no fancy algorithms.

Just: **"Here's what I need to know. Here's what I need to do."**

---

## What Makes This the First Tab

An SE opens Hashwork because:

1. **It's their command center for POCs** (everything else is noise)
2. **It saves 30 minutes every morning** (no more hunting through tools)
3. **It prevents surprises** (blocker going cold? You see it here first)
4. **It makes them faster** (pre-populated prep notes for calls)
5. **It makes them look better** (manager can see their work before it's asked)

If you build this correctly, SEs will open Hashwork before Salesforce.

**That's the product.**

---

## Implementation Priority (Next 4 Weeks)

### Week 1: Core Data Model & Salesforce Integration
- Extend schema: `POCMilestone`, `POCBlocker`, `POCAction`
- Build Salesforce OAuth integration
- Sync deals → POCs hourly
- Read contact, close date, amount from Salesforce

### Week 2: Email & Calendar Integration
- Existing auto-logging (from Phase 1) feeds into POC view
- Show latest email from each customer contact
- Show upcoming calls in "Today's Focus"
- Extract last contact date per POC

### Week 3: POC Status UI
- Kanban board: Your POCs by status
- Milestone checklist (drag-drop to complete)
- Blocker form (structured, not free-form)
- Next action field (one sentence, not paragraphs)

### Week 4: Risk & Alerts
- At-risk detection (no contact in 4+ days?)
- Timeline pressure (POC not on track for close date?)
- Action items (blockers you're responsible for, due dates)
- Early morning summary email (optional)

---

## The Honest Part

**This is NOT a presales operations platform. It's not Vivun.**

**This is NOT a deal board. It's not Salesforce.**

**This is an SE's workspace.**

And if you nail it, every SE will open it first.

Because it solves the problem no one else solves: **"What do I actually need to do today?"**

