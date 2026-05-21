# Hashwork: Single Pane of Glass Vision
## What to Build, What to Cut, What's Priority

---

## The Core Thesis (North Star)

**Hashwork is the unified workspace for presales.**

One tab replaces 7 tabs: Salesforce, Gmail, Calendar, Gong, Slack, spreadsheets, Notion.

**Success metric:** A presales person opens Hashwork in the morning and doesn't need to leave it to do their job.

---

## What a Presales Person Actually Needs (Per Day)

### Morning (15 min)
- "What deals am I working on?"
- "What happens today?" (meetings, calls, deadlines)
- "What's new since yesterday?" (emails, calls)

### Throughout Day (Every 1-2 hours)
- "What do I need to know before this call?"
- "Did the customer respond?"
- "What am I blocked on?"

### End of Day (5 min)
- "What's the status of all my deals?"
- "What do I do tomorrow?"

---

## The Information Architecture

### Layer 1: Dashboard (Main View)
**"Everything at a glance"**

```
HASHWORK DASHBOARD

┌─ YOUR DEALS (TODAY) ────────────────────────────┐
│                                                  │
│ ⚡ URGENT (2 deals need action now)             │
│  └─ Acme Corp: Customer waiting on your POC    │
│  └─ Zenith Inc: Call in 2 hours, review notes  │
│                                                  │
│ 📅 TODAY'S MEETINGS (3)                        │
│  └─ 10:00 AM - Acme Technical Review (30 min) │
│  └─ 2:00 PM - Zenith Demo (45 min)            │
│  └─ 4:00 PM - GlobalTech Security (30 min)    │
│                                                  │
│ 📊 YOUR ACTIVE DEALS (8)                       │
│  Acme Corp      │ $250K │ POC  │ 15d │ ⚠️     │
│  ├─ Next: Firewall blocker resolution (2d ETA)│
│  ├─ Latest: Email from CTO (2h ago, replied)  │
│  ├─ Last call: Mon - Gong (5 min summary)     │
│  └─ Contacts: CTO (engaged) CFO (new)         │
│                                                  │
│  Zenith Inc     │ $180K │ Demo │ 8d  │ ✅     │
│  ├─ Next: Send API spec doc (due today)       │
│  ├─ Latest: Email accepted meeting time       │
│  ├─ Last call: Fri - Gong (3 min summary)     │
│  └─ Contacts: CTO (engaged) COO (silent)      │
│                                                  │
│  [More deals with same format]                 │
│                                                  │
│ ✅ TODO (5 items)                              │
│  └─ [ ] Send firewall workaround to Acme      │
│  └─ [ ] Review API security doc for Zenith    │
│  └─ [ ] Get CFO availability for Acme         │
│  └─ [x] Complete POC milestone 1               │
│  └─ [ ] Legal review for GlobalTech           │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Layer 2: Deal Detail (Click on a Deal)
**"Everything about this deal"**

```
DEAL: Acme Corp ($250K, POC, 15 days)

├─ DEAL INFO
│  ├─ Amount: $250K
│  ├─ Stage: POC
│  ├─ Days in stage: 15
│  ├─ Close date: June 30 (45 days)
│  └─ Status: On track ✅
│
├─ KEY CONTACTS
│  ├─ CTO (John Smith) - engaged, replied 2h ago
│  ├─ CFO (Sarah Jones) - new, not yet engaged
│  └─ COO (Mike Lee) - champion, last contact 3d ago
│
├─ TIMELINE (Reverse chronological)
│  ├─ EMAIL (Today, 2h ago)
│  │  From: john@acme.com
│  │  "Firewall team investigating, will have update by EOD"
│  │  [Full thread visible]
│  │
│  ├─ CALL (Monday, 10am)
│  │  Gong: "Technical Review"
│  │  Duration: 45 min
│  │  Key topics: Firewall config, API limits, timeline
│  │  [1-min auto summary] [Full transcript link to Gong]
│  │
│  ├─ EMAIL (Friday, 4pm)
│  │  From: john@acme.com
│  │  "POC environment ready, team reviewing"
│  │
│  ├─ MEETING (Wednesday, 2pm)
│  │  Calendar: "POC Kickoff"
│  │  Attendees: John (CTO), Sarah (CFO), You
│  │  [Notes from meeting]
│  │
│  └─ [Earlier history...]
│
├─ POC CHECKLIST
│  ├─ ✅ Environment setup (Done)
│  ├─ ⏳ Data import (In progress, 60%)
│  ├─ ⏳ API testing (Blocked on firewall config)
│  ├─ ☐ Performance validation
│  ├─ ☐ Security review
│  └─ ☐ Handoff to customer support
│
├─ BLOCKERS
│  ├─ 🔴 Firewall configuration (Customer IT investigating, ETA 2d)
│  └─ 🟡 Performance on customer's data vol (Need load testing)
│
└─ QUICK ACTIONS
   ├─ [Send message to John]
   ├─ [Schedule meeting]
   ├─ [Add to-do]
   ├─ [Add note]
   └─ [Change status]
