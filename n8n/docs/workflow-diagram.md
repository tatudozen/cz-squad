# CopyZen Master Pipeline Workflow

## Overview

The Master Pipeline is an n8n workflow that automates the complete CopyZen process from briefing approval to deliverable generation. It orchestrates API calls to generate copy, packages them into multiple formats, and stores the results in Supabase.

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     COPYZEN MASTER PIPELINE                      │
└─────────────────────────────────────────────────────────────────┘

1. TRIGGER PHASE
┌─────────────────────────────┐
│  Webhook Trigger            │
│  Event: briefing.approved   │
│  Payload:                   │
│  - client_id                │
│  - briefing_id              │
│  - brand_profile_id         │
└──────────────┬──────────────┘
               │
               ├────────────────┬─────────────────┐
               │                │                 │
               ▼                ▼                 ▼

2. DATA FETCH PHASE
┌──────────────────────┐  ┌──────────────────────┐
│  Fetch Briefing      │  │  Fetch Brand Profile │
│  GET /briefings/:id  │  │  GET /brand-profiles │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
           └────────────┬────────────┘
                        │
                        ▼

3. COPY GENERATION PHASE (Parallel)
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Generate         │  │ Generate         │  │ Generate         │
│ Headline         │  │ Subheadline      │  │ Body Text        │
│ /copy/generate   │  │ /copy/generate   │  │ /copy/generate   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └──────────┬──────────┴──────────┬──────────┘
                    │                    │
         ┌──────────────────┐  ┌──────────────────┐
         │ Generate CTA     │  │ Generate Social  │
         │ /copy/generate   │  │ /copy/generate   │
         └──────────┬───────┘  └────────┬─────────┘
                    │                   │
                    └──────────┬────────┘
                               │
                               ▼

4. PACKAGING & STORAGE PHASE
┌──────────────────────────────┐
│  Wait (synchronization)      │
│  Ensure all copies ready     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Store Deliverables          │
│  INSERT copy_deliverables    │
│  - headline                  │
│  - subheadline               │
│  - body_text                 │
│  - cta                       │
│  - social_post               │
│  - instagram_carousel        │
│  - linkedin_posts            │
│  - landing_page_draft        │
└──────────────┬───────────────┘
               │
               ▼

5. NOTIFICATION PHASE
┌──────────────────────────────┐
│  Notify Operator             │
│  Send Email Summary          │
│  Include deliverable preview │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Success Response            │
│  Return completion status    │
└──────────────────────────────┘
```

## Node Details

### 1. Webhook Trigger
- **Type:** Webhook
- **Trigger Event:** `POST /workflows/copyzen/briefing-approved`
- **Payload:**
  ```json
  {
    "event": "briefing.approved",
    "client_id": "uuid",
    "briefing_id": "uuid",
    "brand_profile_id": "uuid"
  }
  ```

### 2. Fetch Briefing
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `${API_BASE_URL}/briefings/${briefing_id}`
- **Response:** Complete briefing data with business name, target audience, etc.

### 3. Fetch Brand Profile
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `${API_BASE_URL}/brand-profiles?client_id=${client_id}`
- **Response:** Brand profile with voice guidelines, colors, etc.

### 4-8. Generate Copy (Parallel)
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `${API_BASE_URL}/copy/generate`
- **Body:**
  ```json
  {
    "client_id": "uuid",
    "brand_profile_id": "uuid",
    "copy_type": "headline|subheadline|body_text|cta|social_post"
  }
  ```
- **Response:** Generated copy with validation and metrics

### 9. Wait Node
- **Type:** Wait
- **Purpose:** Synchronization point to ensure all copy generation completes
- **Duration:** 1 second

### 10. Store Deliverables
- **Type:** Postgres/Supabase
- **Operation:** INSERT
- **Table:** `copy_deliverables`
- **Fields:**
  - client_id
  - briefing_id
  - headline
  - subheadline
  - body_text
  - cta
  - social_post
  - instagram_carousel (JSON)
  - linkedin_posts (JSON)
  - landing_page_draft (JSON)
  - workflow_run_id (unique)
  - status (default: 'ready')

### 11. Notify Operator
- **Type:** Email Send
- **To:** `${OPERATOR_EMAIL}`
- **Subject:** `✅ Entregas Prontas: {business_name}`
- **Content:** Summary of generated copy with preview

### 12. Success Response
- **Type:** Function
- **Output:** Success confirmation with timestamp

## Environment Variables

```bash
# API Configuration
API_BASE_URL=https://api.copyzen.com.br
API_BEARER_TOKEN=your-api-token

