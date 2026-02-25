// Supabase Client Setup
// Centralized database access for all services

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Environment validation
const supabaseEnv = z.object({
  url: z.string().url('SUPABASE_URL must be valid URL'),
  anonKey: z.string().min(1, 'SUPABASE_ANON_KEY required'),
  serviceRoleKey: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY required'),
});

export const supabaseConfig = supabaseEnv.parse({
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

// Service role client (backend operations)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Anon client (frontend operations)
export const supabase: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

// =====================================================
// Type Definitions (Generated from schema)
// =====================================================

export interface Client {
  id: string;
  name: string;
  segment: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  owner_name: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Briefing {
  id: string;
  client_id: string;
  status: 'draft' | 'approved' | 'processing' | 'completed';
  business_name: string | null;
  segment: string | null;
  target_audience: string | null;
  voice_tone: string | null;
  objectives: string[];
  differentiators: string | null;
  existing_colors: string[];
  logo_url: string | null;
  competitor_references: string[];
  monthly_budget: number | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  client_id: string;
  briefing_id: string;
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  voice_guidelines: {
    tone: string;
    keywords_to_use: string[];
    keywords_to_avoid: string[];
    example_phrases: string[];
  };
  visual_style: string | null;
  font_recommendations: {
    heading: string;
    body: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Zod Validation Schemas
// =====================================================

export const ClientInputSchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  segment: z.string().max(50).optional(),
  contact_email: z.string().email().max(255).optional(),
  contact_phone: z.string().max(20).optional(),
  owner_name: z.string().max(255).optional(),
  settings: z.record(z.unknown()).optional(),
});

export type ClientInput = z.infer<typeof ClientInputSchema>;

export const BriefingInputSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  business_name: z.string().min(1).max(255),
  segment: z.string().max(50),
  target_audience: z.string().min(1),
  voice_tone: z.string().max(100),
  objectives: z.array(z.string()).min(1, 'At least 1 objective required'),
  differentiators: z.string().min(1),
  existing_colors: z.array(z.string()).optional(),
  logo_url: z.string().url().optional(),
  monthly_budget: z.number().positive().optional(),
});

export type BriefingInput = z.infer<typeof BriefingInputSchema>;

// =====================================================
// Error Handling
// =====================================================

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// =====================================================
// Query Builders (Type-safe convenience)
// =====================================================

export const queries = {
  // Clients
  clients: () => supabaseAdmin.from('clients').select('*'),
  client: (id: string) => supabaseAdmin.from('clients').select('*').eq('id', id).single(),

  // Briefings
  briefings: (clientId: string) =>
    supabaseAdmin.from('briefings').select('*').eq('client_id', clientId),
  briefing: (id: string) => supabaseAdmin.from('briefings').select('*').eq('id', id).single(),

  // Brand Profiles
  brandProfiles: (clientId: string) =>
    supabaseAdmin.from('brand_profiles').select('*').eq('client_id', clientId),
  brandProfile: (id: string) =>
    supabaseAdmin.from('brand_profiles').select('*').eq('id', id).single(),
};

// =====================================================
// Utilities
// =====================================================

export function handleSupabaseError(error: unknown): never {
  if (error instanceof Error) {
    throw new SupabaseError(error.message, 'UNKNOWN_ERROR', error);
  }
  throw new SupabaseError('Unknown database error', 'UNKNOWN_ERROR', error);
}

export default supabaseAdmin;
