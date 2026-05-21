# Phase 4: Enterprise Features Implementation Guide

## Overview

Phase 4 adds 5 Rocketlane-inspired enterprise features to Hashwork:

1. **Process Templates** - Create once, reuse forever deal workflows
2. **Automation & SmartFill** - Auto-populate deal info and trigger actions
3. **Customer Collaboration Portal** - Share deal progress with prospects
4. **Resource Forecasting** - Project resource needs and pipeline revenue
5. **360° Visibility** - Enhanced analytics with trends and forecasting

---

## Database Schema

The Prisma schema has been updated with the following new models:

### Core Models
- **User** - Foundational user model (replaces hardcoded USER_ID)
- **DealTemplate** - Reusable deal workflow templates
- **DealTemplateStage** - Stages within a template
- **DealTemplateMilestone** - Milestones/checklist items in a template

### Automation Models
- **DealAutomation** - Automation rule definitions
- **DealAutomationRule** - Individual conditions/rules
- **AutomationExecution** - Execution history and logs

### Collaboration Models
- **SharedDeal** - Share configuration for deals
- **CollaborationComment** - Comments on shared deals

### Forecasting Models
- **Resource** - People, services, infrastructure
- **ResourceAllocation** - Allocate resources to deals
- **Forecast** - Revenue and capacity forecasts

### Updated Models
- **Deal** - Added templateId, probability, expectedCloseDate, and relations to all Phase 4 models

**Migration Status**: ⚠️ **PENDING** - Database credentials need to be verified with Supabase
- Run migration when DB is ready: `npx prisma migrate dev --name add_user_and_phase4_enterprise_features`
- Prisma client generated: ✅ Schema is valid

---

## API Endpoints

### Templates API

```
GET    /api/templates                    List all templates
POST   /api/templates                    Create new template
GET    /api/templates/:id                Get template details
PATCH  /api/templates/:id                Update template
DELETE /api/templates/:id                Delete template
POST   /api/templates/:id/apply          Apply template to deal (create todos, set stage, etc.)
```

**Example: Create Template**
```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise SaaS Deal",
    "dealType": "enterprise",
    "expectedDuration": 60,
    "estimatedValue": 500000,
    "stages": [
      { "stageName": "demo", "expectedDays": 14 },
      { "stageName": "poc", "expectedDays": 21 },
      { "stageName": "validation", "expectedDays": 14 }
    ],
    "milestones": [
      { "title": "Send proposal", "daysAfterStart": 3 },
      { "title": "Schedule POC", "daysAfterStart": 7 },
      { "title": "Get legal sign-off", "daysAfterStart": 50 }
    ]
  }'
```

**Example: Apply Template to Deal**
```bash
curl -X POST http://localhost:3000/api/templates/1/apply \
  -H "Content-Type: application/json" \
  -d '{
    "dealName": "Acme Corp SaaS Contract",
    "dealAmount": 250000
  }'
```

### Automations API

```
GET    /api/automations                 List all automations
POST   /api/automations                 Create new automation
GET    /api/automations/:id             Get automation details
PATCH  /api/automations/:id             Update automation
DELETE /api/automations/:id             Delete automation
POST   /api/automations/trigger         Internal: Trigger automation evaluation
```

**Example: Create Automation**
```bash
curl -X POST http://localhost:3000/api/automations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto-create POC tasks",
    "trigger": "stage_changed",
    "triggerConfig": {
      "stage": "poc"
    },
    "action": "create_todo",
    "actionConfig": {
      "todos": [
        "Send POC scope document",
        "Schedule kickoff meeting",
        "Set up test environment"
      ]
    },
    "enabled": true
  }'
```

**Example: Trigger Automation**
```bash
# Called internally when events occur
curl -X POST http://localhost:3000/api/automations/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "stage_changed",
    "dealId": 42,
    "changes": {
      "stage": "poc",
      "amount": 150000
    }
  }'
```

### Forecasting API

```
GET    /api/forecasting/pipeline       Revenue forecast by stage with confidence
```

