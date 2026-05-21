# Hashwork: Manager Meeting Demo Script
## Tuesday, May 20, 2026 — Ready to Present

---

## **OPENING (30 seconds)**

"We're building a **single pane of glass** for presales teams. Here's the problem: Presales engineers waste 60-80 minutes per day jumping between Salesforce, Gong, Gmail, and Calendar. They open Salesforce to see the deal, then jump to Gmail to find the last email, then Gong to find the call recording, then Calendar to see what's next. We're solving that.

Everything a presales engineer needs is in one tab: deal status, communication history, next actions, risk indicators. No context switching."

---

## **DEMO FLOW (3-5 minutes)**

### **Part 1: Dashboard — Your Daily Hub (1 min)**

**Talking points:**
- "This is your workspace. At a glance you see:"
  1. **What calls are scheduled today** (from Google Calendar, auto-synced)
  2. **What deals need attention** (health scoring + stall detection)
  3. **What you need to do** (to-do list)
  4. **What happened recently** (activity feed)

**Action:**
- Scroll through dashboard to show all sections
- Point out how everything is consolidated: "No jumping to other tools"

---

### **Part 2: Deals Pipeline — Your Full Portfolio (1.5 min)**

**Talking points:**
- "Click into Deals. This is your pipeline. See all your deals organized by stage."
- "Each card shows: deal name, amount, stage, health score, last activity"
- Hover over a deal card to show hover effect
- "Let me click on one to see full context"

**Action:**
- Click on a deal card
- Show it opens with full details
- Point out the different tabs: Pipeline | Intelligence | Insights | Templates | Forecasting

---

### **Part 3: Deal Detail — Full Context in One Place (1.5 min)**

**Talking points:**
- "Here's a deal. Notice on the right side: it shows the health score, why it's at risk, what you need to do next"
- "Below: everything about this deal — all communication organized chronologically"
- "Emails, meetings, to-dos, all here. No jumping to Gmail or Gong"
- **[IMPORTANT]** "The bottom emails are auto-logged — this person didn't manually enter anything. We pull from Gmail automatically"

**Action:**
- Show timeline with emails + meetings + to-dos
- Scroll through to emphasize "everything in one place"
- Point out where auto-logged data appears

---

### **Part 4: Email Sync — The Magic (Live Demo!) (1 min)**

**Talking points:**
- "Watch this. I'm going to sync Gmail. This pulls in all emails from your contacts and matches them to deals automatically."

**Action:**
1. Click "Sync Gmail" button on dashboard
2. Show it syncing...
3. Watch it populate emails in the timeline
4. Point: "No manual data entry. No spreadsheets. Just automatic context"

**If it fails:** "This requires Gmail OAuth which is configured but may not be fully authorized yet. In production, first login authorizes it automatically."

---

### **Part 5: Deal Intelligence — Risk Scoring (30 sec)**

**Talking points:**
- "These health scores aren't arbitrary. We score each deal by real signals: Is anyone responding to emails? Are people engaged? Is activity accelerating or stalling?"

**Action:**
- Click Intelligence tab
- Show deals filtered by risk level
- "This red deal? No contact activity for 7 days. Only 1 stakeholder. It's at risk. We flag it so you prioritize the ones that will actually close."

---

## **THE PITCH (1 min)**

"We're building what presales teams have been asking for but no one has built: a tool that actually consolidates everything they need.

**The why:** Presales teams are managing 80% of the customer success work (determining if a deal is technically feasible, running POCs, managing stakeholder engagement) but they're using fragmented tools built for sales reps or DevOps engineers, not them.

**Our approach:** We pull data from Salesforce (deals + contacts), Calendar (meetings), Gmail (communication), and eventually Gong (calls) and surface it in a way that presales engineers actually think about: Is this deal going to close? What's blocking it? Who's engaged?

**The market:** Every B2B SaaS company with 3+ SEs and $50M+ ARR has this problem. That's thousands of companies.

