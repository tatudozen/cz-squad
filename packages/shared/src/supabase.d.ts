import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
declare let supabaseAdmin: any;
export { supabaseAdmin };
declare let supabase: SupabaseClient | null;
export { supabase };
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
    tone_voice?: string;
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
export declare const ClientInputSchema: z.ZodObject<{
    name: z.ZodString;
    industry: z.ZodOptional<z.ZodString>;
    contact_name: z.ZodOptional<z.ZodString>;
    contact_email: z.ZodOptional<z.ZodString>;
    contact_phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    industry?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    description?: string;
}, {
    name?: string;
    industry?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    description?: string;
}>;
export type ClientInput = z.infer<typeof ClientInputSchema>;
export declare const BriefingInputSchema: z.ZodObject<{
    client_id: z.ZodString;
    business_name: z.ZodString;
    segment: z.ZodOptional<z.ZodString>;
    target_audience: z.ZodOptional<z.ZodString>;
    main_problem: z.ZodOptional<z.ZodString>;
    desired_transformation: z.ZodOptional<z.ZodString>;
    voice_tone: z.ZodOptional<z.ZodString>;
    differentiators: z.ZodOptional<z.ZodString>;
    call_to_action: z.ZodOptional<z.ZodString>;
    visual_references: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_id?: string;
    segment?: string;
    target_audience?: string;
    main_problem?: string;
    desired_transformation?: string;
    call_to_action?: string;
    visual_references?: string;
    business_name?: string;
    voice_tone?: string;
    differentiators?: string;
}, {
    client_id?: string;
    segment?: string;
    target_audience?: string;
    main_problem?: string;
    desired_transformation?: string;
    call_to_action?: string;
    visual_references?: string;
    business_name?: string;
    voice_tone?: string;
    differentiators?: string;
}>;
export type BriefingInput = z.infer<typeof BriefingInputSchema>;
export declare const BrandProfileInputSchema: z.ZodObject<{
    client_id: z.ZodString;
    briefing_id: z.ZodOptional<z.ZodString>;
    colors: z.ZodOptional<z.ZodAny>;
    fonts: z.ZodOptional<z.ZodAny>;
    voice_guidelines: z.ZodOptional<z.ZodString>;
    visual_style: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_id?: string;
    briefing_id?: string;
    colors?: any;
    fonts?: any;
    voice_guidelines?: string;
    visual_style?: string;
}, {
    client_id?: string;
    briefing_id?: string;
    colors?: any;
    fonts?: any;
    voice_guidelines?: string;
    visual_style?: string;
}>;
export type BrandProfileInput = z.infer<typeof BrandProfileInputSchema>;
export declare class SupabaseError extends Error {
    code: string;
    details?: unknown;
    constructor(message: string, code: string, details?: unknown);
}
export declare function handleSupabaseError(error: unknown): never;
export default supabaseAdmin;
//# sourceMappingURL=supabase.d.ts.map