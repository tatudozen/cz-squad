-- Migration 003: Create projects table for pipeline orchestration
-- Story 4.3: End-to-End Pipeline Orchestration

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
  brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'generating', 'ready_for_review', 'approved', 'delivered', 'failed')),

  -- Sub-pipeline references
  content_package_id UUID,
  funwheel_id UUID,
  sales_page_id UUID,

  -- Sub-pipeline statuses
  content_status VARCHAR(50) DEFAULT 'pending'
    CHECK (content_status IN ('pending', 'generating', 'ready_for_review', 'approved', 'failed', 'skipped')),
  funwheel_status VARCHAR(50) DEFAULT 'pending'
    CHECK (funwheel_status IN ('pending', 'generating', 'ready_for_review', 'approved', 'failed', 'skipped')),
  sales_page_status VARCHAR(50) DEFAULT 'pending'
    CHECK (sales_page_status IN ('pending', 'generating', 'ready_for_review', 'approved', 'failed', 'skipped')),

  -- Metrics
  tokens_used JSONB DEFAULT '{}',
  estimated_cost DECIMAL(10,2),
  total_time_ms INTEGER,

  -- Operator notification
  operator_phone VARCHAR(20),

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Error tracking
  error_log JSONB DEFAULT '[]'
);

-- RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON projects
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "projects_insert_service" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "projects_update_service" ON projects
  FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_briefing_id ON projects(briefing_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
