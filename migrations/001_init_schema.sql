-- CopyZen Foundation Schema
-- Epic 1, Story 1.2: Supabase Schema & Client Data Layer
-- Created: 2026-02-24

-- =====================================================
-- 1. CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  segment VARCHAR(50),
  contact_email VARCHAR(255) UNIQUE,
  contact_phone VARCHAR(20),
  owner_name VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(contact_email);
CREATE INDEX IF NOT EXISTS idx_clients_segment ON clients(segment);

-- =====================================================
-- 2. BRIEFINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'processing', 'completed')),

  business_name VARCHAR(255),
  segment VARCHAR(50),
  target_audience TEXT,
  voice_tone VARCHAR(100),
  objectives TEXT[] DEFAULT '{}',
  differentiators TEXT,
  existing_colors TEXT[] DEFAULT '{}',
  logo_url VARCHAR(500),
  competitor_references TEXT[] DEFAULT '{}',
  monthly_budget NUMERIC(10, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_briefings_client_id ON briefings(client_id);
CREATE INDEX IF NOT EXISTS idx_briefings_status ON briefings(status);
CREATE INDEX IF NOT EXISTS idx_briefings_created_at ON briefings(created_at DESC);

-- =====================================================
-- 3. BRAND_PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE NOT NULL,

  color_palette JSONB NOT NULL,
  voice_guidelines JSONB NOT NULL,
  visual_style VARCHAR(100),
  font_recommendations JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_client_id ON brand_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_briefing_id ON brand_profiles(briefing_id);

-- =====================================================
-- 4. ROW-LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

-- CLIENTS: Service role (backend) has all access
CREATE POLICY clients_service_role ON clients
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- BRIEFINGS: Service role + client isolation (future auth)
CREATE POLICY briefings_service_role ON briefings
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY briefings_client_select ON briefings
  FOR SELECT
  USING (
    current_setting('role') = 'service_role' OR
    client_id IN (SELECT id FROM clients)
  );

-- BRAND_PROFILES: Service role + client isolation (future auth)
CREATE POLICY brand_profiles_service_role ON brand_profiles
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY brand_profiles_client_select ON brand_profiles
  FOR SELECT
  USING (
    current_setting('role') = 'service_role' OR
    client_id IN (SELECT id FROM clients)
  );

-- =====================================================
-- 5. AUDIT LOGGING (Future)
-- =====================================================
-- Placeholder for audit logs table (Story 1.7)
-- Will track all changes to clients, briefings, brand_profiles

-- =====================================================
-- Constraints & Checks
-- =====================================================
ALTER TABLE briefings ADD CONSTRAINT briefings_monthly_budget_positive
  CHECK (monthly_budget IS NULL OR monthly_budget > 0);

-- =====================================================
-- Metadata Comments
-- =====================================================
COMMENT ON TABLE clients IS 'CopyZen customers (OPB operators and their clients)';
COMMENT ON TABLE briefings IS 'Client briefing information - input for content/funwheel/sales page generation';
COMMENT ON TABLE brand_profiles IS 'AI-generated brand guidelines derived from briefing - used across all deliverables';

COMMENT ON COLUMN briefings.status IS 'Draft → Approved → Processing → Completed lifecycle';
COMMENT ON COLUMN brand_profiles.color_palette IS 'JSON: {primary, secondary, accent, neutral} hex colors';
COMMENT ON COLUMN brand_profiles.voice_guidelines IS 'JSON: {tone, keywords, examples} for copywriting guardrails';
