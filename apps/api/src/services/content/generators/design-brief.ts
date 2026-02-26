/**
 * Visual Design Brief Generator
 * Generates design briefs for carousel slides and static posts
 *
 * Story 2.4: Visual Design Brief Generator (Epic 2)
 */

import { randomUUID } from 'crypto';
import { BrandProfile } from '@shared/types';
import { Carousel } from './carousel';
import { StaticPost } from './static-post';
import { llmAdapter } from '../../../utils/llm-adapter';
import { logger } from '../../../utils/logger';

export interface ColorSpec {
  name: string;
  hex: string;
  usage: string;
}

export interface TypographyGuide {
  heading: string;
  body: string;
  accent?: string;
}

export interface CarouselSlideBrief {
  slide_number: number;
  design_note: string;
  composition: string;
  color_focus: string;
}

export interface DesignBriefCarousel {
  id: string;
  carousel_id: string;
  brand_profile_id: string;
  client_id: string;
  content_type: 'carousel';
  color_palette: ColorSpec[];
  typography: TypographyGuide;
  spacing_guidelines: string;
  layout_guidelines: string;
  imagery_style: string;
  slides_briefs: CarouselSlideBrief[];
  overall_aesthetic: string;
  created_at: string;
  updated_at: string;
}

export interface DesignBriefStaticPost {
  id: string;
  post_id: string;
  brand_profile_id: string;
  client_id: string;
  content_type: 'static-post';
  platform: 'instagram' | 'linkedin';
  color_palette: ColorSpec[];
  typography: TypographyGuide;
  image_composition: string;
  focal_point: string;
  text_overlay_guidelines: string;
  imagery_style: string;
  responsive_notes: string;
  created_at: string;
  updated_at: string;
}

export type DesignBrief = DesignBriefCarousel | DesignBriefStaticPost;

/**
 * Generate design brief for carousel
 */
export async function generateCarouselDesignBrief(
  carousel: Carousel,
  brandProfile: BrandProfile,
  clientId: string
): Promise<DesignBriefCarousel> {
  logger.info('Carousel design brief generation started', {
    carousel_id: carousel.id,
  });

  // Build LLM prompt
  const prompt = buildCarouselBriefPrompt(carousel, brandProfile);

  let colorPalette: ColorSpec[] = [];
  let typography: TypographyGuide = { heading: '', body: '' };
  let spacingGuidelines = '';
  let layoutGuidelines = '';
  let imageryStyle = '';
  let slidesBriefs: CarouselSlideBrief[] = [];
  let overallAesthetic = '';
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
        color_palette: Array<{ name: string; hex: string; usage: string }>;
        typography: { heading: string; body: string; accent?: string };
        spacing_guidelines: string;
        layout_guidelines: string;
        imagery_style: string;
        slides_briefs: Array<{
          slide_number: number;
          design_note: string;
          composition: string;
          color_focus: string;
        }>;
        overall_aesthetic: string;
      };

      colorPalette = parsed.color_palette || [];
      typography = parsed.typography || { heading: '', body: '' };
      spacingGuidelines = parsed.spacing_guidelines || '';
      layoutGuidelines = parsed.layout_guidelines || '';
      imageryStyle = parsed.imagery_style || '';
      slidesBriefs = parsed.slides_briefs || [];
      overallAesthetic = parsed.overall_aesthetic || '';

      // Validate structure
      if (!colorPalette.length || !typography.heading) {
        throw new Error('Invalid design brief structure from LLM');
      }

      logger.info('Carousel design brief generated successfully', {
        carousel_id: carousel.id,
        colors: colorPalette.length,
        slides: slidesBriefs.length,
      });

      break;
    } catch (error) {
      logger.error('Carousel design brief generation failed', {
        error: String(error),
        attempt: attempts,
      });

      if (attempts >= maxRetries) {
        throw new Error(`Failed to generate design brief after ${attempts} attempts`);
      }
    }
  }

  // Create design brief object
  const brief: DesignBriefCarousel = {
    id: randomUUID(),
    carousel_id: carousel.id,
    brand_profile_id: brandProfile.id,
    client_id: clientId,
    content_type: 'carousel',
    color_palette: colorPalette,
    typography,
    spacing_guidelines: spacingGuidelines,
    layout_guidelines: layoutGuidelines,
    imagery_style: imageryStyle,
    slides_briefs: slidesBriefs,
    overall_aesthetic: overallAesthetic,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  logger.info('Design brief created successfully', {
    brief_id: brief.id,
    content_type: brief.content_type,
  });

  return brief;
}