# Supabase
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co

# Email Notifications
SMTP_FROM_EMAIL=notifications@copyzen.com.br
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Operator
OPERATOR_EMAIL=fernando@copyzen.com.br
```

## Execution Flow

### Success Path
```
Webhook → Fetch Data → Generate Copy (5 tasks) → Wait → Store → Notify → Success
├─ Execution time: ~10-15 seconds
├─ API calls: 7 (1 briefing + 1 profile + 5 copy generation)
├─ Database writes: 1 (copy_deliverables insert)
└─ Email sent: 1 (operator notification)
```

### Error Handling
- **Fetch Errors:** Retry 3 times with exponential backoff (100ms, 500ms, 2s)
- **Generation Errors:** Log and skip that copy type, continue with others
- **Storage Errors:** Notify operator via email with error details
- **Email Errors:** Log but don't fail the workflow

## Error Response Format

```json
{
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Failed to generate headline copy",
    "step": "Generate Headline",
    "reason": "API timeout",
    "timestamp": "2026-02-25T10:30:00Z",
    "retry_count": 3
  }
}
```

## Testing & Debugging

### Manual Webhook Trigger
```bash
curl -X POST http://localhost:5678/webhook/copyzen/briefing-approved \
  -H "Content-Type: application/json" \
  -d '{
    "event": "briefing.approved",
    "client_id": "550e8400-e29b-41d4-a716-446655440000",
    "briefing_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "brand_profile_id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
  }'
```

### Check Execution Logs
1. Open n8n dashboard
2. Navigate to "Executions"
3. Filter by "Master Pipeline"
4. Click on any execution to view logs

### Verify Stored Deliverables
```sql
SELECT * FROM copy_deliverables
WHERE workflow_run_id = 'n8n-execution-id'
ORDER BY created_at DESC;
```

## Monitoring & Alerts

### Success Metrics
- Execution time: Target < 15s
- Success rate: Target > 99%
- Copy quality score: Target > 0.85

### Alert Conditions
- Execution time > 30s → Email operator
- Success rate < 95% → Email operator
- Failed generation > 10% → Email operator
- Email send failure → Log to database

## Customization

### Change Copy Types
Edit the copy generation nodes to request different copy types:
- Available: headline, subheadline, body_text, cta, social_post
- Add new nodes for additional types

### Add Processing Steps
Insert nodes between "Store Deliverables" and "Notify Operator" for:
- Image generation
- Social media posting
- CRM integration
- Slack notifications

### Modify Notification
Update "Notify Operator" node to:
- Send to Slack instead of email
- Include formatted table of deliverables
- Attach files or links

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Webhook not triggering | Endpoint URL wrong | Verify URL in n8n settings |
| API calls timing out | API server slow | Increase timeout to 60s |
| Copy generation fails | API authentication | Check bearer token in .env |
| Email not sending | SMTP config wrong | Verify email credentials |
| Data not storing | Supabase connection | Check service role key |

## Performance Optimization

### Current Architecture
- Sequential fetch → Parallel generation → Sequential storage
- Estimated time: 10-15 seconds

### Potential Improvements
1. **Webhook Authentication:** Add signature verification
2. **Async Storage:** Use Supabase batch insert for faster writes
3. **Copy Caching:** Cache generated copy for identical briefings
4. **Image Generation:** Add parallel image generation for Instagram

## Webhook Integration

To trigger this workflow from your application:

```typescript
// Example: Trigger workflow after briefing approval
await fetch('http://n8n-instance:5678/webhook/copyzen/briefing-approved', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'briefing.approved',
    client_id: briefing.client_id,
    briefing_id: briefing.id,
    brand_profile_id: brandProfile.id,
  }),
});
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-25 | Initial release with 5 copy types |
| TBD | TBD | Add image generation |
| TBD | TBD | Add social media posting |

---

**Last Updated:** 2026-02-25
**Maintained By:** CopyZen Team
**Support:** contact@copyzen.com.br
