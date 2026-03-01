// Zod validation schemas for Brand Profile API requests
import { z } from 'zod';
/**
 * Hex color validator
 */
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');
/**
 * Color palette schema
 */
const color_paletteSchema = z.object({
    primary: hexColorSchema,
    secondary: hexColorSchema,
    accent: hexColorSchema,
    neutral: hexColorSchema,
});
/**
 * Voice guidelines schema
 */
const voiceGuidelinesSchema = z.object({
    tone: z.string().min(1, 'Tone is required'),
    keywords_to_use: z.array(z.string()).min(1, 'At least 1 keyword to use required'),
    keywords_to_avoid: z.array(z.string()).min(1, 'At least 1 keyword to avoid required'),
    example_phrases: z.array(z.string()).min(1, 'At least 1 example phrase required'),
});
/**
 * Create brand profile request validation schema
 */
export const CreateBrandProfileRequestSchema = z.object({
    client_id: z.string().uuid('Invalid client ID format'),
    briefing_id: z.string().uuid('Invalid briefing ID format'),
    color_palette: color_paletteSchema,
    voice_guidelines: voiceGuidelinesSchema,
    visual_style: z.string().min(1, 'Visual style is required').max(255).optional(),
    font_recommendations: z
        .object({
        heading: z.string().optional(),
        body: z.string().optional(),
    })
        .optional(),
});
/**
 * Update brand profile request validation schema
 * All fields optional for partial updates
 */
export const UpdateBrandProfileRequestSchema = z.object({
    color_palette: color_paletteSchema.optional(),
    voice_guidelines: voiceGuidelinesSchema.optional(),
    visual_style: z.string().min(1).max(255).optional(),
    font_recommendations: z
        .object({
        heading: z.string().optional(),
        body: z.string().optional(),
    })
        .optional(),
});
//# sourceMappingURL=brand-profile-request.js.map