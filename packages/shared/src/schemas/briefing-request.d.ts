import { z } from 'zod';
/**
 * Create briefing request validation schema
 * Validates: client_id, business_name, segment, target_audience, voice_tone, objectives, differentiators
 */
export declare const CreateBriefingRequestSchema: z.ZodObject<{
    client_id: z.ZodString;
    business_name: z.ZodString;
    segment: z.ZodString;
    target_audience: z.ZodString;
    voice_tone: z.ZodString;
    objectives: z.ZodArray<z.ZodString, "many">;
    differentiators: z.ZodString;
    existing_colors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    logo_url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    monthly_budget: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    client_id?: string;
    segment?: string;
    target_audience?: string;
    business_name?: string;
    voice_tone?: string;
    differentiators?: string;
    objectives?: string[];
    existing_colors?: string[];
    logo_url?: string;
    monthly_budget?: number;
}, {
    client_id?: string;
    segment?: string;
    target_audience?: string;
    business_name?: string;
    voice_tone?: string;
    differentiators?: string;
    objectives?: string[];
    existing_colors?: string[];
    logo_url?: string;
    monthly_budget?: number;
}>;
export type CreateBriefingRequest = z.infer<typeof CreateBriefingRequestSchema>;
/**
 * Update briefing request validation schema
 * All fields are optional - allows partial updates
 */
export declare const UpdateBriefingRequestSchema: z.ZodObject<{
    business_name: z.ZodOptional<z.ZodString>;
    segment: z.ZodOptional<z.ZodString>;
    target_audience: z.ZodOptional<z.ZodString>;
    voice_tone: z.ZodOptional<z.ZodString>;
    objectives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    differentiators: z.ZodOptional<z.ZodString>;
    existing_colors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    logo_url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    status: z.ZodOptional<z.ZodEnum<["draft", "approved", "processing", "completed"]>>;
    monthly_budget: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "draft" | "approved" | "processing" | "completed";
    segment?: string;
    target_audience?: string;
    business_name?: string;
    voice_tone?: string;
    differentiators?: string;
    objectives?: string[];
    existing_colors?: string[];
    logo_url?: string;
    monthly_budget?: number;
}, {
    status?: "draft" | "approved" | "processing" | "completed";
    segment?: string;
    target_audience?: string;
    business_name?: string;
    voice_tone?: string;
    differentiators?: string;
    objectives?: string[];
    existing_colors?: string[];
    logo_url?: string;
    monthly_budget?: number;
}>;
export type UpdateBriefingRequest = z.infer<typeof UpdateBriefingRequestSchema>;
/**
 * Query parameters for listing briefings
 */
export declare const ListBriefingsQuerySchema: z.ZodObject<{
    client_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["draft", "approved", "processing", "completed"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "draft" | "approved" | "processing" | "completed";
    client_id?: string;
}, {
    status?: "draft" | "approved" | "processing" | "completed";
    client_id?: string;
}>;
export type ListBriefingsQuery = z.infer<typeof ListBriefingsQuerySchema>;
//# sourceMappingURL=briefing-request.d.ts.map