/**
 * Build the prompt for brand profile generation
 */
export function buildBrandProfilePrompt(briefing) {
    return `You are a brand strategy expert. Given the following client briefing, generate a comprehensive brand profile with specific, actionable guidance.

BRIEFING:
- Business Name: ${briefing.business_name}
- Segment: ${briefing.segment}
- Target Audience: ${briefing.target_audience}
- Voice Tone: ${briefing.voice_tone}
- Objectives: ${briefing.objectives.join(', ')}
- Differentiators: ${briefing.differentiators}
- Existing Colors: ${briefing.existing_colors?.join(', ') || 'None specified'}

Generate and return ONLY a valid JSON object (no markdown, no code blocks, no explanations) with this exact structure:
{
  "color_palette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "neutral": "#HEX"
  },
  "voice_guidelines": {
    "tone": "description of tone",
    "keywords_to_use": ["keyword1", "keyword2", "keyword3"],
    "keywords_to_avoid": ["keyword1", "keyword2"],
    "example_phrases": ["example phrase 1", "example phrase 2", "example phrase 3"]
  },
  "visual_style": "description of visual style"
}

Requirements:
1. Colors must reflect the business segment and target audience
2. Voice tone must match the briefing requirements exactly
3. Keywords must be specific to the business domain and differentiators
4. Example phrases must demonstrate the voice in action (2-3 words each)
5. All hex colors must be valid (#RRGGBB format)
6. If existing colors provided, incorporate them as primary or secondary`;
}
/**
 * Parse and validate the generated JSON response
 */
export function parseGeneratedProfile(response) {
    try {
        // Remove markdown code blocks if present
        let cleanedResponse = response.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
        }
        else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
        }
        const parsed = JSON.parse(cleanedResponse);
        // Validate structure
        if (!parsed.color_palette || typeof parsed.color_palette !== 'object') {
            throw new Error('Missing or invalid color_palette');
        }
        if (!parsed.voice_guidelines || typeof parsed.voice_guidelines !== 'object') {
            throw new Error('Missing or invalid voice_guidelines');
        }
        // Validate color format
        const colors = ['primary', 'secondary', 'accent', 'neutral'];
        for (const color of colors) {
            if (!parsed.color_palette[color]) {
                throw new Error(`Missing color: ${color}`);
            }
            if (!/^#[0-9A-Fa-f]{6}$/.test(parsed.color_palette[color])) {
                throw new Error(`Invalid hex color: ${parsed.color_palette[color]}`);
            }
        }
        // Validate voice_guidelines
        if (!Array.isArray(parsed.voice_guidelines.keywords_to_use)) {
            throw new Error('keywords_to_use must be an array');
        }
        if (!Array.isArray(parsed.voice_guidelines.keywords_to_avoid)) {
            throw new Error('keywords_to_avoid must be an array');
        }
        if (!Array.isArray(parsed.voice_guidelines.example_phrases)) {
            throw new Error('example_phrases must be an array');
        }
        return {
            color_palette: parsed.color_palette,
            voice_guidelines: {
                tone: parsed.voice_guidelines.tone,
                keywords_to_use: parsed.voice_guidelines.keywords_to_use,
                keywords_to_avoid: parsed.voice_guidelines.keywords_to_avoid,
                example_phrases: parsed.voice_guidelines.example_phrases,
            },
            visual_style: parsed.visual_style,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse generated profile: ${errorMessage}`);
    }
}
/**
 * Calculate cost based on tokens used
 * Claude 3.5 Sonnet: $3 per 1M input tokens, $15 per 1M output tokens
 */
export function calculateCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1000000) * 3;
    const outputCost = (outputTokens / 1000000) * 15;
    return inputCost + outputCost;
}
/**
 * Generate brand profile from briefing
 * Uses Claude API (when available) or deterministic generation for testing
 */
export async function generateBrandProfile(briefing) {
    const startTime = Date.now();
    try {
        // Generate deterministic profile based on briefing
        // TODO: Replace with actual Claude API call when LLM service is ready
        const profile = generateDeterministicProfile(briefing);
        const endTime = Date.now();
        const timeMs = endTime - startTime;
        // Estimate tokens (in production, use actual token count from Claude API)
        const estimatedTokens = 600;
        const cost = calculateCost(estimatedTokens * 0.7, estimatedTokens * 0.3);
        return {
            profile,
            metrics: {
                tokens_used: estimatedTokens,
                time_ms: timeMs,
                cost_usd: parseFloat(cost.toFixed(6)),
            },
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // eslint-disable-next-line no-console
        console.error('[GENERATION_ERROR]', errorMessage);
        throw error;
    }
}
/**
 * Generate a deterministic brand profile based on briefing data
 * Used for testing and as fallback until full Claude integration
 */
function generateDeterministicProfile(briefing) {
    // Map segments to color palettes
    const color_palettesBySegment = {
        health: {
            primary: '#0066CC',
            secondary: '#00CC99',
            accent: '#FF6B35',
            neutral: '#E0E7FF',
        },
        tech: {
            primary: '#1A73E8',
            secondary: '#34A853',
            accent: '#FBBC04',
            neutral: '#F8F9FA',
        },
        consulting: {
            primary: '#2C3E50',
            secondary: '#3498DB',
            accent: '#E74C3C',
            neutral: '#ECF0F1',
        },
        default: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#FF9900',
            neutral: '#F5F5F5',
        },
    };
    const segment = briefing.segment || 'default';
    const color_palette = color_palettesBySegment[segment] || color_palettesBySegment.default;
    // Use existing colors if provided
    if (briefing.existing_colors && briefing.existing_colors.length > 0) {
        color_palette.primary = briefing.existing_colors[0];
        if (briefing.existing_colors.length > 1) {
            color_palette.secondary = briefing.existing_colors[1];
        }
    }
    const voice_guidelines = {
        tone: briefing.voice_tone || 'professional',
        keywords_to_use: [
            ...(briefing.differentiators ? [briefing.differentiators.split(' ')[0].toLowerCase()] : []),
            ...briefing.objectives.slice(0, 2).map((obj) => obj.toLowerCase()),
        ].slice(0, 3),
        keywords_to_avoid: ['generic', 'amateur', 'outdated'],
        example_phrases: [
            `${briefing.business_name || 'Our brand'} delivers exceptional value`,
            `Transform your ${briefing.target_audience || 'business'} experience`,
            `Quality and innovation in every detail`,
        ],
    };
    return {
        color_palette: color_palette,
        voice_guidelines: voice_guidelines,
        visual_style: `modern, clean, professional aesthetic befitting a ${segment} business`,
    };
}
//# sourceMappingURL=brand-profile-service.js.map