# Hashwork Presales Research: Findings & Priorities
## One-Page Summary (May 2026)

---

## 🎯 The Market Is Converging on 3 Pillars

### 1. **MEDDICC Qualification** (Foundation)
- Every deal needs: Economic buyer, Champion, Pain (quantified), Decision criteria, Decision process, Competition
- **73% of enterprise SaaS uses MEDDICC** — adopters see 18% higher win rates, 24% larger deals
- **Hashwork Status:** Tracking stage but NOT tracking MEDDICC elements explicitly

### 2. **Conversation Intelligence** (Signals)
- **Gong approach:** 300+ data points from calls/emails predict win probability more accurately than rep opinion
- Gong is 21% more accurate than reps by week 4 of quarter
- **Hashwork Status:** Can auto-log calendar + email (good start) but no engagement signal analysis

### 3. **Resource & Forecast Intelligence** (Capacity)
- **Vivun approach:** Link presales effort to deal outcomes — measure ROI per engineer
- **Rocketlane approach:** Predict delivery risk weeks early via AI agents
- **Hashwork Status:** No resource tracking or probability-weighted forecasting

---

## 📊 Deal Attributes: Market Standard vs. Hashwork

### Hashwork Current Tracked
- Deal name, amount, stage, owner, created date, updated date, last activity date