**Response Example**
```json
{
  "success": true,
  "forecast": {
    "totalDeals": 12,
    "totalValue": 3500000,
    "projectedRevenue": 1750000,
    "overallProbability": 50,
    "confidence": 75,
    "byStage": {
      "demo": {
        "dealCount": 5,
        "totalValue": 1000000,
        "expectedValue": 500000,
        "avgProbability": 50
      },
      "poc": {
        "dealCount": 4,
        "totalValue": 1500000,
        "expectedValue": 900000,
        "avgProbability": 60
      }
    }
  }
}
```

### Sharing & Collaboration API

```
GET    /api/sharing                     List all shared deals
POST   /api/sharing                     Share a deal with prospect/team
PATCH  /api/sharing/:id                 Update share permissions
DELETE /api/sharing/:id                 Revoke share

GET    /api/sharing/public/:token       Access shared deal (public)
POST   /api/sharing/public/:token       Add comment to shared deal
```

**Example: Share Deal**
```bash
curl -X POST http://localhost:3000/api/sharing \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 42,
    "sharedWithEmail": "john@acmecorp.com",
    "permission": "view",
    "expiresAt": "2026-06-30T23:59:59Z"
  }'
```

**Response**
```json
{
  "success": true,
  "sharedDeal": {
    "id": 1,
    "deal": { "id": 42, "name": "Acme Corp", "amount": 250000 },
    "sharedWithEmail": "john@acmecorp.com",
    "permission": "view",
    "accessToken": "abc123def456...",
    "expiresAt": "2026-06-30T23:59:59Z"
  }
}
```

---

## Frontend Components to Build

### Week 2: Templates UI

- `components/templates/TemplateCard.tsx` - Display template info
- `components/templates/TemplateForm.tsx` - Create/edit template with stages and milestones
- `components/templates/TemplatePreview.tsx` - Visual workflow preview
- `components/templates/ApplyTemplateModal.tsx` - Apply template to deal
- `app/templates/page.tsx` - Templates dashboard

### Week 3: Automation UI

- `components/automations/AutomationCard.tsx` - Display automation rule
- `components/automations/AutomationRuleBuilder.tsx` - Form to create/edit rules
- `components/automations/TriggerSelector.tsx` - Choose trigger type
- `components/automations/ActionConfigurator.tsx` - Configure action
- `components/automations/ExecutionHistory.tsx` - View execution logs
- `app/automations/page.tsx` - Automation center

### Week 4: Collaboration Portal

- `app/shared/[token]/page.tsx` - Public portal (prospect view)
- `components/shared/MilestoneProgress.tsx` - Visual progress indicator
- `components/shared/CommentThread.tsx` - Comments section
- `components/shared/PermissionSelector.tsx` - Share settings UI

### Week 4-5: Forecasting

- `app/forecasting/page.tsx` - Forecasting dashboard
- `components/forecasting/PipelineChart.tsx` - Revenue forecast chart
- `components/forecasting/CapacityHeatmap.tsx` - Resource utilization
- `components/forecasting/AllocationMatrix.tsx` - Deal × Resource grid
- `components/forecasting/TrendChart.tsx` - Historical trends

---

## Automation Engine

The automation engine evaluates triggers and executes actions on deals.

### Trigger Types

| Trigger | Description | Config |
|---------|-------------|--------|
| `deal_created` | When a new deal is created | None |
| `stage_changed` | When deal moves to specific stage | `stage: "poc"` |
| `date_reached` | After N days in current stage | `daysInStage: 7` |
| `email_received` | When email from contact arrives | Contact email |
| `todo_completed` | When deal to-do is marked done | To-do reference |

### Action Types

| Action | Description | Config |
|--------|-------------|--------|
| `create_todo` | Create one or more to-dos | `todos: ["Send proposal"]` |
| `send_email` | Send email to recipient(s) | `recipients: [], subject, body` |
| `update_field` | Update deal field | `field: "probability", value: 70` |
| `move_stage` | Auto-advance to next stage | `toStage: "validation"` |

### Automation Flow

```
1. System event fires (e.g., deal.stage = "poc")
   ↓
2. Query automations matching trigger
   ↓
3. For each automation:
   a. Evaluate trigger conditions
   b. Evaluate all rules (AND logic)
   c. If all pass: execute action
   d. Log execution (success/failure)
   ↓
4. Create activity log entry
```

