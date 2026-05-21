# Hashwork: Keep, Enhance, Add Roadmap
## Iterate Existing Product Toward Single Pane of Glass (7 Days)

---

## What You Have (KEEP)

All of this stays. Just reorient the emphasis.

### ✅ Dashboard
- Today's focus (upcoming calls)
- Timezone selector
- Todo list
- Activity feed
- Stage analytics
- Deals snapshot

**Why it matters:** This IS the single pane of glass starting point. Keep it, just make it the HERO of the product.

### ✅ Deals Kanban
- 4 stages (demo → POC → validation → closed)
- Deal cards with health scores
- Drag-drop to move stages
- Stall detection (days without activity)

**Why it matters:** Visual deal organization. Some SEs prefer table, some prefer kanban. Both exist, both needed.

### ✅ Deal Detail Page
- Deal info (name, amount, stage, status, close date)
- Contacts (name, title, email, role, engagement)
- Todo items tied to deal
- Calendar events tied to deal
- Activity timeline

**Why it matters:** This is deal context. Don't need to rebuild, just reorient.

### ✅ Auto-Logging (Calendar + Email)
- Calendar events auto-captured
- Emails auto-captured
- Activity feeds built from this data

**Why it matters:** THE foundation of single pane of glass. Zero manual entry = adoption.

### ✅ Contact Management
- Multiple contacts per deal
- Contact roles/titles
- Last contacted date
- Engagement tracking (implicit from activity)

**Why it matters:** You need to see who's engaged, who's silent. Already there.

### ✅ Health Score & Stall Detection
- Health scores on cards
- Stall detection (no activity for X days)
- Colors (green/amber/red)

**Why it matters:** Tells you deal status at a glance. Keep it.

---

## What Needs EMPHASIS SHIFT (Reorient)

### 1. Dashboard → Position as "Your Workspace"

**Current:** "Dashboard" tab with various sections
**Shift to:** Make it the DEFAULT view, hero view, never-leave-this view

Change:
- [ ] Rename "Dashboard" to "Workspace" or keep "Dashboard" but emphasize it's your main interface
- [ ] Make it the landing page (already is, good)
- [ ] Highlight: "This is where everything happens"
- [ ] Remove secondary info (things that belong in Reports tab)
- [ ] Add: What they NEED to see right now

### 2. Deal Detail → Position as "Full Context"

**Current:** Deal page has info scattered
**Shift to:** Timeline-first view where everything flows chronologically

Change:
- [ ] Put timeline front and center (emails, calls, meetings, todos chronologically)
- [ ] Deal info becomes sidebar, not main content
- [ ] Make it easy to see "what's happened, what's next, what's blocked"

### 3. Auto-Logging → Position as "You Never Update Anything"

**Current:** Works behind the scenes
**Shift to:** Make it a selling point and feature highlight

Change:
- [ ] Add a badge/indicator: "Auto-syncing from: Salesforce, Gmail, Calendar, Gong"
- [ ] Show "Last updated 2 minutes ago" on deals (proves auto-logging works)
- [ ] In onboarding: "Connect your accounts once, we handle the rest"

### 4. Health Score → Position as "Deal Status at a Glance"

**Current:** Complex algorithm, not explained
**Shift to:** Simple "On Track / Needs Attention / At Risk"

Change:
- [ ] Don't expose MEDDICC (keep it internal)
- [ ] Show 3 tiers instead of 0-100 score
- [ ] Tooltip: "On track because: activity this week, 2 stakeholders engaged, POC progressing"
- [ ] Make it simple and obvious

### 5. Contacts → Position as "Who's Engaged"

**Current:** Just a list
**Shift to:** Engagement visibility

Change:
- [ ] Show engagement level: "Engaged (replied 2h ago)" / "Moderate (no reply in 3d)" / "Silent (no contact in 5d)"
- [ ] Color code (green/amber/red)
- [ ] Flag if key person (economic buyer, champion) is silent → risk signal
- [ ] On dashboard deal row: Show "3 engaged, 1 silent"

---

## What Needs to Be ADDED (7 Days)

### Critical Additions

#### 1. **Deal Row on Dashboard Should Show More Context**

**Current:**
```
Deal name | Amount | Stage | Health
```

**Add:**
```
Deal name | Amount | Stage | Health
└─ Next action: (e.g., "Call CTO to check firewall status")
└─ Last update: "Email from CTO 2h ago"
└─ Contacts: "3 engaged, 1 silent"
```

**Why:** Presales person can see everything they need without clicking into the deal.

**Effort:** 1-2 days (mostly UI, data already exists)

---

#### 2. **Gong Call Summaries in Timeline**

**Current:** Email + calendar events in timeline, no Gong

**Add:**
- Pull latest Gong calls for each deal
- Show in timeline: "Call - Mon 10am - Firewall discussion"
- 1-line summary or just title + date for MVP
- Link to full Gong transcript

**Why:** Can't have "single pane of glass" if calls aren't visible. Currently they need to jump to Gong.

**Effort:** 2-3 days (API integration + display)

---

#### 3. **POC Milestone Checklist**

**Current:** Todos are general, not deal-specific milestones

**Add:**
- Per-deal milestone checklist (customizable)
- Example: "Environment setup" → "Data import" → "API testing" → "Security review" → "Handoff"
- Drag-drop or checkbox to mark done
- Show progress % on deal card
- Show in deal detail view

**Why:** Presales person needs to track POC progress without opening spreadsheet. This replaces the spreadsheet.

