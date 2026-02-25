-- Migration: Add content_plans table
-- Story 2.1: Content Strategy & Planning Module
-- Date: 2026-02-25

-- Create content_plans table
CREATE TABLE IF NOT EXISTS content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
  brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_json JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_content_plans_briefing_id ON content_plans(briefing_id);
CREATE INDEX idx_content_plans_client_id ON content_plans(client_id);
CREATE INDEX idx_content_plans_status ON content_plans(status);

-- Enable Row Level Security
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can only see their own content plans
CREATE POLICY content_plans_client_isolation
  ON content_plans
  USING (client_id::text = auth.uid()::text)
  WITH CHECK (client_id::text = auth.uid()::text);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_content_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_plans_updated_at_trigger
  BEFORE UPDATE ON content_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_content_plans_updated_at();