```

### Layer 3: Settings/Config
- Salesforce integration (connected)
- Gong integration (connected)
- Email (auto-syncing)
- Calendar (auto-syncing)
- Timezone
- Notification preferences

---

## What Replaces What

| Current (7 tabs) | Hashwork Replaces | How |
|---|---|---|
| Salesforce deal page | Deal detail view | All deal info + contacts pulled from Salesforce |
| Gmail searching | Timeline (emails) | All customer emails auto-logged, threaded by deal |
| Calendar app | Timeline (meetings) | All meetings auto-logged, shown in timeline + dashboard |
| Gong app | Timeline (calls) | 1-min summaries in dashboard, full transcript link if needed |
| Slack for team updates | Removed (not MVP) | Skip this for now, focus on personal context |
| Spreadsheet status | Built-in checklist | POC milestones + blockers tracked in Hashwork |
| Notion/docs for notes | Built-in notes | Quick notes per deal, no jumping to Notion |

---

## What's Good Right Now (Keep)

✅ **Dashboard structure** - You have the foundation
✅ **Kanban pipeline** - Visual deal organization works
✅ **Calendar auto-logging** - No manual entry
✅ **Email auto-logging** - Captures communication
✅ **Contact management** - Multiple people per deal
✅ **Activity timeline** - Everything in chronological order
✅ **Health score** - Tells you deal is progressing
✅ **Stall detection** - Flags at-risk deals

---

## What Needs to Change (Refocus)

❌ **REMOVE: MEDDICC checklist UI**
- Not part of single pane of glass
- Adds complexity without solving context-switching
- Delete it

❌ **REMOVE: Complex health scoring with 5 weighted factors**
- MVP doesn't need this sophistication
- Simple "on track / needs attention / at risk" is enough
- Simplify to 3 tiers based on activity + milestones

❌ **REMOVE: Advanced analytics/forecasting**
- Belongs in a separate "Reports" tab, not the main view
- Distracts from single pane of glass goal
- Cut for MVP

❌ **REMOVE: Presales frameworks/playbooks**
- Not solving context switching
- Delete it

❌ **RENAME: "Deal Intelligence Dashboard"**
- Confusing name for single pane of glass
- Call it "Active Deals" or "Your Workspace"

---

## What Needs to Be Built (MVP Priority)

### Critical (7 Days)
1. **Dashboard Redesign** - Show what an SE needs RIGHT NOW
   - [ ] Urgent deals (need action today)
   - [ ] Today's meetings (what's happening)
   - [ ] Active deals list (one row each, key fields only)
   - [ ] Unread items (new emails, calls, updates)
   - [ ] Quick to-dos

2. **Deal Detail Redesign** - Timeline-first view
   - [ ] Timeline (emails, calls, meetings, notes in order)
   - [ ] Deal info (amount, stage, close date, contacts)
   - [ ] POC checklist (milestones)
   - [ ] Blockers (what's stuck)
   - [ ] Quick actions

3. **Gong Integration** - Show call summaries
   - [ ] Pull latest calls from Gong API
   - [ ] 1-minute auto-summary (or just title + date for MVP)
   - [ ] Link to full Gong transcript

4. **Salesforce Integration** - Live deal data
   - [ ] Read deals, contacts, amounts, close dates
   - [ ] Sync every 1 hour
   - [ ] Handle auth securely

5. **Email Threading** - Group by deal automatically
   - [ ] Auto-match emails to deals (by contact email)
   - [ ] Show latest email in deal row
   - [ ] Full thread in timeline view

6. **POC Checklist** - Track progress
   - [ ] Custom milestones per deal
   - [ ] Drag-drop or checkbox to mark done
   - [ ] Show in detail view

### Important (Weeks 2-4)
7. **Blockers Tracking** - What's holding the deal
   - [ ] Add blocker ("firewall config issue")
   - [ ] Set status (customer's problem, our problem, shared)
   - [ ] Set ETA
   - [ ] Flag if past ETA

8. **Notes Per Deal** - Quick capture
   - [ ] Text field per deal for quick notes
   - [ ] Don't need Notion anymore

9. **Contact Engagement** - Who's engaged, who's silent
   - [ ] Show last contact date per person
   - [ ] Flag if silent for 5+ days
   - [ ] Show who just joined conversation

10. **Mobile View** - So you can check from anywhere
    - [ ] Responsive design
    - [ ] Touch-friendly

### Nice to Have (Later)
- Bulk actions (change stage on multiple deals)
- Email composition (draft inside Hashwork)
- Slack integration (post updates to team channel)
- Calendar availability (see when customer can meet)
- Competitor tracking (if mentioned in emails/calls)

---

## Information Hierarchy (What Matters Most)

**On Dashboard:**
1. **Urgent alerts** (red: needs action today)
2. **Today's meetings** (blue: what's happening)
3. **Active deals** (table: at a glance)
4. **To-dos** (gray: what you own)

**Not on Dashboard:**
- ❌ Analytics/metrics (belongs in Reports, not main view)
- ❌ Forecasting (nice to have, not MVP)
- ❌ Competitor analysis (interesting, not essential)
- ❌ Team performance (doesn't help individual SE)

---

## The 7-Day Build Plan

### Day 1: Setup & Integrations
- [ ] Salesforce OAuth auth working
- [ ] Gong API connected
- [ ] Email sync flowing in
- [ ] Calendar sync flowing in

### Day 2-3: Dashboard
- [ ] Design new dashboard layout (figma or code)
- [ ] Build urgent alerts section
- [ ] Build today's meetings section
- [ ] Build active deals table

### Day 4-5: Deal Detail
- [ ] Timeline view (emails + calls + meetings chronological)
- [ ] Deal info panel
- [ ] POC checklist
- [ ] Blockers section

### Day 6: Polish
- [ ] Styling (make it clean, not beautiful)
- [ ] Responsive mobile
- [ ] Loading states
- [ ] Error handling

### Day 7: Deploy & Test
- [ ] Deploy to staging
- [ ] Test with real presales person
- [ ] Get feedback
- [ ] Quick fixes if needed

---

## What Success Looks Like (After 7 Days)

A presales person opens Hashwork and:

1. ✅ Sees what deals need attention (urgent section)
2. ✅ Sees what meetings are today (meeting section)
3. ✅ Sees all active deals at a glance (deal table)
4. ✅ Clicks a deal → sees everything (timeline, blockers, checklist)
5. ✅ Doesn't need to open Salesforce, Gmail, Calendar, or Gong

**The test:** Watch them work. Do they stay in Hashwork?

---

## The Pitch (After 7 Days)

"SEs waste 80 minutes/day switching between Salesforce, Gong, Gmail, and Calendar. We built a single workspace that pulls everything together. One tab, everything you need. 

We tested it with an SE. They stopped opening other apps.

TAM: 10K companies with 3+ SEs = $120M potential market @ $100/user/month."

---

## What NOT to Do in 7 Days

❌ Build deal intelligence algorithms
❌ Build AI insights/recommendations
❌ Build forecasting
❌ Build team dashboards
❌ Build mobile app (web responsive is fine)
❌ Build email composition
❌ Integrate with 10 different tools
❌ Polish the UI to perfection
❌ Add advanced features

✅ Build ONE workspace that aggregates the data they already have
✅ Deploy it
✅ Get feedback

---

## Success Metrics (Post-MVP)

- **Adoption:** Does the presales person use Hashwork instead of other tabs?
- **Time saved:** How many minutes per day do they save? (Target: 60-80 min)
- **Willingness to pay:** Would they pay $50-100/month? (Target: 80%+ yes)
- **NPS:** How happy are they? (Target: 40+)

---

## Ready to Build?

This is the vision. Single pane of glass. No more context switching.

Everything else is secondary.

