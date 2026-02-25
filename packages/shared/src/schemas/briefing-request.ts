// Zod validation schemas for Briefing API requests
import { z } from 'zod';

/**
 * Create briefing request validation schema
 * Validates: client_id, business_name, segment, target_audience, voice_tone, objectives, differentiators
 */
export const CreateBriefingRequestSchema = z.object({
  client_id: z.string().uuid('Invalid client ID format'),
  business_name: z.string().min(1, 'Business name required').max(255),
  segment: z.string().min(1).max(50),
  target_audience: z.string().min(1, 'Target audience required'),
  voice_tone: z.string().min(1).max(100),
  objectives: z.array(z.string()).min(1, 'At least 1 objective required'),
  differentiators: z.string().min(1, 'Differentiators required'),
  existing_colors: z.array(z.string()).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  monthly_budget: z.number().positive().optional(),
});

export type CreateBriefingRequest = z.infer<typeof CreateBriefingRequestSchema>;

/**
 * Update briefing request validation schema
 * All fields are optional - allows partial updates
 */
export const UpdateBriefingRequestSchema = z.object({
  business_name: z.string().min(1).max(255).optional(),
  segment: z.string().max(50).optional(),
  target_audience: z.string().optional(),
  voice_tone: z.string().max(100).optional(),
  objectives: z.array(z.string()).optional(),
  differentiators: z.string().optional(),
  existing_colors: z.array(z.string()).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'approved', 'processing', 'completed']).optional(),
  monthly_budget: z.number().positive().optional(),
});

export type UpdateBriefingRequest = z.infer<typeof UpdateBriefingRequestSchema>;

/**
 * Query parameters for listing briefings
 */
export const ListBriefingsQuerySchema = z.object({
  client_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'approved', 'processing', 'completed']).optional(),
});

export type ListBriefingsQuery = z.infer<typeof ListBriefingsQuerySchema>;
