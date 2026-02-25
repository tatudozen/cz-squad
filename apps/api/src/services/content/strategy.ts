/**
 * Content Strategy Service
 * Generates coherent content plans from approved briefings and brand profiles
 *
 * Source: Story 2.1 - Content Strategy & Planning Module
 */

import { randomUUID } from 'crypto';
import { Briefing, BrandProfile } from '@shared/types';
import {
  ContentPlan,
  ContentPlanOptions,
  ContentPlanPost,
  PostType,
  ContentFormat,
} from '../types/content.ts';
import { llmAdapter } from '../../utils/llm-adapter.ts';
import { logger } from '../../utils/logger.ts';

/**
 * Default options for content plan generation
 */
const DEFAULT_OPTIONS: ContentPlanOptions = {
  total_posts: 10,
  inception_ratio: 0.7, // 70% Inception, 30% Atração Fatal
  formats: 'mix',
};

/**
 * Generates a comprehensive content plan based on briefing and brand profile
 *
 * @param briefing - Approved briefing with objectives and target audience
 * @param brandProfile - Brand profile with voice guidelines and color palette
 * @param clientId - Client UUID for RLS
 * @param options - Plan options (total posts, inception ratio, formats)
 * @returns Generated content plan with 10-50 posts
 * @throws Error if LLM fails or validation fails after retries
 *
 * Algorithm:
 * 1. Merge options with defaults
 * 2. Calculate inception vs atração-fatal distribution
 * 3. Call LLM to generate post themes and strategy
 * 4. Validate FunWheel CTA presence in atração-fatal posts
 * 5. If validation fails, retry LLM up to 2 times
 * 6. Return structured content plan
 */
export async function createContentPlan(
  briefing: Briefing,
  brandProfile: BrandProfile,
  clientId: string,
  options?: Partial<ContentPlanOptions>
): Promise<ContentPlan> {
  // Merge with defaults
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Validation
  if (mergedOptions.total_posts < 1 || mergedOptions.total_posts > 50) {
    throw new Error(
      `Invalid total_posts: ${mergedOptions.total_posts}. Must be between 1 and 50.`
    );
  }

  if (
    mergedOptions.inception_ratio < 0 ||
    mergedOptions.inception_ratio > 1
  ) {
    throw new Error(
      `Invalid inception_ratio: ${mergedOptions.inception_ratio}. Must be between 0 and 1.`
    );
  }

  // Calculate post distribution
  const inceptionCount = Math.ceil(
    mergedOptions.total_posts * mergedOptions.inception_ratio
  );
  const atracaoFatalCount = mergedOptions.total_posts - inceptionCount;

  logger.info('Content plan generation started', {
    briefing_id: briefing.id,
    total_posts: mergedOptions.total_posts,
    inception_count: inceptionCount,
    atracaoFatal_count: atracaoFatalCount,
  });

  // Generate plan via LLM (with retry logic for FunWheel validation)
  let generatedPlan: ContentPlanPost[] | null = null;
  let attempts = 0;
  const maxRetries = 2;

  while (attempts <= maxRetries && !generatedPlan) {
    attempts++;

    // Call LLM to generate strategy
    const prompt = buildStrategyPrompt(
      briefing,
      brandProfile,
      mergedOptions,
      inceptionCount,
      atracaoFatalCount
    );

    const llmResponse = await llmAdapter.generateCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Parse LLM response (expect JSON array of posts)
    let posts: ContentPlanPost[] = [];

    try {
      // Extract JSON from response (LLM might include other text)
      const jsonMatch = llmResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in LLM response');
      }

      posts = JSON.parse(jsonMatch[0]) as ContentPlanPost[];

      // Validate structure
      if (!Array.isArray(posts) || posts.length === 0) {
        throw new Error('Invalid posts array from LLM');
      }

      logger.debug('LLM generated posts', {
        count: posts.length,
        attempt: attempts,
      });
    } catch (parseError) {
      logger.error('Failed to parse LLM response', {
        error: String(parseError),
        response: llmResponse.substring(0, 200),
      });
      if (attempts >= maxRetries) {
        throw new Error(`Failed to parse LLM response after ${attempts} attempts`);
      }
      continue;
    }

    // Validate FunWheel CTA requirement
    const atracaoFatalPosts = posts.filter((p) => p.mode === 'atração-fatal');
    const allHaveFunWheel = atracaoFatalPosts.every(
      (p) =>
        p.creative_brief.toLowerCase().includes('funwheel') ||
        p.creative_brief.toLowerCase().includes('funil')
    );

    if (!allHaveFunWheel) {
      logger.warn('FunWheel CTA validation failed', {
        attempt: attempts,
        atracaoFatalCount: atracaoFatalPosts.length,
      });

      if (attempts >= maxRetries) {
        // Log which posts are missing FunWheel
        const problematic = atracaoFatalPosts
          .filter(
            (p) =>
              !p.creative_brief.toLowerCase().includes('funwheel') &&
              !p.creative_brief.toLowerCase().includes('funil')
          )
          .map((p) => p.post_number);

        throw new Error(
          `Atração Fatal posts missing FunWheel CTA after ${attempts} attempts. Posts: ${problematic.join(', ')}`
        );
      }

      continue;
    }

    // All validations passed
    generatedPlan = posts;
    logger.info('Content plan validated successfully', {
      attempt: attempts,
      postCount: posts.length,
    });
  }

  if (!generatedPlan) {
    throw new Error('Content plan generation failed after all retry attempts');
  }

  // Build final content plan
  const contentPlan: ContentPlan = {
    id: randomUUID(),
    briefing_id: briefing.id,
    brand_profile_id: brandProfile.id,
    client_id: clientId,
    status: 'draft',
    total_posts: mergedOptions.total_posts,
    inception_posts: inceptionCount,
    atracaofatal_posts: atracaoFatalCount,
    posts: generatedPlan,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  logger.info('Content plan created successfully', {
    plan_id: contentPlan.id,
    post_count: contentPlan.posts.length,
  });

  return contentPlan;
}

