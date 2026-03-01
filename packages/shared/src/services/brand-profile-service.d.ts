import { Briefing } from '../supabase.js';
import { ColorPalette, VoiceGuidelines } from '../schemas/brand-profile-request.js';
export interface GeneratedBrandProfile {
    color_palette: ColorPalette;
    voice_guidelines: VoiceGuidelines;
    visual_style?: string;
}
export interface GenerationMetrics {
    tokens_used: number;
    time_ms: number;
    cost_usd: number;
}
/**
 * Build the prompt for brand profile generation
 */
export declare function buildBrandProfilePrompt(briefing: Briefing): string;
/**
 * Parse and validate the generated JSON response
 */
export declare function parseGeneratedProfile(response: string): GeneratedBrandProfile;
/**
 * Calculate cost based on tokens used
 * Claude 3.5 Sonnet: $3 per 1M input tokens, $15 per 1M output tokens
 */
export declare function calculateCost(inputTokens: number, outputTokens: number): number;
/**
 * Generate brand profile from briefing
 * Uses Claude API (when available) or deterministic generation for testing
 */
export declare function generateBrandProfile(briefing: Briefing): Promise<{
    profile: GeneratedBrandProfile;
    metrics: GenerationMetrics;
}>;
//# sourceMappingURL=brand-profile-service.d.ts.map