### Hashwork Missing (Market Standard)
- ❌ **Economic buyer** (who has budget authority?)
- ❌ **Champion** (who's your internal seller?)
- ❌ **Pain statement** (quantified impact: "reduce X by Y%")
- ❌ **Decision criteria** (what must deal meet?)
- ❌ **Decision process** (RFP → eval → legal → procurement)
- ❌ **Competition** (who else are they evaluating?)
- ❌ **Probability** (80% likely to close vs. 20%?)
- ❌ **Stakeholder map** (all contacts + engagement level)
- ❌ **Risk flags** (legal block, budget uncertain, etc.)
- ❌ **Call/email engagement metrics** (how responsive are they?)

---

## 💚 Health Score: Current vs. Redesigned

### Current Algorithm
```
If no activity for 7+ days → Stalled/At Risk
If in stage > 30 days → Stalled/At Risk
```
**Problem:** Ignores qualification. A deal can be at-risk but actually super qualified.

### New Algorithm (MEDDICC-Based)
```
Qualification (30%) — Do we know economic buyer, champion, pain, decision process?
Momentum (30%) — Is activity accelerating or stalling?
Engagement (20%) — Are meetings happening, emails replied to quickly?
Stakeholders (15%) — Are multiple decision-makers involved and responsive?
Risk (5%) — Any legal blocks, budget concerns, competitive threats?

Result: 0-100 score with Color coding
  80-100: 🟢 Green (likely to close, healthy progression)
  50-79: 🟡 Amber (needs attention, missing info or slowing)
  0-49: 🔴 Red (at-risk, needs intervention or should be closed as lost)
```

**Example:** A deal in POC with no activity for 2 weeks (RED in old system) but fully MEDDICC qualified, meeting scheduled next week, and economic buyer engaged = 82 health (GREEN) because qualification + upcoming engagement matter more than current inactivity.

---

## 🚀 Implementation Priorities (Phased)

### Phase 2.5: Add MEDDICC Attributes (1 week, HIGHEST PRIORITY)
**Why:** Foundation for everything else. Must have before smart insights.

```
New fields:
- Economic buyer (contact link)
- Champion (contact link)
- Pain statement (text: "Reduce onboarding 6 → 3 weeks")
- Decision criteria (checklist: "RFP met", "Security cert", "TCO < $50K")
- Decision process (text: "RFP → eval → legal → procurement")
- Competitors (multi-select: "Competitor A", "Competitor B")
- Win probability (0-100, auto-calculated from health score)
```

**Effort:** 5-6 days
- Schema: 1 day (Prisma migration)
- API: 1 day (CRUD endpoints)
- UI: 2 days (add checklist to deal detail)
- Testing: 1 day

### Phase 3: Implement New Health Score (2 weeks)
**Why:** Current health scoring is crude. New algorithm is market-competitive.

```
Build lib/dealHealthV2.ts:
- Qualification score (0-100) from MEDDICC fields
- Momentum score (activity trend over 14 days)
- Engagement score (call cadence, email responsiveness)
- Stakeholder score (multi-threading, role coverage)
- Risk adjustment (legal blocks, overdue dates, etc.)

Integrate:
- Calculate on every deal save
- Show on Kanban cards (color: green/amber/red)
- Show progress bar on deal detail
- List deals by health tier on dashboard
```

**Effort:** 8-10 days
- Algorithm build: 3 days
- Integration: 2 days
- UI components: 2 days
- Testing + calibration: 2-3 days

### Phase 4: Engagement Intelligence (2 weeks)
**Why:** Auto-generate insights from existing email + calendar data.

```
Build engagement tracking:
- Days since last call (from calendar)
- Days since last email (from email auto-logging)
- Call count per contact
- Email reply velocity
- Multi-stakeholder engagement (how many people responding?)

Auto-generate insights:
- "↗ Accelerating: 2 calls this week (was 1 last week). Projected close: 30d"
- "⚠️ Slowing: Last email 9 days ago. Financial buyer has gone quiet"
- "✓ Strong: 3 stakeholders engaged. Good multi-threading."
```

**Effort:** 8-10 days
- Tracking logic: 3 days
- Insights engine: 3 days
- UI (trend charts, alerts): 2 days
- Testing: 2 days

### Phase 5: Risk Dashboard & Probability Forecasting (2 weeks, LATER)
**Why:** Presales leaders need this to manage pipeline and resource allocation.

```
Risk dashboard:
- Flag: legal block, budget uncertain, timeline risk, competitive threat
- Risk severity and days until resolution
- Affected deals by risk type

Probability forecasting:
- Weighted pipeline = sum of (deal_amount × win_probability)
- Compare to stage-based forecast (current system)
- Accuracy tracking: predicted close vs. actual
```

**Effort:** 8-10 days

---

## 📈 Expected Impact (Post-Implementation)

### Qualification Metrics
- 80% of deals have complete MEDDICC info (target by month 2)
- Avg. 30% faster qualification time

### Forecast Accuracy
- Predicted close date within 5 days of actual (vs. currently weeks off)
- Probability-weighted pipeline within 10% of actual close

### Win Rate Improvement
- Green health deals: 70%+ win rate (accurate signal)
- Red health deals: <20% win rate (effective early warning)

### Decision-Making Speed
- Early risk detection: catch "at-risk" status within 5 days vs. discovering deal is dead

---

## 🎯 Recommended Next Step

**Interview 2-3 presales engineers at early customers:**

Ask:
1. "What deal attributes do you track manually today that Hashwork doesn't have?"
2. "When do you know a deal is actually lost vs. just quiet?"
3. "Who do you need buy-in from, and in what order?"
4. "What decision criteria matter most for your deals?"
5. "What's the worst surprise — deal you thought was closing but doesn't?"

**Goal:** Validate that MEDDICC attributes and health score match their real workflow.

---

## 💡 Key Insight from Research

**Market leaders (Pipedrive, HubSpot, Gong, Vivun) converged on same idea:**

> **Deal probability ≠ Deal stage. Deal health depends on qualification + momentum + engagement.**

Hashwork's current approach (health = activity recency + days in stage) is backward. A deal can be quiet but perfectly qualified and on track to close. A deal can be active but actually stalled waiting for legal.

**MEDDICC attributes make this clear.** Once we track economic buyer, champion, pain, and decision process, we can score deals accurately regardless of activity level.

---

## Files Created
- `PRESALES_REQUIREMENTS_DOCUMENT.md` — Full PRD with implementation details
- `RESEARCH_FINDINGS_SUMMARY.md` — This file (executive summary)

