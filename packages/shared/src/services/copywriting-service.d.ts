import { BrandProfile } from '../supabase.js';
import { CopyType } from '../schemas/copy-request.js';
export interface CopyValidation {
    respects_tone: boolean;
    includes_keywords: string[];
    avoids_forbidden: boolean;
    is_within_length: boolean;
    confidence_score: number;
}
export interface GeneratedCopy {
    id: string;
    generated_copy: string;
    copy_type: CopyType;
    character_count: number;
    validation: CopyValidation;
    generation_metrics: {
        tokens_used: number;
        time_ms: number;
        cost_usd: number;
        model: string;
    };
    timestamp: string;
}
/**
 * Generate marketing copy based on brand profile
 */
export declare function generateCopy(businessName: string, targetAudience: string, differentiators: string, copy_type: CopyType, brandProfile: BrandProfile): Promise<GeneratedCopy>;
//# sourceMappingURL=copywriting-service.d.ts.map