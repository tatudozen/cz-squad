-- Migration 004: Create deliverables table for approval workflow
-- Story 4.4: Operator Review & Approval Flow

-- Deliverables table: tracks individual pieces (content, funwheel, sales_page) for approval
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('content', 'funwheel', 'sales_page')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',

  -- Content storage: preview for quick review, full_content for complete output
  preview JSONB NOT NULL DEFAULT '{}',  -- { title, description, key_points, etc. }
  full_content JSONB DEFAULT '{}',      -- Complete generation output

  -- Approval workflow
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  feedback TEXT,
  regenerations INTEGER DEFAULT 0 CHECK (regenerations >= 0 AND regenerations <= 2),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_deliverables_type ON deliverables(type);
CREATE INDEX idx_deliverables_project_status ON deliverables(project_id, status);
CREATE INDEX idx_deliverables_created_at ON deliverables(created_at DESC);

-- Row Level Security (RLS) policies for multi-tenant isolation
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access deliverables for projects in their client_id
CREATE POLICY deliverables_client_isolation ON deliverables
  USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id = auth.uid()
    )
  );

-- Policy: Insert allowed only for projects user has access to
CREATE POLICY deliverables_insert_allowed ON deliverables
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE client_id = auth.uid()
    )
  );

-- Policy: Update allowed only for projects user has access to
CREATE POLICY deliverables_update_allowed ON deliverables
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id = auth.uid()
    )
  );

-- Policy: Delete allowed only for projects user has access to
CREATE POLICY deliverables_delete_allowed ON deliverables
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id = auth.uid()
    )
  );

-- Update trigger for 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_deliverables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deliverables_updated_at_trigger
  BEFORE UPDATE ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_deliverables_updated_at();