### Integration Points

When these events occur, call `/api/automations/trigger`:

```typescript
// In app/api/deals/[id]/route.ts (PATCH endpoint)
// When deal stage changes:
await fetch('/api/automations/trigger', {
  method: 'POST',
  body: JSON.stringify({
    trigger: 'stage_changed',
    dealId: id,
    changes: { stage: newStage, previousStage: oldStage }
  })
});

// In components/deals/DealCard.tsx
// When deal is created:
await fetch('/api/automations/trigger', {
  method: 'POST',
  body: JSON.stringify({
    trigger: 'deal_created',
    dealId: newDealId,
    changes: { created: true }
  })
});

// In api routes for todos
// When todo is completed:
await fetch('/api/automations/trigger', {
  method: 'POST',
  body: JSON.stringify({
    trigger: 'todo_completed',
    dealId: todoData.dealId,
    changes: { completed: true }
  })
});
```

---

## Usage Examples

### Example 1: Auto-create POC Checklist

**Setup**: Create automation that triggers when deal moves to POC stage

```
Trigger: stage_changed (stage = "poc")
Action: create_todo
Config: todos = [
  "Send POC scope document",
  "Schedule kickoff call",
  "Set up test environment",
  "Create data sample"
]
```

**Result**: When sales engineer moves deal to POC, 4 to-dos are auto-created

### Example 2: Auto-move Stalled Deals

**Setup**: Create automation for deals stalled > 14 days

```
Trigger: date_reached (daysInStage = 14)
Rules: [
  { field: "stage", operator: "eq", value: "validation" }
]
Action: move_stage
Config: toStage = "at_risk"
```

**Result**: Deals in validation > 14 days auto-move to at_risk

### Example 3: Share Deal with Prospect

**Scenario**: Sales engineer completes POC, shares progress with prospect

```bash
curl -X POST /api/sharing \
  -d '{
    "dealId": 42,
    "sharedWithEmail": "buyer@client.com",
    "permission": "comment",  # Prospect can see + comment
    "expiresAt": "2026-06-30"
  }'
```

**Result**: Prospect gets email link, can view milestone progress and add comments

---

## Database Migration Steps

**When Supabase credentials are ready:**

1. **Verify connection**
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

2. **Run migration**
   ```bash
   npx prisma migrate dev --name add_user_and_phase4_enterprise_features
   ```

3. **Verify Prisma client**
   ```bash
   npx prisma generate
   ```

4. **Seed test data** (optional)
   ```bash
   npx prisma db seed
   ```

---

## Testing Checklist

### Templates
- [ ] Create template with multiple stages and milestones
- [ ] Apply template to new deal → verify stage set, to-dos created
- [ ] Apply template to existing deal → verify milestones added
- [ ] Edit template → verify changes apply to new deals only
- [ ] Delete template → verify cleanup

### Automations
- [ ] Create automation with stage_changed trigger
- [ ] Move deal to trigger stage → verify automation executes
- [ ] Create automation with conditions → verify conditions evaluated
- [ ] Create create_todo action → verify to-dos created
- [ ] View execution history → verify logs recorded

### Sharing
- [ ] Share deal with prospect email → verify access token generated
- [ ] Access via public link → verify deal data visible
- [ ] Comment on shared deal → verify comment created
- [ ] Revoke share → verify access denied

### Forecasting
- [ ] Navigate to /forecasting → verify pipeline chart loads
- [ ] Check revenue forecast → verify calculations correct
- [ ] Verify confidence score → ensure recent activity increases it
- [ ] Check by-stage breakdown → verify totals match

---

## Common Issues & Solutions

### Database Connection Failed
**Error**: `P1000: Authentication failed`
- Verify DATABASE_URL and DIRECT_URL in `.env`
- Check Supabase credentials are valid
- Try `npx prisma db execute --stdin < /dev/null` to test connection

### Prisma Generate Failed
**Error**: `EPERM: operation not permitted`
- Kill Node processes: `taskkill /F /IM node.exe`
- Clear `.prisma/client` folder: `rm -rf node_modules/.prisma`
- Run `npx prisma generate` again

