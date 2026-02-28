/**
 * Static Post Copy Generator
 * Generates platform-specific copy for Instagram and LinkedIn posts
 *
 * Story 2.3: Static Post Copy Generator (Epic 2)
 */

import { randomUUID } from 'crypto';
import { ContentPlanPost, ContentMode } from '@api/types/content';
import { BrandProfile } from '@shared/types';
import { llmAdapter } from '../../../utils/llm-adapter';
import { logger } from '../../../utils/logger';

export type Platform = 'instagram' | 'linkedin';

export interface StaticPost {
  id: string;
  plan_item_id: string;
  brand_profile_id: string;
  client_id: string;
  mode: ContentMode;
  platform: Platform;
  main_text: string;
  hashtags: string[];
  design_note: string;
  character_count: number;
  hashtag_count: number;
  created_at: string;
  updated_at: string;
}

export interface StaticPostOptions {
  style?: 'educational' | 'promotional' | 'narrative';
}

const PLATFORM_CONFIG = {
  instagram: {
    max_chars: 2200,
    min_hashtags: 10,
    max_hashtags: 30,
    tone: 'engaging and visual',
  },
  linkedin: {
    max_chars: 3000,
    min_hashtags: 3,
    max_hashtags: 5,
    tone: 'professional and consultative',
  },
};

const DEFAULT_OPTIONS: StaticPostOptions = {
  style: 'narrative',
};

/**
 * Generate static post copy from a content plan item
 */
export async function generateStaticPost(
  planItem: ContentPlanPost,
  brandProfile: BrandProfile,
  clientId: string,
  platform: Platform,
  options?: Partial<StaticPostOptions>
): Promise<StaticPost> {
  // Merge with defaults
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Validate platform
  if (!['instagram', 'linkedin'].includes(platform)) {
    throw new Error(`Invalid platform: ${platform}. Must be 'instagram' or 'linkedin'.`);
  }

  logger.info('Static post generation started', {
    plan_item_id: planItem.id,
    mode: planItem.mode,
    platform,
  });

  // Build LLM prompt
  const prompt = buildStaticPostPrompt(planItem, brandProfile, platform, mergedOptions);

  let mainText = '';
  let hashtags: string[] = [];
  let designNote = '';
  let attempts = 0;
  const maxRetries = 2;

  while (attempts < maxRetries) {
    attempts++;
    try {
      const llmResponse = await llmAdapter.generateCompletion(prompt);

      // Parse LLM response
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        main_text: string;
        hashtags: string[];
        design_note: string;
      };

      mainText = parsed.main_text.substring(0, PLATFORM_CONFIG[platform].max_chars);
      hashtags = parsed.hashtags || [];
      designNote = parsed.design_note;

      // Validate structure
      if (!mainText || mainText.trim().length === 0) {
        throw new Error('Invalid main_text from LLM');
      }

      // Validate character limit
      if (mainText.length > PLATFORM_CONFIG[platform].max_chars) {
        logger.warn('Main text exceeded character limit', {
          platform,
          limit: PLATFORM_CONFIG[platform].max_chars,
          actual: mainText.length,
        });
        mainText = mainText.substring(0, PLATFORM_CONFIG[platform].max_chars);
      }

      // Validate hashtag count (allow ±2 tolerance)
      const minHashtags = PLATFORM_CONFIG[platform].min_hashtags;
      const maxHashtags = PLATFORM_CONFIG[platform].max_hashtags;
      if (hashtags.length < minHashtags - 2 || hashtags.length > maxHashtags + 2) {
        logger.warn('Hashtag count out of expected range', {
          platform,
          expected_min: minHashtags,
          expected_max: maxHashtags,
          actual: hashtags.length,
        });
      }

      logger.info('Static post generated successfully', {
        plan_item_id: planItem.id,
        platform,
        char_count: mainText.length,
        hashtag_count: hashtags.length,
        attempt: attempts,
      });

      break;
    } catch (error) {
      logger.error('Static post generation failed', {
        error: String(error),
        attempt: attempts,
      });

      if (attempts >= maxRetries) {
        throw new Error(`Failed to generate static post after ${attempts} attempts`);
      }
    }
  }

  // Create static post object
  const post: StaticPost = {
    id: randomUUID(),
    plan_item_id: planItem.id!,
    brand_profile_id: brandProfile.id,
    client_id: clientId,
    mode: planItem.mode,
    platform,
    main_text: mainText,
    hashtags,
    design_note: designNote,
    character_count: mainText.length,
    hashtag_count: hashtags.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  logger.info('Static post created successfully', {
    post_id: post.id,
    platform: post.platform,
    char_count: post.character_count,
    hashtag_count: post.hashtag_count,
  });

  return post;
}

function buildStaticPostPrompt(
  planItem: ContentPlanPost,
  brandProfile: BrandProfile,
  platform: Platform,
  options: StaticPostOptions
): string {
  const config = PLATFORM_CONFIG[platform];
  const modeDescription =
    planItem.mode === 'inception'
      ? 'Soft CTA (follow, connect, learn more, visit link)'
      : 'Direct CTA to FunWheel funnel link';

  const styleGuide = `Use "${options.style}" style: ${
    options.style === 'educational'
      ? 'educational, informative, teach-based'
      : options.style === 'promotional'
        ? 'promotional, benefit-focused, persuasive'
        : 'narrative, story-driven, emotionally engaging'
  }`;

  const hashtagGuide =
    platform === 'instagram'
      ? `Generate ${config.min_hashtags}-${config.max_hashtags} hashtags that are relevant to the post theme and will improve discoverability on Instagram.`
      : `Generate ${config.min_hashtags}-${config.max_hashtags} professional hashtags (LinkedIn style - more selective, less is more).`;

  return `Generate a ${platform} post for the following content plan:

THEME: ${planItem.theme}
MODE: ${planItem.mode} (${modeDescription})
STYLE: ${styleGuide}
PLATFORM: ${platform === 'instagram' ? 'Instagram - Visual, engaging, emoji-friendly' : 'LinkedIn - Professional, consultative, minimal emoji'}

POST BRIEF: ${planItem.creative_brief}

BRAND GUIDELINES:
- Voice: ${brandProfile.voice_guidelines}
- Tone: ${config.tone}

POST REQUIREMENTS:
- Maximum length: ${config.max_chars} characters (STRICT)
- Platform: ${platform}
- For Instagram: Make it visual, use relevant emojis, shorter sentences, call-to-action is friendly
- For LinkedIn: Professional tone, minimal emojis, longer form is acceptable, call-to-action is consultative

HASHTAG STRATEGY:
${hashtagGuide}

Each hashtag must:
- Start with # (include in the hashtag string)
- Be relevant to the content theme
- Be commonly used on ${platform}

OUTPUT FORMAT (valid JSON):
{
  "main_text": "Complete post copy respecting the ${config.max_chars} character limit",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "design_note": "Visual suggestion for a single image (emoji + composition description, e.g. '🎯 Hero image with overlay text showing transformation')"
}

IMPORTANT:
- Respect character limit STRICTLY (${config.max_chars} max)
- Ensure logical flow and readability
- For Inception: emphasize value, education, soft persuasion, invite to follow/connect
- For Atração Fatal: create urgency, curiosity, curiosity gap, direct to FunWheel
- Make post engaging with relevant emojis (Instagram) or minimal emojis (LinkedIn)
- Design note should be actionable for designer
- Include CTA naturally within the main text
- Format hashtags as array with # symbol included`;
}