**Where we're headed:** Right now we're focused on getting Salesforce + Gong integration really solid, implementing multi-user support so teams can use this together, and building the integrations so tight that it truly becomes the default tab."

---

## **HANDLING OBJECTIONS**

### **"We already have Salesforce for deal tracking"**
Response: "True, but Salesforce is built for sales reps. You see the deal info, but you have to jump to Gmail to see emails, Gong for calls, Calendar for meetings. Presales engineers need all of that in one timeline view focused on technical progress, not sales stage."

### **"There's already [Vivun / Gong / etc]"**
Response: "Those tools solve specific problems (Vivun is for SE operations, Gong is for conversation intelligence). We're solving the broader integration problem—presales engineers shouldn't need 4+ tabs open. We're the hub that brings everything together."

### **"Can't Salesforce just add this?"**
Response: "Possibly someday, but Salesforce moves slowly and they're optimizing for sales, not presales. We're built from the ground up for presales workflows. Plus we can integrate data from multiple sources (Gong, Navattic, etc) without waiting for Salesforce to build connectors."

### **"What about security / data privacy?"**
Response: "All data stays on your servers via secure OAuth. We never store credentials. Everything's encrypted in transit."

---

## **WHAT NOT TO SAY**

❌ "This is a POC tracker" (it's not — it's a deal health/context tool)
❌ "We're competing with Vivun" (we complement them)
❌ "We automate presales" (we consolidate, not automate)
❌ "This is AI-powered deal intelligence" (it's data aggregation + health scoring, no AI yet)
❌ "We'll replace Salesforce" (we integrate with it)

---

## **TECH STACK TO MENTION (if asked)**

- **Frontend:** Next.js 14 + React (modern, scalable)
- **Backend:** API routes + Prisma ORM (type-safe, flexible)
- **Database:** PostgreSQL (enterprise-grade)
- **Integrations:** Google Calendar (live), Gmail (live), Salesforce (in progress), Gong (in progress)
- **Auth:** NextAuth with OAuth (secure, user-friendly)

---

## **CLOSING**

"The key insight: presales is a process, not individual activities. Reps think 'I have a deal in negotiation.' Presales engineers think 'Is the technical fit proven? Who's engaged? What's blocking us?' We're building for how presales actually think."

---

## **POST-DEMO CONVERSATION STARTERS**

1. "What would actually make you use this instead of your current tools?"
2. "If we nailed the Salesforce integration, would that unlock it for your org?"
3. "What's the biggest pain in your current deal tracking workflow?"
4. "Would your team pay for a tool like this? How much?"
5. "Who do you know that would want to try this?"

---

## **TECHNICAL NOTES FOR TOMORROW**

**Make sure before the demo:**
1. ✅ All UI enhancements are applied (dashboard, deal cards, shadows, spacing)
2. ✅ Navigation consolidation is live (unified Deals & Insights tabs)
3. ✅ Gmail OAuth is properly scoped
4. ✅ Have 3-4 test deals in the database with contacts
5. ✅ Have sample emails to sync (or create fake test data)
6. ✅ Test the email sync flow locally before showing it live
7. ✅ Have a backup screenshot/video of email sync working (in case live demo fails)
8. ✅ Know the keyboard shortcut to search (Cmd+K)
9. ✅ Have the current competitor tool open in another tab to reference

**Backup plan if something breaks:**
- Show the code (GitHub) to explain architecture
- Show Figma mockups of the full vision
- Focus on the _concept_ being superior, even if the live demo has issues

---

## **SUCCESS METRICS FOR THIS MEETING**

✅ Manager understands the core value prop (single pane of glass = reduced context switching)
✅ Manager sees we're building on solid technical foundation (real integrations, not just a UI skin)
✅ Manager believes the market exists (presales teams DO have this problem)
✅ Manager wants to either:
   - Help connect us with VCs
   - Become an early customer
   - Introduce us to other presales leaders
✅ Manager gives us concrete feedback on what's missing or wrong in our approach
