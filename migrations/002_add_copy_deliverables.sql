-- Migration: Add Copy Deliverables Table
-- Story 1.6: n8n Orchestration - Master Workflow Pipeline
-- Description: Create table to store generated copy deliverables from workflow pipeline

-- Create copy_deliverables table
CREATE TABLE copy_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,

  -- Generated copy (all 5 types)
  headline VARCHAR(255) NOT NULL,
  subheadline VARCHAR(255) NOT NULL,
  body_text TEXT NOT NULL,
  cta VARCHAR(100) NOT NULL,
  social_post TEXT NOT NULL,

  -- Packaged deliverables
  instagram_carousel JSONB,
  linkedin_posts JSONB,
  landing_page_draft JSONB,

  -- Workflow metadata
  workflow_run_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'ready',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_deliverables_client_id ON copy_deliverables(client_id);
CREATE INDEX idx_deliverables_briefing_id ON copy_deliverables(briefing_id);
CREATE INDEX idx_deliverables_status ON copy_deliverables(status);
CREATE INDEX idx_deliverables_workflow_run_id ON copy_deliverables(workflow_run_id);

-- Enable RLS
ALTER TABLE copy_deliverables ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role (operator) has full access
CREATE POLICY deliverables_admin_all ON copy_deliverables
  FOR ALL
  USING (current_setting('role') = 'service_role');

-- RLS Policy: Client isolation by client_id
CREATE POLICY deliverables_isolation ON copy_deliverables
  FOR SELECT
  USING (
    current_setting('role') = 'service_role' OR
    EXISTS (SELECT 1 FROM clients WHERE id = client_id)
  );
