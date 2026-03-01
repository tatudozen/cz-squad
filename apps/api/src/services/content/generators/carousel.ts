/**
 * Carousel Copy Generator
 * Generates slide-by-slide copy for Instagram carousels
 *
 * Story 2.2: Carousel Copy Generator (Epic 2)
 */

import { randomUUID } from 'crypto';
import { ContentPlanPost, ContentMode } from '@api/types/content';
import { BrandProfile } from '@copyzen/shared/types';
import { llmAdapter } from "../../../utils/llm-adapter.js";
import { logger } from "../../../utils/logger.js";

export interface CarouselSlide {
  slide_number: number;
  main_text: string; // max 150 chars
  support_text?: string; // max 100 chars
  design_note: string;
  is_cover: boolean;
  is_cta: boolean;
}

export interface Carousel {
  id: string;
  plan_item_id: string;
  brand_profile_id: string;
  client_id: string;
  mode: ContentMode;
  slides: CarouselSlide[];
  caption: string;
  design_brief: string;
  created_at: string;
  updated_at: string;
}

export interface CarouselOptions {
  slide_count?: number; // 4-8, default 6
  style?: 'educational' | 'promotional' | 'narrative';
}

const DEFAULT_OPTIONS: CarouselOptions = {
  slide_count: 6,
  style: 'narrative',
};

/**
 * Generate carousel slides from a content plan item
 */
export async function generateCarousel(
  planItem: ContentPlanPost,
  brandProfile: BrandProfile,
  clientId: string,
  options?: Partial<CarouselOptions>
): Promise<Carousel> {
  // Merge with defaults
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Validation
  if (mergedOptions.slide_count! < 4 || mergedOptions.slide_count! > 8) {
    throw new Error(`Invalid slide_count: ${mergedOptions.slide_count}. Must be between 4 and 8.`);
  }

  logger.info('Carousel generation started', {
    plan_item_id: planItem.id,
    mode: planItem.mode,
    slide_count: mergedOptions.slide_count,
  });

  // Build LLM prompt
  const prompt = buildCarouselPrompt(planItem, brandProfile, mergedOptions);

  let slides: CarouselSlide[] = [];
  let caption = '';
  let designBrief = '';
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
        slides: Array<{
          number: number;
          main_text: string;
          support_text?: string;
          design_note: string;
        }>;
        caption: string;
        design_brief: string;
      };

      // Validate and transform slides
      slides = parsed.slides.map((slide, index) => ({
        slide_number: index + 1,
        main_text: slide.main_text.substring(0, 150),
        support_text: slide.support_text?.substring(0, 100),
        design_note: slide.design_note,
        is_cover: index === 0,
        is_cta: index === parsed.slides.length - 1,
      }));

      caption = parsed.caption;
      designBrief = parsed.design_brief;

      // Validate structure
      if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error('Invalid slides array from LLM');
      }

      // Accept within range of requested count (LLM may generate slightly different count)
      const requestedCount = mergedOptions.slide_count!;
      if (slides.length < requestedCount - 1 || slides.length > requestedCount + 1) {
        logger.warn('Slide count mismatch from LLM', {
          requested: requestedCount,
          generated: slides.length,
        });
        // Continue anyway - LLM sometimes generates off by 1
      }

      logger.info('Carousel generated successfully', {
        plan_item_id: planItem.id,
        slide_count: slides.length,
        attempt: attempts,
      });

      break;
    } catch (error) {
      logger.error('Carousel generation failed', {
        error: String(error),
        attempt: attempts,
      });

      if (attempts >= maxRetries) {
        throw new Error(`Failed to generate carousel after ${attempts} attempts`);
      }
    }
  }

  // Create carousel object
  const carousel: Carousel = {
    id: randomUUID(),
    plan_item_id: planItem.id!,
    brand_profile_id: brandProfile.id,
    client_id: clientId,
    mode: planItem.mode,
    slides,
    caption,
    design_brief: designBrief,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  logger.info('Carousel created successfully', {
    carousel_id: carousel.id,
    slide_count: carousel.slides.length,
    mode: carousel.mode,
  });

  return carousel;
}

function buildCarouselPrompt(
  planItem: ContentPlanPost,
  brandProfile: BrandProfile,
  options: CarouselOptions
): string {
  const modeDescription =
    planItem.mode === 'inception'
      ? 'Soft CTA (follow, save, share, learn more)'
      : 'Direct CTA to FunWheel funnel link';

  const styleGuide = `Use "${options.style}" style: ${
    options.style === 'educational'
      ? 'educational, informative, teach-based'
      : options.style === 'promotional'
        ? 'promotional, benefit-focused, persuasive'
        : 'narrative, story-driven, emotionally engaging'
  }`;

  return `Generate an Instagram carousel (${options.slide_count} slides) for the following post:

THEME: ${planItem.theme}
MODE: ${planItem.mode} (${modeDescription})
STYLE: ${styleGuide}

POST BRIEF: ${planItem.creative_brief}

BRAND GUIDELINES:
- Voice: ${brandProfile.voice_guidelines}
- Tone: Professional and ${planItem.mode === 'inception' ? 'educational' : 'urgent'}

CAROUSEL STRUCTURE:
1. Cover slide: Headline that stops scrolling (max 150 chars)
2-${(options.slide_count || 6) - 1}. Content slides: Educational/persuasive content with progression (max 150 chars main text)
${options.slide_count}. CTA slide: Clear call-to-action (max 150 chars)

Each slide must include:
- main_text: Primary message (max 150 characters)
- support_text: Optional supporting detail (max 100 characters)
- design_note: Visual suggestion (emoji + layout description, e.g. "📊 Charts with metrics")

OUTPUT FORMAT (valid JSON):
{
  "slides": [
    {
      "number": 1,
      "main_text": "...",
      "support_text": "...",
      "design_note": "..."
    }
  ],
  "caption": "Instagram caption with 5-8 relevant hashtags",
  "design_brief": "Overall visual direction (colors, style, mood)"
}

IMPORTANT:
- Respect character limits STRICTLY
- Ensure logical progression through slides
- For Inception: emphasize value, education, soft persuasion
- For Atração Fatal: create urgency, curiosity, curiosity gap
- Make caption engaging with relevant hashtags
- Design notes should be actionable for designer`;
}
