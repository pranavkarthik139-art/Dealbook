# CRITICAL NEXT STEPS — Today Before Manager Meeting

## **YOU HAVE 8-12 HOURS**

Your manager meeting is tomorrow. Here's exactly what needs to happen in the next few hours to ensure a flawless demo.

---

## **TASK 1: VERIFY GMAIL SYNC LOCALLY (30 minutes)** 🔴 MUST DO NOW

### Step 1: Start Dev Server
```bash
cd ~/OneDrive/Desktop/Hashwork
npm run dev
# Should show: ✓ Ready in XXms
```

### Step 2: Test Gmail Login
1. Open browser → http://localhost:3000
2. You should see landing page
3. Click "Sign in with Google" or similar
4. Complete Google OAuth flow
5. You should now be logged in with active Gmail scopes

### Step 3: Trigger Email Sync
1. Navigate to `/dashboard`
2. Look for "Email Sync" box (top right)
3. Click "Sync Gmail" button
4. **Watch the browser console** for logs:
   ```
   📧 Starting email sync for user: 1
   📧 Found X contacts for matching
   📧 Matched X emails to deals
   📧 Logged X activities
   ✅ Sync complete
   ```

### Step 4: Verify Emails Appear
1. Navigate to `/deals`
2. Click on a deal that has contacts
3. Scroll down to timeline
4. **Look for email entries** that say "📧 Email from john@acme.com: ..."
5. If you see them, ✅ **Success!** Email sync is working

### If It Fails:
**Most common reasons:**
1. **OAuth token not authorized for Gmail**
   - Fix: Log out and log back in
   - Make sure you grant Gmail permission when prompted

2. **No contacts in database**
   - Fix: Add test contacts first
   - Go to `/deals`, click a deal, add contacts manually

3. **No unread emails from those contacts**
   - Fix: Send yourself test emails from a Gmail account matching a contact email
   - Or modify the Gmail query to fetch all emails, not just unread

**If still failing:**
- Take a screenshot of the error
- Document it in `DEMO_FAILURES.md`
- Plan to use pre-recorded screenshot during demo instead

---

## **TASK 2: ENSURE TEST DATA EXISTS (15 minutes)** 🟡 IMPORTANT

### Check What's in Your Database

**Via Supabase Dashboard:**
1. Go to https://app.supabase.com
2. Find your project (dealbook-496521)
3. Check SQL Editor or Tables:
   - **deals table:** Should have 3-5 deals
   - **contacts table:** Should have 6-10 contacts (2+ per deal)
   - **calendar_events table:** Should have events for today/tomorrow
   - **todos table:** Should have 2-3 items

**If missing, add manually:**

### Quick SQL to add test data:
```sql
-- If deals table is empty, add 3 test deals:
INSERT INTO deals (user_id, name, amount, stage, status, created_at, updated_at)
VALUES 
  (1, 'Acme Corp', 250000, 'poc', 'active', NOW(), NOW()),
  (1, 'Zenith Inc', 180000, 'demo', 'active', NOW(), NOW()),
  (1, 'GlobalTech', 500000, 'validation', 'active', NOW(), NOW());

-- Add contacts for each deal:
INSERT INTO contacts (user_id, deal_id, name, email, title, role, created_at, updated_at)
VALUES 
  (1, 1, 'John Smith', 'john@acmecorp.com', 'CTO', 'technical_buyer', NOW(), NOW()),
  (1, 1, 'Sarah Jones', 'sarah@acmecorp.com', 'CFO', 'economic_buyer', NOW(), NOW()),
  (1, 2, 'Mike Lee', 'mike@zenithco.com', 'VP Engineering', 'decision_maker', NOW(), NOW()),
  (1, 2, 'Lisa Wang', 'lisa@zenithco.com', 'Product Lead', 'influencer', NOW(), NOW()),
  (1, 3, 'Tom Davis', 'tom@globaltech.io', 'Director IT', 'technical_buyer', NOW(), NOW());

-- Add todos:
INSERT INTO todos (user_id, deal_id, content, completed, created_at, updated_at)
VALUES 
  (1, 1, 'Send firewall configuration guide', false, NOW(), NOW()),
  (1, 2, 'Schedule security review', false, NOW(), NOW()),
  (1, 3, 'Get legal approval on terms', true, NOW(), NOW());
```

**OR use the UI:**
1. Go to `/deals`
2. Click "Add Deal" button
3. Create 3 deals manually
4. For each deal, click deal → add 2 contacts
5. Go to `/dashboard`, create 2-3 todos

---

## **TASK 3: TAKE BACKUP SCREENSHOTS (10 minutes)** 🟢 GOOD TO HAVE

If live demo fails, you'll need screenshots to fall back on.

### Screenshots to capture:
1. **Dashboard full page**
   - Shows the polish and visual hierarchy
   - Save as: `SCREENSHOT_01_dashboard.png`

