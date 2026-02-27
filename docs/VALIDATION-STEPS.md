# CopyZen MVP Validation - Step-by-Step Guide

**Story 4.5: CopyZen Self-Dogfooding & MVP Validation**

This guide walks through executing the complete CopyZen pipeline with real data and measuring MVP success.

## Prerequisites

✅ All Stories 1.1-4.4 completed
✅ API server running (`npm run dev`)
✅ Supabase connected and migrations applied
✅ Evolution API credentials configured (optional for notifications)

## Step 1: Create CopyZen Client & Briefing

### Option A: Using the Validation Script (Automated)

```bash
cd /Users/nando/Desktop/Playground/cz-squad
npx ts-node scripts/validate-mvp-copyzen.ts
```

This script orchestrates the entire pipeline automatically:
1. Creates CopyZen client
2. Creates briefing with self-dogfooding context
3. Generates brand profile
4. Executes `/projects/generate`
5. Waits for completion
6. Approves all deliverables
7. Generates report

**Expected time: 5-10 minutes** (depending on LLM response times)

### Option B: Manual Step-by-Step

#### 1.1 Create Client

```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CopyZen",
    "industry": "Marketing Automation",
    "contact_name": "Fernando Nunes",
    "contact_email": "fernando@copyzen.com.br",
    "contact_phone": "+55 11 99999-9999",
    "website": "https://copyzen.com.br",
    "description": "AI-powered marketing pipeline for solopreneurs"
  }'
```

**Response:** Returns `client_id` (save this value)

#### 1.2 Create Briefing

```bash
curl -X POST http://localhost:3000/briefings \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "title": "CopyZen - Marketing Automation Platform",
    "segment": "Small business owners & solopreneurs",
    "target_audience": "Health professionals, consultants, service providers (Brazil)",
    "main_problem": "Lack of consistent digital presence and lead generation",
    "desired_transformation": "Automated professional content + funnel + sales page",
    "tone_voice": "Conversational, practical, empowering",
    "unique_advantage": "All-in-one marketing automation for busy professionals",
    "call_to_action": "Book a demo to see your personalized pipeline",
    "visual_references": "Modern, tech-forward, professional",
    "status": "draft"
  }'
```

**Response:** Returns `briefing_id` (save this value)

#### 1.3 Approve Briefing

```bash
curl -X PATCH http://localhost:3000/briefings/YOUR_BRIEFING_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

## Step 2: Generate Brand Profile

**Automatic in validation script**, or:

```bash
curl -X POST http://localhost:3000/brand-profiles \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "briefing_id": "YOUR_BRIEFING_ID",
    "colors": {
      "primary": "#06164A",
      "secondary": "#6220FF",
      "accent": "#ED145B",
      "neutral_dark": "#333333",
      "neutral_light": "#F5F5F5"
    },
    "fonts": {
      "heading": "Muli",
      "body": "Lato"
    },
    "voice_guidelines": "Conversational, practical, empowering",
    "visual_style": "Modern, tech-forward, professional",
    "status": "approved"
  }'
```

**Response:** Returns `brand_profile_id`

## Step 3: Execute Full Pipeline

```bash
curl -X POST http://localhost:3000/projects/generate \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "briefing_id": "YOUR_BRIEFING_ID",
    "brand_profile_id": "YOUR_BRAND_PROFILE_ID",
    "operator_phone": "+55 11 99999-9999",
    "pipelines": {
      "content": true,
      "funwheel": true,
      "sales_page": true
    }
  }'
```

**Response:** Returns `project_id` (save this value)

**HTTP Status:** 202 Accepted (pipeline runs async)

## Step 4: Monitor Pipeline Progress

```bash
# Poll status (check every 10 seconds)
curl http://localhost:3000/projects/YOUR_PROJECT_ID/status
```

**Expected progression:**
```
content: pending → generating → ready_for_review
funwheel: pending → generating → ready_for_review
sales_page: pending → generating → ready_for_review
```

**Done when all are `ready_for_review`** (expected: 5-10 minutes)

## Step 5: Review Deliverables

```bash
curl http://localhost:3000/deliverables/project/YOUR_PROJECT_ID/list
```

**Response includes:**
- 10 content pieces (posts)
- 3 funwheel pages (A-R-T)
- 1 sales page
- Status: `ready_for_review`

## Step 6: Approve Deliverables

### Approve Individual Piece

```bash
curl -X POST http://localhost:3000/deliverables/DELIVERABLE_ID/approve
```

### Approve All (in a loop)

```bash
# Get all deliverables
DELIVERABLES=$(curl -s http://localhost:3000/deliverables/project/YOUR_PROJECT_ID/list | jq -r '.data.deliverables[].id')

# Approve each
for id in $DELIVERABLES; do
  curl -X POST http://localhost:3000/deliverables/$id/approve
  echo "Approved: $id"
done
```

### Or: Request Regeneration

```bash
curl -X POST http://localhost:3000/deliverables/DELIVERABLE_ID/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "Adjust headline to emphasize ROI"
  }'
