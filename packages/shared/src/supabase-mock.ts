// Mock Supabase client for local testing
// This provides a simple in-memory database for development

import { SupabaseClient } from '@supabase/supabase-js';

// In-memory database for testing
const database: Record<string, any[]> = {
  clients: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test Client',
      industry: 'Technology',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  briefings: [],
  brand_profiles: [],
  projects: [],
  deliverables: [],
};

let idCounter = 2;

const generateUUID = () => {
  const id = idCounter++;
  return `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;
};

class MockSupabaseClient {
  private tables: Record<string, any> = {};

  from(tableName: string) {
    return {
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const record = Array.isArray(data) ? { ...data[0], id: generateUUID() } : { ...data, id: generateUUID() };
            if (!database[tableName]) database[tableName] = [];
            database[tableName].push(record);
            return { data: record, error: null };
          },
        }),
        eq: () => ({ single: async () => ({ data: null, error: null }) }),
      }),
      select: () => ({
        single: async () => {
          if (database[tableName] && database[tableName].length > 0) {
            return { data: database[tableName][0], error: null };
          }
          return { data: null, error: { code: 'PGRST116' } };
        },
        eq: (field: string, value: any) => ({
          single: async () => {
            const record = database[tableName]?.find((r) => r[field] === value);
            if (record) return { data: record, error: null };
            return { data: null, error: { code: 'PGRST116' } };
          },
          order: () => ({
            async then(callback: any) {
              const records = database[tableName] || [];
              callback({ data: records, error: null });
            },
          }),
        }),
        order: () => ({
          async then(callback: any) {
            const records = (database[tableName] || []).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            callback({ data: records, error: null });
          },
        }),
      }),
      update: (data: any) => ({
        eq: (field: string, value: any) => ({
          select: () => ({
            single: async () => {
              const index = database[tableName]?.findIndex((r) => r[field] === value);
              if (index !== undefined && index >= 0) {
                database[tableName][index] = { ...database[tableName][index], ...data };
                return { data: database[tableName][index], error: null };
              }
              return { data: null, error: { message: 'Not found' } };
            },
          }),
        }),
      }),
      delete: () => ({
        eq: async (field: string, value: any) => {
          const index = database[tableName]?.findIndex((r) => r[field] === value);
          if (index !== undefined && index >= 0) {
            database[tableName].splice(index, 1);
            return { error: null };
          }
          return { error: { message: 'Not found' } };
        },
      }),
    };
  }
}

export const supabaseAdmin = new MockSupabaseClient() as any as SupabaseClient;

// Export types for compatibility
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
}

export interface Briefing {
  id: string;
  client_id: string;
  title: string;
  segment?: string;
  target_audience?: string;
  main_problem?: string;
  desired_transformation?: string;
  tone_voice?: string;
  unique_advantage?: string;
  call_to_action?: string;
  visual_references?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  client_id: string;
  briefing_id?: string;
  colors?: any;
  fonts?: any;
  voice_guidelines?: string;
  visual_style?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

import { z } from 'zod';

export const ClientInputSchema = z.object({
  name: z.string(),
  industry: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

export const BriefingInputSchema = z.object({
  client_id: z.string(),
  title: z.string(),
  segment: z.string().optional(),
  target_audience: z.string().optional(),
  main_problem: z.string().optional(),
  desired_transformation: z.string().optional(),
  tone_voice: z.string().optional(),
  unique_advantage: z.string().optional(),
  call_to_action: z.string().optional(),
  visual_references: z.string().optional(),
});

export const BrandProfileInputSchema = z.object({
  client_id: z.string(),
  briefing_id: z.string().optional(),
  colors: z.any().optional(),
  fonts: z.any().optional(),
  voice_guidelines: z.string().optional(),
  visual_style: z.string().optional(),
});
