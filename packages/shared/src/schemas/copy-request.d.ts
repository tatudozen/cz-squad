import { z } from 'zod';
/**
 * Copy type enum
 */
export declare const CopyTypeEnum: z.ZodEnum<["headline", "subheadline", "body_text", "cta", "social_post"]>;
export type CopyType = z.infer<typeof CopyTypeEnum>;
/**
 * Copy characteristics by type
 */
export declare const COPY_CONSTRAINTS: Record<CopyType, {
    min: number;
    max: number;
}>;
/**
 * Generate copy request validation schema
 */
export declare const GenerateCopyRequestSchema: z.ZodObject<{
    client_id: z.ZodString;
    brand_profile_id: z.ZodString;
    copy_type: z.ZodEnum<["headline", "subheadline", "body_text", "cta", "social_post"]>;
    context: z.ZodOptional<z.ZodString>;
    tone_override: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_id?: string;
    brand_profile_id?: string;
    copy_type?: "headline" | "subheadline" | "body_text" | "cta" | "social_post";
    context?: string;
    tone_override?: string;
}, {
    client_id?: string;
    brand_profile_id?: string;
    copy_type?: "headline" | "subheadline" | "body_text" | "cta" | "social_post";
    context?: string;
    tone_override?: string;
}>;
export type GenerateCopyRequest = z.infer<typeof GenerateCopyRequestSchema>;
//# sourceMappingURL=copy-request.d.ts.map