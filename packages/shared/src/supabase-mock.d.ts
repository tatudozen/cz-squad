import { SupabaseClient } from '@supabase/supabase-js';
export declare const supabaseAdmin: SupabaseClient;
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
export declare const BriefingInputSchema: z.ZodObject<{
    client_id: z.ZodString;
    title: z.ZodString;
    segment: z.ZodOptional<z.ZodString>;
    target_audience: z.ZodOptional<z.ZodString>;
    main_problem: z.ZodOptional<z.ZodString>;
    desired_transformation: z.ZodOptional<z.ZodString>;
    tone_voice: z.ZodOptional<z.ZodString>;
    unique_advantage: z.ZodOptional<z.ZodString>;
    call_to_action: z.ZodOptional<z.ZodString>;
    visual_references: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_id?: string;
    title?: string;
    segment?: string;
    target_audience?: string;
    main_problem?: string;
    desired_transformation?: string;
    tone_voice?: string;
    unique_advantage?: string;
    call_to_action?: string;
    visual_references?: string;
}, {
    client_id?: string;
    title?: string;
    segment?: string;
    target_audience?: string;
    main_problem?: string;
    desired_transformation?: string;
    tone_voice?: string;
    unique_advantage?: string;
    call_to_action?: string;
    visual_references?: string;
}>;
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
//# sourceMappingURL=supabase-mock.d.ts.map