# Auto-Activity Logging + Stall Detection: Implementation Timeline

## Option 1: Stall Detection Only (FASTEST - Recommended First)

**Scope:** Deal health + stall algorithm, dashboard badges, filter UI  
**No new integrations needed - pure logic**

### Timeline: 1 Day (6-8 hours)

#### Day 1: Stall Detection MVP
- **1 hour**: Update `lib/dealHealth.ts` with stall detection algorithm
  - Calculate days since last activity
  - Stage-specific stall thresholds (demo: 14d, poc: 21d, validation: 14d)
  - Return `{ isStalled: boolean, daysStalled: number, risk: 'critical'|'warning'|'ok' }`

- **30 min**: Update `/api/deals/route.ts` to include stall in response
  ```json
  {
    "deals": [{
      "id": 23,
      "name": "Acme Corp",
      "health": 45,
      "stall": {
        "isStalled": true,
        "daysStalled": 23,
        "risk": "critical"
      }
    }]
  }
  ```

- **2 hours**: Update deal cards in Kanban/Grid view to show stall badge
  - Red badge: "🔴 STALLED: 23 days"
  - Amber badge: "🟡 WARNING: 10 days"
  - Visual prominence (top of card, larger text)

- **1.5 hours**: Add "Stall Status" filter to deals page
  - Dropdown: All / OK / Warning / Critical
  - Filter deals by stall status

- **1 hour**: Add dashboard alert banner
  - "⚠️ 3 deals are stalled. [View Stalls]" link
  - Shows top 3 critical stalls

- **1 hour**: Manual testing in browser
  - Verify stall detection triggers correctly
  - Test filters work
  - Check UI looks good

**Deliverable:** Stalls are visible, detectable, and actionable  
**Value:** Catch deals going silent immediately  
**Ship Date:** Today or tomorrow morning

---

## Option 2: Stall Detection + Calendar Auto-Logging

**Scope:** Everything above + auto-log calendar meetings  
**Uses existing calendar integration, no new OAuth needed**

### Timeline: 2 Days (12-14 hours)

#### Day 1: Stall Detection (6-8 hours) - See Option 1

#### Day 2: Calendar Auto-Logging (4-6 hours)
- **1 hour**: Add migration to update ActivityLog table
  - Add `source` field: 'manual' | 'calendar' | 'gmail' | 'call'
  - Add `externalId` field (for dedup: calendar event ID)

- **1.5 hours**: Update `/api/calendar/sync` endpoint
  - When syncing events, create ActivityLog entries for each event
  - Log: `{ action: 'meeting_scheduled', description: 'POC Demo with Acme - 1hr', source: 'calendar', dealId: X }`
  - Check externalId to avoid duplicate logging if re-syncing same event

- **1.5 hours**: Update deal detail view activity timeline
  - Show calendar events mixed with manual activities
  - Format: "📅 Meeting: POC Demo with Acme (May 24, 2pm)"
  - Show in reverse chronological order

- **1 hour**: Testing
  - Sync calendar, verify activities appear
  - Check for duplicates if re-syncing
  - Verify activity timeline looks good

**Deliverable:** Stalls visible + calendar meetings auto-logged  
**Value:** 30% reduction in manual logging (meetings no longer manual)  
**Ship Date:** Day after tomorrow

---

## Option 3: Full Auto-Activity Logging (Complete)

**Scope:** Everything above + Gmail integration  
**Highest complexity, highest value**

### Timeline: 4-5 Days (28-35 hours)

#### Days 1-2: Stall Detection + Calendar (12-14 hours) - See Options 1 & 2

#### Days 3-5: Gmail Auto-Logging (14-20 hours)

- **2 hours**: Google OAuth setup
  - Create OAuth 2.0 credentials in Google Cloud Console
  - Add Gmail OAuth flow to settings page
  - Store refresh token securely in UserPreference table

- **2 hours**: Gmail API integration
  - Fetch emails from Gmail API (past 24 hours)
  - Parse sender, recipient, subject, timestamp
  - Store in new `GmailEmail` table or DealActivity

- **3-4 hours**: Contact → Deal matching (tricky part)
  - For each email, figure out which deal it belongs to
  - Strategy 1 (simple): Email domain matches deal contact domain
  - Strategy 2 (better): Email recipient/sender matches deal contact email
  - Strategy 3 (best): Use fuzzy matching on name + company
  - Start with strategy 2, iterate based on real data

- **2 hours**: Activity logging
  - Create ActivityLog entries for emails
  - Log: `{ action: 'email_sent', description: 'Email to john@acme.com: Architecture Review', source: 'gmail', dealId: X }`
  - Also log replies: `{ action: 'email_received', description: 'John replied: Looks great...', source: 'gmail', dealId: X }`

- **2 hours**: Sync job setup
  - Create background job (or serverless function) to sync emails hourly
  - Check for new emails, create activities, update lastActivityAt
  - Handle errors gracefully (if Gmail API fails, don't break the deal)

- **1-2 hours**: UI updates
  - Show "Gmail connected ✓" in preferences
  - Add "Last email: john@acme.com (2 hours ago)" to deal cards
  - Option to disconnect/re-authenticate

- **2-3 hours**: Testing (most complex part)
  - Test Gmail OAuth flow
  - Send test emails, verify they get logged
  - Test contact matching (especially edge cases)
  - Test hourly sync job
  - Verify no duplicate logging
  - Check for privacy issues (are we storing emails safely?)

**Deliverable:** Full auto-activity logging (emails + calendar + stalls)  
**Value:** 90% reduction in manual logging, comprehensive deal visibility  
**Ship Date:** End of Week 1

---

## Realistic Timeline (with debugging buffer)

| Option | Estimate | Reality | Ready by |
|--------|----------|---------|----------|
| Stall Only | 6-8 hrs | 8-10 hrs | Tomorrow |
| Stall + Calendar | 12-14 hrs | 15-18 hrs | Day after tomorrow |
| All 3 (Complete) | 28-35 hrs | 35-45 hrs | End of week |

**Why reality > estimate:**
- Unexpected bugs (always ~20-30% more time)
- Testing edge cases (emails with multiple recipients, recurring meetings, etc.)
- Debugging contact matching (why didn't this email get logged?)
- Database migration issues
- Browser cache issues during testing
- Off-by-one errors in stall detection

---

## My Recommendation: Start with Option 1 TODAY

### Why stall detection first?
1. **Ships today/tomorrow** - Immediate value
2. **Validates the concept** - See if SEs care about stall alerts
3. **No new tech debt** - Pure algorithm, no integrations
4. **Confidence booster** - One win before tackling complex integration
5. **Foundation for phase 2** - Stall detection makes calendar logging more valuable

### Then, do calendar (Day 2-3)
- Extends what you already have
- Builds momentum
- Calendar + stall detection = 60% of the value with 2 days work

### Finally, Gmail (Week 2)
- More complex, but doable
- Full auto-activity logging
- Can iterate and refine contact matching based on real data

---

## I Can Start Right Now

Pick one:

**Option A:** I build Stall Detection (1 day) - Ship tomorrow morning
**Option B:** I build Stall + Calendar (2 days) - Ship Wednesday  
**Option C:** I build all 3 (4-5 days) - Ship end of week

Which do you want? I'll start the implementation immediately.

**My vote:** Start with Option A (stall detection), ship it, demo to your team, get feedback, then move to Calendar.

The first win is worth more than the perfect solution shipped later.