/**
 * Generate design brief for static post
 */
export async function generateStaticPostDesignBrief(
  post: StaticPost,
  brandProfile: BrandProfile,
  clientId: string
): Promise<DesignBriefStaticPost> {
  logger.info('Static post design brief generation started', {
    post_id: post.id,
    platform: post.platform,
  });

  // Build LLM prompt
  const prompt = buildStaticPostBriefPrompt(post, brandProfile);

  let colorPalette: ColorSpec[] = [];
  let typography: TypographyGuide = { heading: '', body: '' };
  let imageComposition = '';
  let focalPoint = '';
  let textOverlayGuidelines = '';
  let imageryStyle = '';
  let responsiveNotes = '';
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
        color_palette: Array<{ name: string; hex: string; usage: string }>;
        typography: { heading: string; body: string; accent?: string };
        image_composition: string;
        focal_point: string;
        text_overlay_guidelines: string;
        imagery_style: string;
        responsive_notes: string;
      };

      colorPalette = parsed.color_palette || [];
      typography = parsed.typography || { heading: '', body: '' };
      imageComposition = parsed.image_composition || '';
      focalPoint = parsed.focal_point || '';
      textOverlayGuidelines = parsed.text_overlay_guidelines || '';
      imageryStyle = parsed.imagery_style || '';
      responsiveNotes = parsed.responsive_notes || '';

      // Validate structure
      if (!colorPalette.length || !typography.heading) {
        throw new Error('Invalid design brief structure from LLM');
      }

      logger.info('Static post design brief generated successfully', {
        post_id: post.id,
        platform: post.platform,
        colors: colorPalette.length,
      });

      break;
    } catch (error) {
      logger.error('Static post design brief generation failed', {
        error: String(error),
        attempt: attempts,
      });

      if (attempts >= maxRetries) {
        throw new Error(`Failed to generate design brief after ${attempts} attempts`);
      }
    }
  }

  // Create design brief object
  const brief: DesignBriefStaticPost = {
    id: randomUUID(),
    post_id: post.id,
    brand_profile_id: brandProfile.id,
    client_id: clientId,
    content_type: 'static-post',
    platform: post.platform,
    color_palette: colorPalette,
    typography,
    image_composition: imageComposition,
    focal_point: focalPoint,
    text_overlay_guidelines: textOverlayGuidelines,
    imagery_style: imageryStyle,
    responsive_notes: responsiveNotes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  logger.info('Design brief created successfully', {
    brief_id: brief.id,
    content_type: brief.content_type,
  });

  return brief;
}