```

**Max 2 regenerations per deliverable**

## Step 7: View Delivery Report

```bash
curl http://localhost:3000/deliverables/project/YOUR_PROJECT_ID/report
```

**Response includes:**
- Approval summary (approved, rejected, pending)
- Metrics (tokens, cost, time)
- Deliverable list with feedback

## Step 8: Validate Quality

### Manual Quality Checks

1. **Posts**: Review copy for grammar, brand consistency, engagement potential
2. **FunWheel**: Test page load, check responsiveness on mobile
3. **Sales Page**: Verify copy clarity, CTA effectiveness

### Lighthouse Scores (For Deployed Pages)

Once pages are deployed to production:

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli@0.10.x

# Run audit
lhci autorun --config=lighthouserc.json
```

**Target: > 90 on Performance, Accessibility, Best Practices**

## Step 9: Test Lead Capture (Optional)

### Submit Test Lead via FunWheel

```bash
# Get Etapa R (lead capture) form URL
# Usually: https://funwheel.copyzen.com.br/copyzen/capture

# Submit test form with test data:
# Name: Test User
# Email: test@example.com
# Phone: +5511999999999
```

### Verify Lead in Supabase

```bash
# Query leads table
SELECT * FROM leads
WHERE funnel_id = 'YOUR_FUNWHEEL_ID'
ORDER BY created_at DESC;
```

**Expected fields:**
- name: "Test User"
- email: "test@example.com"
- phone: "+5511999999999"
- status: "captured"
- consent_lgpd: true

## Step 10: Generate Final Report

### Automatic (via validation script)

Report is saved to: `docs/mvp-validation-report.md`

### Manual

Create `docs/mvp-validation-report.md`:

```markdown
# CopyZen MVP Validation Report

**Date:** [TODAY]
**Project ID:** [YOUR_PROJECT_ID]
**Status:** ✅ Complete

## Summary
- Total Pieces Generated: 14 (10 posts + 3 funwheel + 1 sales page)
- All Approved: ✅ Yes
- Pipeline Time: ~8 minutes
- Quality Assessment: ✅ Passed

## Deliverables
- Content Posts: 10 (✅ approved)
- FunWheel A-R-T: 3 (✅ approved)
- Sales Page: 1 (✅ approved)

## Metrics
- Total Tokens: ~26,000
- Estimated Cost: $1.95
- Execution Time: 480 seconds

## Key Findings
1. ✅ Pipeline is stable and production-ready
2. ✅ All systems (content, funwheel, sales) working correctly
3. ✅ Operator approval workflow is intuitive
4. ⏳ Lead capture needs production deployment testing
5. 📝 Quality is consistent with brand guidelines

## Next Steps
1. Deploy live pages to VPS
2. Test lead capture with real form submissions
3. Measure actual Lighthouse scores
4. Onboard first external customer
```

## Troubleshooting

### Pipeline Stuck on "generating"

```bash
# Check for errors in project
curl http://localhost:3000/projects/YOUR_PROJECT_ID/status | jq '.data'
```

If error_log has entries, review and potentially regenerate individual pieces.

### Deliverable Not Found

```bash
# List all deliverables
curl http://localhost:3000/deliverables/project/YOUR_PROJECT_ID/list
```

### LLM API Errors

Check:
- `ANTHROPIC_API_KEY` is set and valid
- API rate limits not exceeded
- Fallback LLM configured (Deepseek/OpenAI)

## Success Criteria

✅ **MVP Validation is SUCCESSFUL when:**

1. All 14 deliverables generated without errors
2. All deliverables approved by operator
3. Project status transitions to `completed`
4. Report shows < 30 minute total execution time
5. Quality assessment passes (brand consistency verified)
6. Lighthouse scores > 90 (on deployed pages)
7. At least 1 test lead captured and qualified

---

**Estimated Total Time:** 15-20 minutes (fully automated via script)

**Command to Run Everything:**
```bash
npx ts-node scripts/validate-mvp-copyzen.ts
```

For questions or issues, check `docs/mvp-validation-report.md` after execution.