/**
 * Builds the LLM prompt for content strategy generation
 */
function buildStrategyPrompt(
  briefing: Briefing,
  brandProfile: BrandProfile,
  options: ContentPlanOptions,
  inceptionCount: number,
  atracaoFatalCount: number
): string {
  return `You are a content strategist generating a cohesive content plan for a social media campaign.

CLIENT BRIEF:
- Business: ${briefing.businessName}
- Segment: ${briefing.segment}
- Target Audience: ${briefing.targetAudience}
- Key Objectives: ${briefing.objectives.join(', ')}
- Tone of Voice: ${briefing.voiceTone}
- Differentiators: ${briefing.differentiators}

BRAND PROFILE:
- Brand Voice: ${brandProfile.voiceGuidelines}
- Color Palette: ${(brandProfile.colorPalette as any[]).map((c: any) => c.name).join(', ')}

CONTENT PLAN REQUIREMENTS:
You must generate exactly ${options.total_posts} posts with:
- ${inceptionCount} posts in "Inception" mode (branding, education, soft CTA like "follow" or "save")
- ${atracaoFatalCount} posts in "Atração Fatal" mode (urgency/curiosity with CTA directing to FunWheel)
- Mix of carousel and image formats
- Target platforms: Instagram and LinkedIn
- Each post needs: type, mode, theme (content angle), target_platform, and creative_brief (2-3 lines)

CRITICAL CONSTRAINTS:
1. ALL "atração-fatal" posts MUST explicitly mention "FunWheel" or "funil" in the creative brief
2. Posts must be thematically coherent and progress logically
3. Themes should relate to the client's industry and objectives
4. Ensure variety in content angles (educational, motivational, promotional, etc.)

OUTPUT FORMAT (JSON array):
Return a valid JSON array of posts with this structure:
[
  {
    "post_number": 1,
    "type": "carousel" | "image",
    "mode": "inception" | "atração-fatal",
    "theme": "Topic/Angle",
    "target_platform": "instagram" | "linkedin",
    "publish_order": 1,
    "creative_brief": "2-3 line description of the concept and objective"
  },
  ...
]

Generate the content plan now:`;
}

/**
 * Export the strategy service
 */
export default {
  createContentPlan,
};