function buildCarouselBriefPrompt(carousel: Carousel, brandProfile: BrandProfile): string {
  const slideDescriptions = carousel.slides
    .map(
      (s) =>
        `Slide ${s.slide_number}: "${s.main_text}" (${s.design_note})`
    )
    .join('\n');

  return `Generate a comprehensive visual design brief for an Instagram carousel with ${carousel.slides.length} slides.

BRAND PROFILE:
- Voice: ${brandProfile.voiceGuidelines}
- Color Palette: ${JSON.stringify(brandProfile.colorPalette)}
- Font Recommendations: ${JSON.stringify(brandProfile.fontRecommendations)}

CAROUSEL CONTENT:
${slideDescriptions}

DESIGN BRIEF REQUIREMENTS:
1. Extract and specify color palette (primary, secondary, accent colors with hex codes)
2. Recommend typography (heading, body, accent fonts with sizes)
3. Provide spacing and layout guidelines
4. Suggest imagery style aligned with brand voice
5. Create per-slide design notes with composition and color focus
6. Provide overall aesthetic direction

COLOR PALETTE FORMAT:
- Include 3-5 colors (primary, secondary, accent, neutral, background)
- Each must have hex code and clear usage description

TYPOGRAPHY:
- Heading font (recommended size 24-32px)
- Body font (recommended size 14-16px)
- Optional accent font for special emphasis

OUTPUT FORMAT (valid JSON):
{
  "color_palette": [
    {"name": "Primary", "hex": "#000000", "usage": "Headlines, CTAs"},
    ...
  ],
  "typography": {
    "heading": "Font name, weight, size",
    "body": "Font name, weight, size",
    "accent": "Optional font"
  },
  "spacing_guidelines": "Padding, margins, gaps between elements",
  "layout_guidelines": "Grid system, alignment, responsive breakpoints",
  "imagery_style": "Photography style, illustration approach, mood, lighting",
  "slides_briefs": [
    {
      "slide_number": 1,
      "design_note": "Visual suggestion with emoji",
      "composition": "Rule of thirds, focal point placement",
      "color_focus": "Which colors dominate this slide"
    }
  ],
  "overall_aesthetic": "Cohesive visual direction across all slides"
}

IMPORTANT:
- Ensure color harmony and brand consistency
- Make all recommendations actionable for designers
- Include responsive design considerations
- Use specific hex codes, not color names`;
}

function buildStaticPostBriefPrompt(post: StaticPost, brandProfile: BrandProfile): string {
  const platformContext =
    post.platform === 'instagram'
      ? 'Instagram (1080x1350px portrait, 1080x1080px square, or 1200x628px landscape)'
      : 'LinkedIn (1200x627px or 1200x1500px vertical)';

  return `Generate a comprehensive visual design brief for a ${post.platform} static post.

BRAND PROFILE:
- Voice: ${brandProfile.voiceGuidelines}
- Color Palette: ${JSON.stringify(brandProfile.colorPalette)}
- Font Recommendations: ${JSON.stringify(brandProfile.fontRecommendations)}

POST CONTENT:
- Platform: ${post.platform}
- Text: "${post.main_text}"
- Hashtags: ${post.hashtags.join(', ')}
- Design Note: ${post.design_note}

DESIGN BRIEF REQUIREMENTS:
1. Extract and specify color palette (primary, secondary, accent colors with hex codes)
2. Recommend typography (heading, body, accent fonts with sizes)
3. Describe image composition and layout
4. Identify focal point and visual hierarchy
5. Provide text overlay guidelines if applicable
6. Suggest imagery style aligned with brand voice
7. Include responsive/scaling notes for different aspect ratios

PLATFORM SPECIFICATIONS:
${platformContext}

OUTPUT FORMAT (valid JSON):
{
  "color_palette": [
    {"name": "Primary", "hex": "#000000", "usage": "Headlines, CTAs"},
    ...
  ],
  "typography": {
    "heading": "Font name, weight, size",
    "body": "Font name, weight, size",
    "accent": "Optional font"
  },
  "image_composition": "Detailed layout description with element positioning",
  "focal_point": "What draws the eye first, where to place hero image",
  "text_overlay_guidelines": "How text should layer over image (opacity, positioning, background)",
  "imagery_style": "Photography style, mood, lighting, color temperature",
  "responsive_notes": "How design adapts to different aspect ratios and sizes"
}

IMPORTANT:
- Ensure color harmony and brand consistency
- Make all recommendations actionable for designers
- Text must be legible over background image
- Include contrast ratios for accessibility
- Consider mobile-first design
- Use specific hex codes, not color names`;
}