### User Model Foreign Key Errors
**Error**: Missing relations
- Ensure User model has all relations defined
- Run `npx prisma format` to auto-fix schema
- Verify all userId references point to User.id

---

## Next Steps

1. **Verify Database** - Test Supabase connection and run migration
2. **Build Templates UI** - Create forms and dashboard for Week 2
3. **Integrate Automation Triggers** - Add `/api/automations/trigger` calls to Deal API
4. **Build Automation UI** - Create rule builder interface
5. **Add Forecasting Charts** - Install Chart.js and build visualization
6. **Test End-to-End** - Verify template → automation → forecast flow

---

## File Structure

```
app/
├── api/
│   ├── templates/
│   │   ├── route.ts               ✅ GET/POST templates
│   │   ├── [id]/route.ts          ✅ GET/PATCH/DELETE template
│   │   └── [id]/apply/route.ts    ✅ POST apply template
│   ├── automations/
│   │   ├── route.ts               ✅ GET/POST automations
│   │   ├── [id]/route.ts          ✅ GET/PATCH/DELETE automation
│   │   └── trigger/route.ts       ✅ POST trigger evaluation
│   ├── forecasting/
│   │   └── pipeline/route.ts      ✅ GET pipeline forecast
│   └── sharing/
│       ├── route.ts               ✅ GET/POST shares
│       ├── [id]/route.ts          ✅ PATCH/DELETE share
│       └── public/[token]/route.ts ✅ GET/POST public access
├── templates/
│   └── page.tsx                   ⏳ TODO: Templates dashboard
├── automations/
│   └── page.tsx                   ⏳ TODO: Automations center
├── forecasting/
│   └── page.tsx                   ⏳ TODO: Forecasting dashboard
└── shared/
    └── [token]/page.tsx           ⏳ TODO: Public portal
components/
├── templates/
│   ├── TemplateCard.tsx           ⏳ TODO
│   ├── TemplateForm.tsx           ⏳ TODO
│   └── TemplatePreview.tsx        ⏳ TODO
├── automations/
│   ├── AutomationCard.tsx         ⏳ TODO
│   ├── AutomationRuleBuilder.tsx  ⏳ TODO
│   └── ExecutionHistory.tsx       ⏳ TODO
├── forecasting/
│   ├── PipelineChart.tsx          ⏳ TODO
│   └── CapacityHeatmap.tsx        ⏳ TODO
└── shared/
    ├── MilestoneProgress.tsx      ⏳ TODO
    └── CommentThread.tsx          ⏳ TODO
lib/
├── automationEngine.ts            ✅ Automation utilities
└── db.ts                          ✅ Prisma client

prisma/
└── schema.prisma                  ✅ Updated with Phase 4 models
```

---

## Key Design Decisions

### User Model
- Created foundational User model to replace hardcoded USER_ID
- All data now scoped to user.id (multi-tenant ready)
- Auth integration can swap hardcoded USER_ID = 1 with req.user.id

### Automation Engine
- Trigger-based architecture (not webhook-based)
- Conditions evaluated with AND logic (all must pass)
- Actions executed synchronously (queued in production)
- Execution logs stored for audit trail

### Sharing Strategy
- Access tokens (not OAuth) for simplicity
- Optional expiration for security
- Permission levels: view, comment, edit
- Public endpoint for prospect portal

### Forecasting
- Probability-weighted revenue (expected value)
- Confidence based on recent activity
- By-stage breakdown for visibility
- Resource allocation tracked separately

---

## Production Considerations

- [ ] Implement proper User authentication (replace USER_ID = 1)
- [ ] Add email service integration (SendGrid for external)
- [ ] Encrypt sensitive data (OAuth tokens, access tokens)
- [ ] Add rate limiting to APIs
- [ ] Implement webhooks for real-time triggers
- [ ] Add audit logging for compliance
- [ ] Set up background job queue for action execution
- [ ] Add monitoring/alerting for automation failures
- [ ] Cache forecasts (recalculate hourly)
- [ ] Add soft deletes for data retention
