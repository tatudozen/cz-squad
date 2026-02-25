// Zod validation schemas for Copy Generation API requests
import { z } from 'zod';

/**
 * Copy type enum
 */
export const CopyTypeEnum = z.enum([
  'headline',
  'subheadline',
  'body_text',
  'cta',
  'social_post',
]);

export type CopyType = z.infer<typeof CopyTypeEnum>;

/**
 * Copy characteristics by type
 */
export const COPY_CONSTRAINTS: Record<CopyType, { min: number; max: number }> = {
  headline: { min: 20, max: 80 },
  subheadline: { min: 30, max: 150 },
  body_text: { min: 100, max: 500 },
  cta: { min: 10, max: 50 },
  social_post: { min: 50, max: 280 },
};

/**
 * Generate copy request validation schema
 */
export const GenerateCopyRequestSchema = z.object({
  client_id: z.string().uuid('Invalid client ID format'),
  brand_profile_id: z.string().uuid('Invalid brand profile ID format'),
  copy_type: CopyTypeEnum,
  context: z.string().min(1).max(500).optional(),
  tone_override: z.string().min(1).max(100).optional(),
});

export type GenerateCopyRequest = z.infer<typeof GenerateCopyRequestSchema>;
