// Supabase Client Setup
// Centralized database access for all services

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Use mock for local development
const useLocalMock = process.env.NODE_ENV === 'development' && process.env.SUPABASE_URL?.startsWith('http://localhost');

// Initialize based on environment
let supabaseAdmin: any;
let supabaseConfig: any = null;

if (useLocalMock) {
  // Use mock client for development (sync import)
  const mockClient = require('./supabase-mock.js');
  supabaseAdmin = mockClient.supabaseAdmin;
} else {
  // Environment validation
  const supabaseEnv = z.object({
    url: z.string().url('SUPABASE_URL must be valid URL'),
    anonKey: z.string().min(1, 'SUPABASE_ANON_KEY required'),
    serviceRoleKey: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY required'),
  });

  supabaseConfig = supabaseEnv.parse({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  // Service role client (backend operations)
  supabaseAdmin = createClient(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export { supabaseAdmin };

// Anon client (frontend operations) - only if not mock
let supabase: SupabaseClient | null = null;
if (!useLocalMock && supabaseConfig) {
  supabase = createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey
  );
}
export { supabase };

// =====================================================
// Type Definitions
// =====================================================

export interface Client {
  id: string;
  name: string;
  industry?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface Briefing {
  id: string;
  client_id: string;
  business_name?: string;
  title?: string;
  segment?: string;
  target_audience?: string;
  main_problem?: string;
  desired_transformation?: string;
  voice_tone?: string;
  tone_voice?: string; // backward compat
  unique_advantage?: string;
  differentiators?: string;
  objectives?: string[];
  existing_colors?: string[];
  competitor_references?: string[];
  logo_url?: string;
  call_to_action?: string;
  visual_references?: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  monthly_budget?: number;
}

export interface BrandProfile {
  id: string;
  client_id: string;
  briefing_id?: string;
  colors?: any;
  color_palette?: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  fonts?: any;
  font_recommendations?: {
    heading: string;
    body: string;
  };
  voice_guidelines?: any;
  visual_style?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Zod Validation Schemas
// =====================================================

export const ClientInputSchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  industry: z.string().max(100).optional(),
  contact_name: z.string().max(255).optional(),
  contact_email: z.string().email().max(255).optional(),
  contact_phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
});

export type ClientInput = z.infer<typeof ClientInputSchema>;

export const BriefingInputSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  title: z.string().min(1).max(255),
  segment: z.string().max(50).optional(),
  target_audience: z.string().optional(),
  main_problem: z.string().optional(),
  desired_transformation: z.string().optional(),
  tone_voice: z.string().max(100).optional(),
  unique_advantage: z.string().optional(),
  call_to_action: z.string().optional(),
  visual_references: z.string().optional(),
});

export type BriefingInput = z.infer<typeof BriefingInputSchema>;

export const BrandProfileInputSchema = z.object({
  client_id: z.string().uuid(),
  briefing_id: z.string().uuid().optional(),
  colors: z.any().optional(),
  fonts: z.any().optional(),
  voice_guidelines: z.string().optional(),
  visual_style: z.string().optional(),
});

export type BrandProfileInput = z.infer<typeof BrandProfileInputSchema>;

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

export function handleSupabaseError(error: unknown): never {
  if (error instanceof Error) {
    throw new SupabaseError(error.message, 'UNKNOWN_ERROR', error);
  }
  throw new SupabaseError('Unknown database error', 'UNKNOWN_ERROR', error);
}

export default supabaseAdmin;
