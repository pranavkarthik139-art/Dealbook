# Milestone — UI & Workflow Audit

**Reviewed:** `Architecture.png`, `launchpad_pg1.html` (Pilot Command Center / deal detail), `launchpad pg2.html` (POC Dashboard / list view)
**Date:** May 11, 2026

---

## TL;DR

You've built a stylistically distinctive presales tool — the Playfair + DM Sans pairing, restrained paper/charcoal/cobalt palette, and 0.5px borders give it a quiet editorial tone that almost no other SaaS in this category has. Keep that.

But the architecture promises a Presales → Handoff → Onboarding product, and the UI is currently 100% Presales. The single most valuable thing you can build next is the **Handoff screen** — it's your unique wedge and it's the screen no competitor has nailed. Everything else in this audit is supporting work.

Three things are quietly working against you right now: (1) too many overlapping color systems, (2) a navigation model that hasn't decided whether it's deal-stage-centric or module-centric, and (3) the AI layer is in the architecture diagram but invisible in the UI. Fix those three and the rest is polish.

---

## What's working — keep doing this

The visual system. Specifically:

- The Playfair Display headlines on a paper background feel like a financial-times-meets-modern-saas register that nothing else in presales tooling has.
- 0.5px borders, soft shadows, the cobalt-faint background system — the restraint is the asset.
- Subtle entry animations (the staggered `fadeUp` on KPI cards) are the right amount of motion.
- The MAP checkbox interaction — clicking a row to toggle done with strikethrough — is satisfying and obvious.
- The vendor-side / prospect-side split inside the Mutual Action Plan is structurally smart; it captures something real about how presales works.
- Pulse Feed as an event stream is a strong concept — every customer-facing tool needs one.

---

## P0 — Strategic / structural issues

These are the "stop and think before more polish" items.

### 1. The product's reason for being is missing from the UI

Your architecture pitch is bridging Presales → Handoff → Onboarding with a single source of truth. But both mockups are entirely presales views — there is no Handoff screen, no Onboarding screen, no view that sits at the seam between the two. The Handoff column of the architecture (Close Snapshot, Handoff Briefing, Kickoff Planner) is the differentiator. Every CRM has a presales dashboard. Almost nothing handles handoff well.

**Recommend:** Make Handoff screen #1 of the new prototypes. It will force you to design the data model (what flows from a closed deal into the onboarding plan) and that pressure-tests the whole product.

### 2. The navigation model is undecided

The pg2 sidebar lists *POC Overview, Active Trials, Clients, Deal Intelligence* — these are roughly synonymous. None of them map to the architecture's three stages. A presales rep wondering "what's blocked across all my deals at handoff" has no path.

You need to commit to one of:
- **Stage-centric nav** — Presales · Handoff · Onboarding as primary, with module sub-nav inside each.
- **Module-centric nav** — Deal Room, Stakeholder Map, MAP, etc. as siblings, with stage as a filter.
- **Deal-centric nav** — list of deals is the primary surface; everything else is contextual.

I'd recommend **deal-centric** — a presales rep thinks "what do I need to do for Aether today," not "show me the stakeholder map module." The current pg2 is already mostly this; just commit and remove the redundant sidebar entries.

### 3. The AI layer is invisible

Architecture says "auto-fill handoff docs · flag at-risk deals · suggest next actions · draft client comms." UI shows zero of this. No "next best action" card, no draft-and-review pattern, no risk flags surfaced as alerts.

**Recommend:** Every screen should have one obvious AI surface. Dashboard → "3 deals need attention today." Deal detail → "Suggested next action: send Aether the bulk-export workaround doc." Handoff → "Draft kickoff briefing from this deal."

### 4. Module count vs. actual screens

Architecture lists 9+ modules. The launchpad currently surfaces ~3 (POC Tracker, Mutual Action Plan, Pulse Feed). Either modules collapse into deal detail tabs, or each is a screen, or some are surfaces inside others. This needs a one-page IA decision before you build more screens.

---

## P1 — Visual / UX issues with high payoff

### 5. Too many competing color systems

Pg1 stacks: priority tags (3 levels of color), status tags (4 levels), stage badges (4 levels), owner avatars (3 colors), pulse icons (5 backgrounds). A user trying to scan visually has no idea which color carries the most weight.

**Recommend:** Pick a hierarchy. Cobalt = primary action / current focus. Amber = needs attention. Red = blocker / overdue. Green = done. Gray = neutral. Use color sparingly — one or two per row, not five.

### 6. Inconsistent green meaning

