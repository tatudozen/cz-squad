import { z } from 'zod';
/**
 * Color palette schema
 */
declare const color_paletteSchema: z.ZodObject<{
    primary: z.ZodString;
    secondary: z.ZodString;
    accent: z.ZodString;
    neutral: z.ZodString;
}, "strip", z.ZodTypeAny, {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string;
}, {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string;
}>;
export type ColorPalette = z.infer<typeof color_paletteSchema>;
/**
 * Voice guidelines schema
 */
declare const voiceGuidelinesSchema: z.ZodObject<{
    tone: z.ZodString;
    keywords_to_use: z.ZodArray<z.ZodString, "many">;
    keywords_to_avoid: z.ZodArray<z.ZodString, "many">;
    example_phrases: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    tone?: string;
    keywords_to_use?: string[];
    keywords_to_avoid?: string[];
    example_phrases?: string[];
}, {
    tone?: string;
    keywords_to_use?: string[];
    keywords_to_avoid?: string[];
    example_phrases?: string[];
}>;
export type VoiceGuidelines = z.infer<typeof voiceGuidelinesSchema>;
/**
 * Create brand profile request validation schema
 */
export declare const CreateBrandProfileRequestSchema: z.ZodObject<{
    client_id: z.ZodString;
    briefing_id: z.ZodString;
    color_palette: z.ZodObject<{
        primary: z.ZodString;
        secondary: z.ZodString;
        accent: z.ZodString;
        neutral: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    }, {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    }>;
    voice_guidelines: z.ZodObject<{
        tone: z.ZodString;
        keywords_to_use: z.ZodArray<z.ZodString, "many">;
        keywords_to_avoid: z.ZodArray<z.ZodString, "many">;
        example_phrases: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    }, {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    }>;
    visual_style: z.ZodOptional<z.ZodString>;
    font_recommendations: z.ZodOptional<z.ZodObject<{
        heading: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        heading?: string;
        body?: string;
    }, {
        heading?: string;
        body?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    client_id?: string;
    briefing_id?: string;
    voice_guidelines?: {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    };
    visual_style?: string;
    color_palette?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    };
    font_recommendations?: {
        heading?: string;
        body?: string;
    };
}, {
    client_id?: string;
    briefing_id?: string;
    voice_guidelines?: {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    };
    visual_style?: string;
    color_palette?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    };
    font_recommendations?: {
        heading?: string;
        body?: string;
    };
}>;
export type CreateBrandProfileRequest = z.infer<typeof CreateBrandProfileRequestSchema>;
/**
 * Update brand profile request validation schema
 * All fields optional for partial updates
 */
export declare const UpdateBrandProfileRequestSchema: z.ZodObject<{
    color_palette: z.ZodOptional<z.ZodObject<{
        primary: z.ZodString;
        secondary: z.ZodString;
        accent: z.ZodString;
        neutral: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    }, {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    }>>;
    voice_guidelines: z.ZodOptional<z.ZodObject<{
        tone: z.ZodString;
        keywords_to_use: z.ZodArray<z.ZodString, "many">;
        keywords_to_avoid: z.ZodArray<z.ZodString, "many">;
        example_phrases: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    }, {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    }>>;
    visual_style: z.ZodOptional<z.ZodString>;
    font_recommendations: z.ZodOptional<z.ZodObject<{
        heading: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        heading?: string;
        body?: string;
    }, {
        heading?: string;
        body?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    voice_guidelines?: {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    };
    visual_style?: string;
    color_palette?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    };
    font_recommendations?: {
        heading?: string;
        body?: string;
    };
}, {
    voice_guidelines?: {
        tone?: string;
        keywords_to_use?: string[];
        keywords_to_avoid?: string[];
        example_phrases?: string[];
    };
    visual_style?: string;
    color_palette?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    };
    font_recommendations?: {
        heading?: string;
        body?: string;
    };
}>;
export type UpdateBrandProfileRequest = z.infer<typeof UpdateBrandProfileRequestSchema>;
export {};
//# sourceMappingURL=brand-profile-request.d.ts.map