**Effort:** 2-3 days (form builder + storage)

---

#### 4. **Blocker Tracking**

**Current:** Notes/comments in deal, not structured

**Add:**
- Structured blocker field per deal
- Fields: Description | Status (customer's problem / our problem / shared) | ETA | Notes
- Example: "Firewall config blocking API calls | Customer's IT investigating | 2 days | Using HTTP workaround meantime"
- Show in deal detail prominently
- Flag if blocker is past ETA (risk signal)

**Why:** Presales person needs to track what's stuck and why. Enables risk intelligence.

**Effort:** 1-2 days

---

#### 5. **Quick Notes Per Deal**

**Current:** Activity timeline shows emails/calls, no quick capture

**Add:**
- Text field per deal: "Quick notes"
- For things that don't fit elsewhere (thoughts, observations, context)
- Not a full Notion replacement, just quick capture
- Timestamp when written

**Why:** No more jumping to Notion. Can keep context in Hashwork.

**Effort:** 1 day

---

#### 6. **Contact Engagement Visibility**

**Current:** Contacts listed, no engagement status

**Add:**
- For each contact: Last contact date + engagement level (Engaged / Moderate / Silent)
- Calculate: "Last contact < 3 days → Engaged", "3-5 days → Moderate", "5+ days → Silent"
- Show on deal card: "3 engaged, 1 silent"
- On detail page: List with colors
- Flag if economic buyer/champion is silent

**Why:** Know at a glance who's engaged and who's gone quiet.

**Effort:** 1-2 days

---

### Total 7-Day Effort

| Addition | Days | Complexity |
|----------|------|-----------|
| Enhance dashboard deal rows | 1-2 | Low |
| Gong call summaries | 2-3 | Medium |
| POC milestones | 2-3 | Medium |
| Blocker tracking | 1-2 | Low |
| Quick notes | 1 | Low |
| Contact engagement | 1-2 | Low |
| **Total** | **9-13 days** | - |

**Reality:** You have more than 7 days if you prioritize. Do this:

**Days 1-3 (Critical):**
- [ ] Gong call summaries
- [ ] POC milestone checklist
- [ ] Enhance dashboard deal rows with more context

**Days 4-5 (Important):**
- [ ] Blocker tracking
- [ ] Contact engagement visibility

**Days 6-7 (Nice to have):**
- [ ] Quick notes per deal
- [ ] Polish and test

---

## How This Achieves "Single Pane of Glass"

**Before:**
```
Open Salesforce → see deal info
Open Gong → see call recording
Open Gmail → search for email thread
Open Calendar → see meetings
Open spreadsheet → check POC progress
```
= 5+ context switches, 20+ minutes

**After Hashwork:**
```
Open Hashwork
├─ Dashboard shows: What needs attention today
├─ Click deal → see: All communication (emails, calls), All meetings, POC progress, Blockers, Who's engaged
└─ Everything is here
```
= 1 place, 2 minutes

---

## What This Looks Like (Deal Row on Dashboard)

### Before
```
Acme Corp | $250K | POC | 🟡
```

### After (Single Pane of Glass)
```
Acme Corp | $250K | POC | 🟡 On Track
├─ Next: Call CTO Wed 2pm to check firewall status (blocked on this)
├─ Latest: Email from CTO - "IT investigating, update by EOD"
├─ Last call: Mon 10am - Gong call (firewall discussion)
├─ POC: 70% complete (7 of 10 milestones) - Blocked on firewall
└─ Contacts: CTO (engaged, 2h ago) | CFO (new) | COO (silent, 3d)

[Click to expand] [Click deal to see full context]
```

**This is everything they need to know without leaving Hashwork.**

---

## Implementation Priority (Realistic 7 Days)

### Must Have (Do This Week)
1. Gong call summaries in timeline
2. POC milestone checklist
3. Blocker tracking

### Should Have (Week 2)
4. Contact engagement visibility
5. Enhanced dashboard deal rows

### Nice to Have (Week 3+)
6. Quick notes per deal
7. Advanced features (AI insights, forecasting, etc.)

---

## The Outcome (After 7 Days)

A presales person opens Hashwork and:

1. ✅ Sees what deals need attention (dashboard)
2. ✅ Sees what POC milestones are stuck (milestones checklist)
3. ✅ Sees who's engaged vs. silent (contact engagement)
4. ✅ Sees latest communication (timeline with emails + Gong calls)
5. ✅ Sees what's blocking the deal (blocker tracking)
6. ✅ **Never needs to open Salesforce, Gong, or Gmail for deal context**

---

## Testing Validation

After 7 days, test with 1 presales person:

- [ ] Can they see everything they need on dashboard?
- [ ] Do they click into deal for more detail or can they manage from dashboard?
- [ ] Do they jump to Gong? (If yes, summaries weren't enough)
- [ ] Do they jump to Salesforce? (If yes, deal info wasn't clear enough)
- [ ] Do they jump to Gmail? (If yes, timeline wasn't complete)
- [ ] Do they open spreadsheet? (If yes, milestones or blockers weren't clear)
- [ ] Ideal: Zero jumps to other apps

**Success:** They stay in Hashwork

---

## Messaging (For Your Mentor / VC)

"We built the unified workspace for presales. Everything they need is in one place: deal status, POC progress, communication history, blockers, contact engagement—all auto-synced from Salesforce, Gmail, Calendar, and Gong.

Result: No more context switching. An SE can manage their entire pipeline from one tab.

We tested it. They stopped opening other apps."