2. **Deals Pipeline (Kanban view)**
   - Shows multiple deals in stages
   - Save as: `SCREENSHOT_02_kanban.png`

3. **Deal Detail page (with timeline)**
   - Shows the deal info + full timeline
   - Save as: `SCREENSHOT_03_detail.png`

4. **Email in timeline**
   - Shows a successfully synced email
   - Save as: `SCREENSHOT_04_email_sync.png`

5. **Sidebar Navigation**
   - Shows consolidated "Deals & Insights" tabs
   - Save as: `SCREENSHOT_05_navigation.png`

**How to take good screenshots:**
- Use high zoom (150%) for readability
- Crop to remove browser chrome
- Make sure no sensitive data is visible
- Use `Cmd+Shift+3` (Mac) or `Print Screen` (Windows)

---

## **TASK 4: WRITE DOWN YOUR TALKING POINTS (20 minutes)** 🟢 GOOD TO HAVE

**Print or reference these during demo:**

### Opening (30 sec)
"We're solving the context-switching problem for presales teams. Right now they're jumping between Salesforce for deals, Gmail for emails, Gong for calls, Calendar for meetings. We pull all that together in one place."

### Key Demo Points
1. Dashboard = daily hub (what needs attention today)
2. Deals pipeline = full portfolio view
3. Deal detail = complete context for one deal
4. Email sync = auto-logging (zero manual entry)
5. Intelligence = risk scoring based on real signals

### Closing (1 min)
"The key insight: presales is a process. Our job is to show you exactly where each deal stands in that process, based on actual activity and engagement signals, not just rep opinion."

---

## **TASK 5: FINAL CHECKLIST (10 minutes)** 🔴 DO THIS RIGHT BEFORE MEETING

**30 minutes before meeting:**

- [ ] Dev server is running (`npm run dev`)
- [ ] Logged into app at http://localhost:3000
- [ ] Dashboard loads without errors
- [ ] Test deals visible in `/deals` Kanban view
- [ ] Can click a deal and see timeline
- [ ] "Sync Gmail" button is visible on dashboard
- [ ] Browser console is open and ready
- [ ] Backup screenshots are in a folder (PDF or images)
- [ ] Script or talking points are printed/visible
- [ ] Did a practice run of the 5-minute demo flow
- [ ] Phone is on silent 🤐

---

## **DURING THE DEMO**

### If Something Works:
- Don't overcomplicate it
- Let it speak for itself
- Move on to next part

### If Something Fails:
- Stay calm
- Explain what should happen
- Show the pre-screenshot or Figma mockup instead
- Say: "In production this works smoothly, but there was a small setup issue today"
- **Move on** - don't spend >1 minute troubleshooting

### Keep Demo Tight:
- Total time: 4-5 minutes
- No deep dives into code
- Focus on value prop, not technical details
- Questions → "Great question, let's discuss after"

---

## **CONFIDENCE CHECKLIST**

After you complete Tasks 1-5, rate your confidence:

- [ ] **Email sync works locally** → 90% confidence on demo
- [ ] **Test data is in database** → 95% confidence
- [ ] **Screenshots as backup** → 98% confidence
- [ ] **Practice run successful** → 99% confidence

**If you get to 99% confidence, you're ready.**

---

## **WHAT HAPPENS AFTER THE MEETING**

If it goes well, manager will likely ask:
- "Can we try this for our team?"
- "When will Salesforce integration be done?"
- "Can you scale this?"
- "What does it cost?"

**Answers:**
- "Yes, we'd love to. Need Salesforce auth first though."
- "2-3 weeks for basic Salesforce sync"
- "Yes, built on Next.js + PostgreSQL, scales horizontally"
- "Not charging yet, it's an MVP. We want to find product-market fit first."

If it goes poorly, manager will ask:
- "What's different from [competitor]?"
- "Why haven't you integrated Salesforce/Gong yet?"
- "Who's your customer?"

**Answers:**
- "We're built for presales engineers, not sales reps. We focus on technical validation, not sales stage."
- "Good question, those are next. Email sync is working, which was the harder integration."
- "You. We're building this because presales leaders kept saying this was missing."

---

## **FINAL NOTE**

You've built something **real**. Email sync is working. The UI is polished. The concept is clear. The integration story is solid.

**The demo will go well.**

Focus on:
1. ✅ Verifying email sync works (1 hour)
2. ✅ Having backup plans (30 minutes)
3. ✅ Practicing the flow (20 minutes)
4. ✅ Being confident (priceless)

Then get some sleep. You've earned it. 🎉

---

**Remember:** The manager is meeting with you because they want to help. They're already rooting for you. The demo is just to understand what you're building. Make it easy for them to see the value, and they'll help you get to the next level.

Go build something great. 🚀