`stage-active` (green) means "in progress." `done-green` checkbox means "completed." `delta-up` (green) means "improvement." Three meanings of green in one product. Pick one (I'd say green = done) and recolor the others.

### 7. Emoji icons in Pulse Feed (`👁 ✓ 💬 📄 🔗 🎯 ⚠ 📅`)

These render differently across OSes (Mac native emoji vs. Windows vs. web fallback) and break the editorial type tone. Replace with a small line-icon SVG set — you can use Lucide or hand-rolled, doesn't matter, just consistent stroke + style.

### 8. Serif font is overused

Playfair currently sets: page titles, card titles, KPI values, client names in tables, client names in timelines, even inside cells (`tl-client`). When everything is a headline, nothing is. Reserve serif for true page titles and one signature element per card. Use DM Sans for everything else, including KPI numbers (use `font-feature-settings: 'tnum'` for tabular figures).

### 9. The 5-stage roadmap on pg1 is cramped

5 stages in a horizontal row with stage name + sub + badge each is tight at 1024px and breaks below. Two options:
- Keep horizontal but show only stage names by default; expand active stage inline with sub + badge.
- Switch to vertical stepper on the right rail, freeing the top for a more important "today" summary.

### 10. Pulse Feed and Activity Timeline are two designs of the same concept

Pg1 has Pulse Feed (per-deal, vertical, icon + content). Pg2 has Recent Activity (cross-deal, vertical, dot + content). Same thing, two implementations. Build one `<ActivityStream>` component with a `scope="deal" | "global"` prop.

### 11. No empty / loading / error states

Common missing states: 0 active POCs, table loading skeleton, MAP item save failure, "no activity yet for this deal," AI suggestion timeout. These are usually where polish products separate from prototype ones.

### 12. Clickability isn't obvious

The MAP rows are clickable (toggle done) but have no hover state. The pg2 table rows have a faint hover (`background:rgba(0,71,255,0.015)`) but no cursor change or arrow affordance. Add cursor:pointer + a subtle arrow on hover for any row that opens a detail.

---

## P2 — Polish / consistency

### 13. Density inconsistency

Pg2 (list) has generous breathing room. Pg1 (detail) is tight — 3-col grid at `1fr 1fr 280px` makes the right Pulse Feed feel cramped at typical laptop widths. Detail pages should feel calmer, not busier.

### 14. No breadcrumbs / location indicator

"← All POCs" is a back link, not a location. With multiple modules + multiple deals you'll need: `Deals / Aether Logistics / POC Tracker` so users can jump up the tree.

### 15. Vendor vs. Prospect MAP styling

Right now vendor (SE) tasks use cobalt-on-done; prospect tasks use green-on-done. Same action, different appearance. Use one done state; differentiate by the owner badge label, not the check color.

### 16. Q2-on-track widget at the bottom of the sidebar

It's nice, but it's calling attention away from the primary action area. Either move it inline near the KPIs, or make it a quieter persistent footer.

### 17. Topbar action buttons (`Filter`, `Export`, `+ New POC`)

Filter/Export are listed before "New POC" but have no current binding. Either build the panels or remove them until they do something. Empty buttons train users to ignore your UI.

### 18. Win Rate / Avg. Duration KPI cards on pg2

These are fine, but there's no way to drill into them. A KPI without a "see how this is computed / which deals are dragging it down" link is a vanity metric.

---

## Interactivity

### 19. Filter pills on pg2 don't filter

`All / In Progress / Review / Won` toggle classes but the table doesn't react.

### 20. No global command bar

For someone juggling 12 deals, `cmd+K` to "jump to Aether" is the difference between a tool used hourly and a tool used weekly. This is table-stakes for any modern SaaS.

### 21. AI suggestions need a draft / accept / regenerate pattern

When AI proposes a next action or a draft email, the user should always see: the suggestion, why it suggested it, accept / edit / regenerate / dismiss.

### 22. No persistence

MAP toggles, filter selections, etc. don't survive a refresh. Fine for a static mockup, but worth noting for the build phase.

---

## What I'm building alongside this

Three new prototype HTMLs in `/prototypes/`, addressing the P0 + P1 items, **not** overwriting your originals:

1. **`prototype_dashboard.html`** — refined pg2 with deal-centric IA, command bar (cmd+K), AI "today" panel, unified activity stream, single color system.
2. **`prototype_deal.html`** — refined pg1 with vertical stepper, AI next-action card, consolidated colors, line-icon activity stream, working filter/density pass.
3. **`prototype_handoff.html`** — the missing Handoff screen. Closed deal → auto-generated handoff briefing → kickoff planner → onboarding plan, all in one workflow.

Compare side by side and tell me what to keep, change, or kill.
